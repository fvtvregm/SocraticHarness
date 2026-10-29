import { useCallback } from 'react';
import type { RoadmapNode } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';

interface PhaseNodeProps {
  node: RoadmapNode;
  children: RoadmapNode[];
  onToggleParent: (parentId: string, newState: boolean) => void;
  onSelectNode: (node: RoadmapNode) => void;
  accentColor: 'cyan' | 'violet';
}

// Hoisted outside the component — never rebuilds on render
const ACCENT_CLASSES = {
  cyan: {
    border: 'border-cyan-500/20 hover:border-cyan-400/40',
    bg: 'bg-cyan-500/5 hover:bg-cyan-500/10',
    text: 'text-cyan-400',
    checkAccent: 'data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  violet: {
    border: 'border-violet-500/20 hover:border-violet-400/40',
    bg: 'bg-violet-500/5 hover:bg-violet-500/10',
    text: 'text-violet-400',
    checkAccent: 'data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
} as const;

export function PhaseNode({
  node,
  children,
  onToggleParent,
  onSelectNode,
  accentColor,
}: PhaseNodeProps) {
  const completedCount = children.filter((c) => c.is_completed).length;
  const totalCount = children.length;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  const accentClasses = ACCENT_CLASSES[accentColor];

  const completedBadgeClasses = isAllCompleted
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : accentClasses.badge;

  const handleParentCheck = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (checked === 'indeterminate') return;
      onToggleParent(node.id, checked);
    },
    [node.id, onToggleParent]
  );

  return (
    <div
      className={cn(
        "rounded-full border backdrop-blur-md px-4 py-2 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer select-none",
        accentClasses.border,
        accentClasses.bg,
        node.is_completed && "opacity-90"
      )}
      onClick={() => onSelectNode(node)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox wrapper with stopPropagation to prevent drill-down navigation */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center shrink-0"
        >
          <Checkbox
            checked={node.is_completed}
            onCheckedChange={handleParentCheck}
            className={cn("size-4 rounded-full transition-transform hover:scale-110", accentClasses.checkAccent)}
          />
        </div>

        <span
          className={cn(
            "text-xs font-semibold text-white/90 truncate flex-1 tracking-wide",
            node.is_completed && "line-through text-white/35 font-normal"
          )}
        >
          {node.title}
        </span>
      </div>

      {/* Progress Badge */}
      <span className={cn(
        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0",
        completedBadgeClasses
      )}>
        {completedCount}/{totalCount}
      </span>
    </div>
  );
}
