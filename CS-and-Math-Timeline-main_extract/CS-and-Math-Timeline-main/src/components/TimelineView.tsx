import { useMemo, useRef, useEffect } from 'react';
import type { RoadmapNode, TimeBlock } from '@/lib/types';
import { TIME_BLOCKS } from '@/lib/types';
import { PhaseNode } from './PhaseNode';
import { cn } from '@/lib/utils';
import { Sigma, Code } from 'lucide-react';

interface TimelineColumnProps {
  timeBlock: { key: TimeBlock; label: string; icon: string };
  getParentNodes: (track: 'cs' | 'math', timeBlock: string) => RoadmapNode[];
  getChildren: (parentId: string) => RoadmapNode[];
  onToggleParent: (parentId: string, newState: boolean) => void;
  onSelectNode: (node: RoadmapNode) => void;
}

function TimelineColumn({
  timeBlock,
  getParentNodes,
  getChildren,
  onToggleParent,
  onSelectNode,
}: TimelineColumnProps) {
  // Coding Track info
  const csParents = getParentNodes('cs', timeBlock.key);
  const csChildren = csParents.flatMap((p) => getChildren(p.id));
  const csCompleted = csChildren.filter((c) => c.is_completed).length;
  const csTotal = csChildren.length;
  const isCsCompleted = csTotal > 0 && csCompleted === csTotal;

  // Mathematics Track info
  const mathParents = getParentNodes('math', timeBlock.key);
  const mathChildren = mathParents.flatMap((p) => getChildren(p.id));
  const mathCompleted = mathChildren.filter((c) => c.is_completed).length;
  const mathTotal = mathChildren.length;
  const isMathCompleted = mathTotal > 0 && mathCompleted === mathTotal;

  // Combined Track Info
  const totalCombined = csTotal + mathTotal;
  const completedCombined = csCompleted + mathCompleted;
  const overallProgress = totalCombined > 0 ? Math.round((completedCombined / totalCombined) * 100) : 0;
  const isPeriodCompleted = totalCombined > 0 && completedCombined === totalCombined;

  return (
    <div className="flex flex-col items-center w-[300px] sm:w-[360px] md:w-[400px] shrink-0 relative">
      {/* 💻 TOP SECTION: Coding Track */}
      <div className="w-full flex-1 flex flex-col justify-end pb-3">
        <div className={cn(
          "w-full rounded-2xl border backdrop-blur-md p-4 flex flex-col gap-2.5 transition-all duration-300 shadow-md",
          isCsCompleted 
            ? "border-emerald-500/20 bg-emerald-950/2"
            : "border-white/5 bg-slate-900/10 hover:border-cyan-500/20"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/10 pb-1.5 shrink-0">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Code className="size-3" /> Coding & AI
            </h4>
            <span className="text-[9px] font-mono text-cyan-400/85">
              {csCompleted}/{csTotal}
            </span>
          </div>

          {/* Phases list */}
          <div className="space-y-2">
            {csParents.map((parent) => (
              <PhaseNode
                key={parent.id}
                node={parent}
                children={getChildren(parent.id)}
                onToggleParent={onToggleParent}
                onSelectNode={onSelectNode}
                accentColor="cyan"
              />
            ))}
            {csParents.length === 0 && (
              <p className="text-[10px] text-white/20 italic text-center py-6">
                No milestones
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🔗 MIDDLE SECTION: Unified Axis & Connectors */}
      <div className="h-20 flex flex-col items-center justify-between relative z-10 shrink-0 w-full">
        {/* Top vertical connector */}
        <div className="w-[1.5px] h-6 bg-gradient-to-b from-cyan-500/30 to-cyan-500/5" />

        {/* Central period axis node badge */}
        <div className={cn(
          "px-3 py-1.5 rounded-full border flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-md transition-all duration-300 font-sans",
          isPeriodCompleted
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-950/20"
            : overallProgress > 0
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-950/20"
              : "bg-slate-900 border-white/10 text-white/70"
        )}>
          <span className="text-xs shrink-0">{timeBlock.icon}</span>
          <span className="text-[10px] font-bold tracking-wide whitespace-nowrap">
            {timeBlock.label.replace('Grade ', 'Gr. ')}
          </span>
          <span className="text-[9px] font-mono opacity-60">
            {overallProgress}%
          </span>
        </div>

        {/* Bottom vertical connector */}
        <div className="w-[1.5px] h-6 bg-gradient-to-t from-violet-500/30 to-violet-500/5" />
      </div>

      {/* 📐 BOTTOM SECTION: Math Track */}
      <div className="w-full flex-1 flex flex-col justify-start pt-3">
        <div className={cn(
          "w-full rounded-2xl border backdrop-blur-md p-4 flex flex-col gap-2.5 transition-all duration-300 shadow-md",
          isMathCompleted 
            ? "border-emerald-500/20 bg-emerald-950/2"
            : "border-white/5 bg-slate-900/10 hover:border-violet-500/20"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-violet-500/10 pb-1.5 shrink-0">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1">
              <Sigma className="size-3" /> Mathematics
            </h4>
            <span className="text-[9px] font-mono text-violet-400/85">
              {mathCompleted}/{mathTotal}
            </span>
          </div>

          {/* Phases list */}
          <div className="space-y-2">
            {mathParents.map((parent) => (
              <PhaseNode
                key={parent.id}
                node={parent}
                children={getChildren(parent.id)}
                onToggleParent={onToggleParent}
                onSelectNode={onSelectNode}
                accentColor="violet"
              />
            ))}
            {mathParents.length === 0 && (
              <p className="text-[10px] text-white/20 italic text-center py-6">
                No milestones
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimelineViewProps {
  nodes: RoadmapNode[];
  getParentNodes: (track: 'cs' | 'math', timeBlock: string) => RoadmapNode[];
  getChildren: (parentId: string) => RoadmapNode[];
  onToggleParent: (parentId: string, newState: boolean) => void;
  onSelectNode: (node: RoadmapNode) => void;
}

export function TimelineView({
  nodes,
  getParentNodes,
  getChildren,
  onToggleParent,
  onSelectNode,
}: TimelineViewProps) {
  // Memoized track progress — only recomputes when nodes change
  const { csProgress, mathProgress } = useMemo(() => {
    const csChildren = nodes.filter((n) => n.track === 'cs' && n.parent_id);
    const mathChildren = nodes.filter((n) => n.track === 'math' && n.parent_id);
    return {
      csProgress: csChildren.length > 0
        ? Math.round(csChildren.filter((n) => n.is_completed).length / csChildren.length * 100)
        : 0,
      mathProgress: mathChildren.length > 0
        ? Math.round(mathChildren.filter((n) => n.is_completed).length / mathChildren.length * 100)
        : 0,
    };
  }, [nodes]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheelEvent = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.35;
      }
    };

    el.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Overall Progress Panel */}
      <div className="w-full rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-md p-5 flex flex-col md:flex-row gap-6 items-center justify-between shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🗺️</span> Evan's Timeline
          </h2>
          <p className="text-xs text-white/40 mt-1">
            Traverse parallel milestones. Scroll horizontally with your mouse wheel or trackpad.
          </p>
        </div>

        {/* Global Track Progress Badges */}
        <div className="flex gap-4 shrink-0 text-xs font-mono font-medium text-white/60">
          <div className="flex items-center gap-1.5 bg-cyan-500/5 border border-cyan-500/10 px-3 py-1.5 rounded-full">
            <Code className="size-3.5 text-cyan-400" />
            <span>Coding: <strong className="text-cyan-400">{csProgress}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-violet-500/5 border border-violet-500/10 px-3 py-1.5 rounded-full">
            <Sigma className="size-3.5 text-violet-400" />
            <span>Math: <strong className="text-violet-400">{mathProgress}%</strong></span>
          </div>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="w-full border border-white/5 bg-slate-900/5 p-6 rounded-3xl overflow-hidden relative shadow-inner">
        {/* Horizontal lane indicators (background guides) */}
        <div className="absolute top-4 left-6 text-[9px] font-bold uppercase tracking-widest text-cyan-500/35 select-none">
          💻 Coding Lane
        </div>
        <div className="absolute bottom-4 left-6 text-[9px] font-bold uppercase tracking-widest text-violet-500/35 select-none">
          📐 Math Lane
        </div>

        {/* Horizontal Scroll Area */}
        <div 
          ref={scrollContainerRef}
          className="w-full overflow-x-auto pb-4 pt-4 scrollbar-none select-none relative z-10"
        >
          {/* Horizontal timeline axis line behind badges (exactly centered vertically) */}
          <div className="absolute top-1/2 left-10 right-10 h-[1.5px] bg-gradient-to-r from-cyan-500/20 via-slate-500/20 to-violet-500/20 -translate-y-1/2 z-0" />

          {/* Columns list */}
          <div className="flex gap-8 px-6 pb-2 min-w-max">
            {TIME_BLOCKS.map((tb) => (
              <TimelineColumn
                key={tb.key}
                timeBlock={tb}
                getParentNodes={getParentNodes}
                getChildren={getChildren}
                onToggleParent={onToggleParent}
                onSelectNode={onSelectNode}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
