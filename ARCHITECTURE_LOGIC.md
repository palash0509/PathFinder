# Architecture & Logic Documentation

This document provides a technical overview of the pathfinding algorithms implemented in this project, their core logic, and their integration into the application.

## 1. Algorithm Codebase Map

This section maps out the key locations for algorithm implementation and UI interaction.

- **Algorithm Implementation & Logic:**
  - **File:** `src/lib/searchAlgorithms.ts`
  - **Core Functions:**
    - `bfs` (Breadth-First Search): line `48`
    - `dfs` (Depth-First Search): line `86`
    - `ucs` (Uniform Cost Search): line `128`
    - `greedy` (Greedy Best-First Search): line `175`
    - `aStar` (A* Search): line `214`

- **UI Integration & State Management:**
  - **File:** `src/pages/Index.tsx`
  - **Primary Trigger:**
    - The `runAlgorithm` function at line `105` is called when the user clicks the "Visualize" button. It retrieves the selected algorithm's function from the `algorithms` object and executes it.
  - **State Management:**
    - The active algorithm is managed by the `algorithm` state variable, initialized with `useState` on line `42`.
    - The algorithm is selected by the user via a `Select` component defined on line `181`, which updates the `algorithm` state.

## 2. Algorithm Logic & Behavior

This section details the core logic of each algorithm and explains its corresponding visual behavior.

### Breadth-First Search (BFS)

- **Core Logic Snippet (`src/lib/searchAlgorithms.ts`):**
  ```typescript
  while (queue.length > 0) {
    const current = queue.shift()!;
    // ...
    for (const n of getNeighbors(current, rows, cols)) {
      if (!visited.has(key) && grid[n.row][n.col] !== 'wall') {
        // ...
        queue.push(n);
      }
    }
  }
  ```
- **Technical Explanation:**
  BFS uses a **Queue** data structure (First-In, First-Out). It explores all neighbors of the current node before moving to the next level of neighbors. This results in a visual "ripple" effect, expanding outward uniformly from the start point. Because it explores layer by layer, it is guaranteed to find the shortest path in an unweighted grid.

### Depth-First Search (DFS)

- **Core Logic Snippet (`src/lib/searchAlgorithms.ts`):**
  ```typescript
  while (stack.length > 0) {
    const current = stack.pop()!;
    // ...
    for (const n of getNeighbors(current, rows, cols)) {
      if (!visited.has(nk) && grid[n.row][n.col] !== 'wall') {
        // ...
        stack.push(n);
      }
    }
  }
  ```
- **Technical Explanation:**
  DFS uses a **Stack** data structure (Last-In, First-Out). It explores as far as possible down one path before backtracking. This causes the visual effect of it "plunging" deep into the maze in one direction, then backing up and trying another path. This aggressive, single-path exploration means it is not guaranteed to find the shortest path.

### Uniform Cost Search (UCS)

- **Core Logic Snippet (`src/lib/searchAlgorithms.ts`):**
  ```typescript
  const pq: PQItem[] = [{ pos: start, priority: 0 }];
  // ...
  while (pq.length > 0) {
    const { pos: current } = pq.shift()!;
    // ...
    const newCost = (cost.get(key) || 0) + 1;
    if (!cost.has(nk) || newCost < cost.get(nk)!) {
        // ...
        pqPush(pq, { pos: n, priority: newCost });
    }
  }
  ```
- **Technical Explanation:**
  UCS uses a **Priority Queue** ordered by the cumulative cost from the start node (`g-cost`). It is essentially Dijkstra's algorithm. It systematically explores the node with the lowest path cost so far. This creates a visual effect similar to BFS, but it will prioritize lower-cost paths if the grid were weighted, ensuring it always finds the absolute shortest (least costly) path.

### Greedy Best-First Search

- **Core Logic Snippet (`src/lib/searchAlgorithms.ts`):**
  ```typescript
  const pq: PQItem[] = [{ pos: start, priority: heuristic(start, end) }];
  // ...
  while (pq.length > 0) {
    // ...
    for (const n of getNeighbors(current, rows, cols)) {
      if (!visited.has(nk) && grid[n.row][n.col] !== 'wall') {
        // ...
        pqPush(pq, { pos: n, priority: heuristic(n, end) });
      }
    }
  }
  ```
- **Technical Explanation:**
  Greedy Best-First Search uses a **Priority Queue** ordered only by the estimated distance to the end node (the heuristic, or `h-cost`). It ignores the cost already traveled (`g-cost`). This makes it "greedy" as it always expands the node that appears to be closest to the goal. Visually, this creates a very direct, aggressive path toward the target, but it can be easily fooled by dead ends and is not guaranteed to find the shortest path.

### A* Search

- **Core Logic Snippet (`src/lib/searchAlgorithms.ts`):**
  ```typescript
  const gScore = new Map<string, number>();
  gScore.set(posKey(start), 0);
  const pq: PQItem[] = [{ pos: start, priority: heuristic(start, end) }];
  // ...
  while (pq.length > 0) {
    // ...
    const tentG = currentG + 1;
    if (!gScore.has(nk) || tentG < gScore.get(nk)!) {
        gScore.set(nk, tentG);
        // ...
        pqPush(pq, { pos: n, priority: tentG + heuristic(n, end) });
    }
  }
  ```
- **Technical Explanation:**
  A* Search uses a **Priority Queue** ordered by the sum of the path cost from the start (`g-cost`) and the estimated heuristic cost to the end (`h-cost`). The evaluation function is `f(n) = g(n) + h(n)`. This allows A* to balance exploration of low-cost paths (like UCS) with a directed search toward the goal (like Greedy BFS). This balance makes it both efficient and guaranteed to find the shortest path, provided the heuristic is admissible (never overestimates the true cost).

## 3. Algorithm Comparison Matrix

| Algorithm | Time Complexity | Space Complexity | Guaranteed Shortest Path | Core Data Structure |
| :--- | :--- | :--- | :--- | :--- |
| Breadth-First Search | `O(V + E)` | `O(V)` | Yes (unweighted) | Queue |
| Depth-First Search | `O(V + E)` | `O(V)` | No | Stack |
| Uniform Cost Search | `O((V+E) log V)` | `O(V)` | Yes | Priority Queue |
| Greedy Best-First Search| `O(V log V)` | `O(V)` | No | Priority Queue |
| A* Search | `O((V+E) log V)` | `O(V)` | Yes (admissible heuristic) | Priority Queue |

*Note: `V` = Vertices (nodes/cells), `E` = Edges (connections). In a grid, `E` is proportional to `V`.*
