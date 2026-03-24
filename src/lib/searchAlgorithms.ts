export type CellType = 'empty' | 'wall' | 'start' | 'end';
export type CellState = 'unvisited' | 'visited' | 'frontier' | 'path';

export interface Position {
  row: number;
  col: number;
}

export interface SearchStep {
  visited: Position[];
  frontier: Position[];
  path: Position[];
  current: Position | null;
  done: boolean;
  found: boolean;
}

export interface SearchResult {
  steps: SearchStep[];
  totalVisited: number;
  pathLength: number;
  found: boolean;
}

function posKey(p: Position): string {
  return `${p.row},${p.col}`;
}

function getNeighbors(pos: Position, rows: number, cols: number): Position[] {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  return dirs
    .map(([dr,dc]) => ({ row: pos.row+dr, col: pos.col+dc }))
    .filter(p => p.row>=0 && p.row<rows && p.col>=0 && p.col<cols);
}

function reconstructPath(cameFrom: Map<string, Position>, end: Position): Position[] {
  const path: Position[] = [];
  let current: Position | undefined = end;
  while (current) {
    path.unshift(current);
    current = cameFrom.get(posKey(current));
  }
  return path;
}

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function bfs(grid: CellType[][], start: Position, end: Position): SearchResult {
  const rows = grid.length, cols = grid[0].length;
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();
  const queue: Position[] = [start];
  visited.add(posKey(start));
  const steps: SearchStep[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, end);
      steps.push({ visited: visitedArr, frontier: [...queue], path, current, done: true, found: true });
      return { steps, totalVisited: visited.size, pathLength: path.length, found: true };
    }

    for (const n of getNeighbors(current, rows, cols)) {
      const key = posKey(n);
      if (!visited.has(key) && grid[n.row][n.col] !== 'wall') {
        visited.add(key);
        cameFrom.set(key, current);
        queue.push(n);
      }
    }

    steps.push({ visited: visitedArr, frontier: [...queue], path: [], current, done: false, found: false });
  }

  const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });
  steps.push({ visited: visitedArr, frontier: [], path: [], current: null, done: true, found: false });
  return { steps, totalVisited: visited.size, pathLength: 0, found: false };
}

export function dfs(grid: CellType[][], start: Position, end: Position): SearchResult {
  const rows = grid.length, cols = grid[0].length;
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();
  const stack: Position[] = [start];
  const steps: SearchStep[] = [];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = posKey(current);
    if (visited.has(key)) continue;
    visited.add(key);
    const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, end);
      steps.push({ visited: visitedArr, frontier: [...stack], path, current, done: true, found: true });
      return { steps, totalVisited: visited.size, pathLength: path.length, found: true };
    }

    for (const n of getNeighbors(current, rows, cols)) {
      const nk = posKey(n);
      if (!visited.has(nk) && grid[n.row][n.col] !== 'wall') {
        cameFrom.set(nk, current);
        stack.push(n);
      }
    }

    steps.push({ visited: visitedArr, frontier: [...stack], path: [], current, done: false, found: false });
  }

  const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });
  steps.push({ visited: visitedArr, frontier: [], path: [], current: null, done: true, found: false });
  return { steps, totalVisited: visited.size, pathLength: 0, found: false };
}

interface PQItem { pos: Position; priority: number; }

function pqPush(pq: PQItem[], item: PQItem) {
  pq.push(item);
  pq.sort((a,b) => a.priority - b.priority);
}

export function ucs(grid: CellType[][], start: Position, end: Position): SearchResult {
  const rows = grid.length, cols = grid[0].length;
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();
  const cost = new Map<string, number>();
  const pq: PQItem[] = [{ pos: start, priority: 0 }];
  cost.set(posKey(start), 0);
  const steps: SearchStep[] = [];

  while (pq.length > 0) {
    const { pos: current } = pq.shift()!;
    const key = posKey(current);
    if (visited.has(key)) continue;
    visited.add(key);
    const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, end);
      steps.push({ visited: visitedArr, frontier: pq.map(i=>i.pos), path, current, done: true, found: true });
      return { steps, totalVisited: visited.size, pathLength: path.length, found: true };
    }

    for (const n of getNeighbors(current, rows, cols)) {
      const nk = posKey(n);
      if (!visited.has(nk) && grid[n.row][n.col] !== 'wall') {
        const newCost = (cost.get(key) || 0) + 1;
        if (!cost.has(nk) || newCost < cost.get(nk)!) {
          cost.set(nk, newCost);
          cameFrom.set(nk, current);
          pqPush(pq, { pos: n, priority: newCost });
        }
      }
    }

    steps.push({ visited: visitedArr, frontier: pq.map(i=>i.pos), path: [], current, done: false, found: false });
  }

  const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });
  steps.push({ visited: visitedArr, frontier: [], path: [], current: null, done: true, found: false });
  return { steps, totalVisited: visited.size, pathLength: 0, found: false };
}

export function greedy(grid: CellType[][], start: Position, end: Position): SearchResult {
  const rows = grid.length, cols = grid[0].length;
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();
  const pq: PQItem[] = [{ pos: start, priority: heuristic(start, end) }];
  const steps: SearchStep[] = [];

  while (pq.length > 0) {
    const { pos: current } = pq.shift()!;
    const key = posKey(current);
    if (visited.has(key)) continue;
    visited.add(key);
    const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, end);
      steps.push({ visited: visitedArr, frontier: pq.map(i=>i.pos), path, current, done: true, found: true });
      return { steps, totalVisited: visited.size, pathLength: path.length, found: true };
    }

    for (const n of getNeighbors(current, rows, cols)) {
      const nk = posKey(n);
      if (!visited.has(nk) && grid[n.row][n.col] !== 'wall') {
        cameFrom.set(nk, current);
        pqPush(pq, { pos: n, priority: heuristic(n, end) });
      }
    }

    steps.push({ visited: visitedArr, frontier: pq.map(i=>i.pos), path: [], current, done: false, found: false });
  }

  const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });
  steps.push({ visited: visitedArr, frontier: [], path: [], current: null, done: true, found: false });
  return { steps, totalVisited: visited.size, pathLength: 0, found: false };
}

export function aStar(grid: CellType[][], start: Position, end: Position): SearchResult {
  const rows = grid.length, cols = grid[0].length;
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();
  const gScore = new Map<string, number>();
  gScore.set(posKey(start), 0);
  const pq: PQItem[] = [{ pos: start, priority: heuristic(start, end) }];
  const steps: SearchStep[] = [];

  while (pq.length > 0) {
    const { pos: current } = pq.shift()!;
    const key = posKey(current);
    if (visited.has(key)) continue;
    visited.add(key);
    const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, end);
      steps.push({ visited: visitedArr, frontier: pq.map(i=>i.pos), path, current, done: true, found: true });
      return { steps, totalVisited: visited.size, pathLength: path.length, found: true };
    }

    const currentG = gScore.get(key) || 0;
    for (const n of getNeighbors(current, rows, cols)) {
      const nk = posKey(n);
      if (!visited.has(nk) && grid[n.row][n.col] !== 'wall') {
        const tentG = currentG + 1;
        if (!gScore.has(nk) || tentG < gScore.get(nk)!) {
          gScore.set(nk, tentG);
          cameFrom.set(nk, current);
          pqPush(pq, { pos: n, priority: tentG + heuristic(n, end) });
        }
      }
    }

    steps.push({ visited: visitedArr, frontier: pq.map(i=>i.pos), path: [], current, done: false, found: false });
  }

  const visitedArr = [...visited].map(k => { const [r,c] = k.split(',').map(Number); return {row:r,col:c}; });
  steps.push({ visited: visitedArr, frontier: [], path: [], current: null, done: true, found: false });
  return { steps, totalVisited: visited.size, pathLength: 0, found: false };
}

export const algorithms = {
  bfs: { name: 'BFS', fn: bfs, type: 'Uninformed' as const, description: 'Explores level by level. Guarantees shortest path.' },
  dfs: { name: 'DFS', fn: dfs, type: 'Uninformed' as const, description: 'Explores as deep as possible first. No shortest path guarantee.' },
  ucs: { name: 'UCS', fn: ucs, type: 'Uninformed' as const, description: 'Expands lowest-cost node. Guarantees optimal path.' },
  greedy: { name: 'Greedy Best-First', fn: greedy, type: 'Informed' as const, description: 'Uses heuristic only. Fast but not optimal.' },
  astar: { name: 'A*', fn: aStar, type: 'Informed' as const, description: 'Uses cost + heuristic. Optimal and efficient.' },
};

export type AlgorithmKey = keyof typeof algorithms;
