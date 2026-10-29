import type { RoadmapNode } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Sparkles, BookOpen, PenTool, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Module-level — never rebuilt on render
const THEME_CLASSES = {
  cyan: {
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    focusBorder: 'group-hover:border-cyan-500/30 group-hover:text-cyan-400',
    checkAccent: 'data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500',
    stepLine: 'bg-cyan-500/10 group-hover:bg-cyan-500/25',
  },
  violet: {
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/5',
    text: 'text-violet-400',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    focusBorder: 'group-hover:border-violet-500/30 group-hover:text-violet-400',
    checkAccent: 'data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500',
    stepLine: 'bg-violet-500/10 group-hover:bg-violet-500/25',
  },
} as const;

interface DrillDownViewProps {
  phaseId: string;
  nodes: RoadmapNode[];
  getChildren: (parentId: string) => RoadmapNode[];
  onToggleChild: (childId: string, newState: boolean) => void;
  onSelectTopic: (node: RoadmapNode) => void;
  onBack: () => void;
}

export function DrillDownView({
  phaseId,
  nodes,
  getChildren,
  onToggleChild,
  onSelectTopic,
  onBack,
}: DrillDownViewProps) {
  const phase = nodes.find((n) => n.id === phaseId);
  if (!phase) return null;

  const topics = getChildren(phaseId);
  const completedTopics = topics.filter((t) => t.is_completed).length;
  const totalTopics = topics.length;
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const isPhaseCompleted = totalTopics > 0 && completedTopics === totalTopics;

  const accentColor = phase.track === 'cs' ? 'cyan' : 'violet';
  const trackLabel = phase.track === 'cs' ? 'Coding & Software Engineering' : 'Mathematics';

  const themeClasses = THEME_CLASSES[accentColor];

  const progressBadgeClasses = isPhaseCompleted
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : themeClasses.badge;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Navigation Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="w-fit gap-2 border-white/10 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Timelines</span>
        </Button>

        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border", themeClasses.badge)}>
            {trackLabel}
          </span>
          {isPhaseCompleted && (
            <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="size-3" />
              Phase Complete!
            </span>
          )}
        </div>
      </div>

      {/* Phase progress details card */}
      <div className={cn(
        "rounded-2xl border backdrop-blur-xl p-5 flex flex-col gap-4 shadow-xl",
        isPhaseCompleted 
          ? "border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-900/80 shadow-emerald-950/5"
          : "border-white/5 bg-slate-900/20"
      )}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
              {phase.title}
            </h2>
            <p className="text-xs text-white/40 mt-1">Mastery Track & Study Order</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={cn("text-xs font-mono font-bold", themeClasses.text)}>
              {completedTopics}/{totalTopics} Completed
            </span>
            <span className={cn("text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border", progressBadgeClasses)}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Focus Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r",
              isPhaseCompleted
                ? "from-emerald-500 to-teal-400"
                : accentColor === 'cyan'
                  ? "from-cyan-500 to-blue-500"
                  : "from-violet-500 to-purple-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Ordered Sequential Timeline List */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
            Chronological Study Path (Follow from Step 1 to {totalTopics}):
          </h3>
        </div>

        <div className="space-y-0 relative">
          {topics.map((topic, index) => {
            const isCompleted = topic.is_completed;
            return (
              <div key={topic.id} className="flex gap-4 relative group">
                {/* Timeline axis and connector column */}
                <div className="flex flex-col items-center shrink-0 w-8">
                  {/* Step number badge */}
                  <div className={cn(
                    "size-8 rounded-full border flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 z-10 bg-slate-950",
                    isCompleted
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/20"
                      : cn("border-white/10 text-white/45", themeClasses.focusBorder)
                  )}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Vertical connecting line */}
                  {index < topics.length - 1 && (
                    <div className={cn(
                      "w-[1.5px] flex-1 my-1 transition-all duration-300",
                      isCompleted ? "bg-emerald-500/20" : themeClasses.stepLine
                    )} />
                  )}
                </div>

                {/* Content card */}
                <div className="flex-1 pb-6">
                  <div className={cn(
                    "rounded-2xl border bg-slate-900/10 p-4 hover:bg-slate-900/20 transition-all duration-300 flex flex-col md:flex-row gap-4 items-start justify-between relative",
                    isCompleted
                      ? "border-emerald-500/10 bg-emerald-950/2/10"
                      : "border-white/5 hover:border-white/10"
                  )}>
                    {/* Checkbox and Text Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3">
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center shrink-0">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={(checked) => {
                              if (checked !== 'indeterminate') {
                                onToggleChild(topic.id, checked);
                              }
                            }}
                            className={cn("size-4 rounded-full transition-transform hover:scale-110", themeClasses.checkAccent)}
                          />
                        </div>
                        <h4 className={cn(
                          "text-sm font-bold tracking-wide transition-colors leading-none",
                          isCompleted ? "line-through text-white/35 font-normal" : "text-white/90"
                        )}>
                          {topic.title}
                        </h4>
                      </div>

                      {topic.how_to_learn && (
                        <div className="pl-7 pr-4">
                          <p className="text-xs text-white/50 leading-relaxed font-light font-sans whitespace-pre-line">
                            {topic.how_to_learn}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Meta Action Panel (Resource links + Notes button) */}
                    <div className="flex flex-wrap items-center gap-2 pl-7 md:pl-0 shrink-0 self-start md:self-center">
                      {topic.resource_link && (
                        <a
                          href={topic.resource_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all font-medium"
                        >
                          <BookOpen className="size-3 text-cyan-400" />
                          <span>Resource</span>
                          <ExternalLink className="size-2.5 text-white/30 shrink-0" />
                        </a>
                      )}

                      <Button
                        onClick={() => onSelectTopic(topic)}
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full border-white/10 hover:bg-white/5 text-xs px-3 py-1 flex items-center gap-1.5"
                      >
                        <PenTool className="size-3" />
                        <span>Log Notes</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
