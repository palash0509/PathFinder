import { useCallback, useMemo } from 'react';
import type { CellType, CellState, Position, SearchStep } from '@/lib/searchAlgorithms';

interface GridProps {
  grid: CellType[][];
  step: SearchStep | null;
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
  isDrawing: boolean;
  onDrawStart: () => void;
  onDrawEnd: () => void;
}

const posKey = (r: number, c: number) => `${r},${c}`;

export default function Grid({ grid, step, onCellClick, onCellDrag, isDrawing, onDrawStart, onDrawEnd }: GridProps) {
  const visitedSet = useMemo(() => {
    if (!step) return new Set<string>();
    return new Set(step.visited.map(p => posKey(p.row, p.col)));
  }, [step]);

  const frontierSet = useMemo(() => {
    if (!step) return new Set<string>();
    return new Set(step.frontier.map(p => posKey(p.row, p.col)));
  }, [step]);

  const pathSet = useMemo(() => {
    if (!step) return new Set<string>();
    return new Set(step.path.map(p => posKey(p.row, p.col)));
  }, [step]);

  const getCellColor = useCallback((row: number, col: number): string => {
    const cellType = grid[row][col];
    if (cellType === 'start') return 'bg-cell-start shadow-[0_0_8px_hsl(var(--cell-start)/0.6)]';
    if (cellType === 'end') return 'bg-cell-end shadow-[0_0_8px_hsl(var(--cell-end)/0.6)]';
    if (cellType === 'wall') return 'bg-cell-wall';

    const key = posKey(row, col);
    if (pathSet.has(key)) return 'bg-cell-path shadow-[0_0_6px_hsl(var(--cell-path)/0.5)] scale-110';
    if (step?.current && step.current.row === row && step.current.col === col)
      return 'bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.7)] scale-125';
    if (frontierSet.has(key)) return 'bg-cell-frontier opacity-70';
    if (visitedSet.has(key)) return 'bg-cell-visited opacity-50';
    return 'bg-cell-empty hover:bg-secondary';
  }, [grid, step, visitedSet, frontierSet, pathSet]);

  return (
    <div
      className="inline-grid gap-px rounded-lg overflow-hidden border border-border p-1 bg-border"
      style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
      onMouseLeave={onDrawEnd}
    >
      {grid.map((row, r) =>
        row.map((_, c) => (
          <div
            key={`${r}-${c}`}
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-sm cursor-pointer transition-all duration-150 ${getCellColor(r, c)}`}
            onMouseDown={() => { onDrawStart(); onCellClick(r, c); }}
            onMouseUp={onDrawEnd}
            onMouseEnter={() => { if (isDrawing) onCellDrag(r, c); }}
          />
        ))
      )}
    </div>
  );
}
