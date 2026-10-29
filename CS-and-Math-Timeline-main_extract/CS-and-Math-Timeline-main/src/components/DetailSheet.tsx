import { useState } from 'react';
import type { RoadmapNode } from '@/lib/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Textarea } from './ui/textarea';
import { ExternalLink, BookOpen, PenTool, Lightbulb, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TIME_BLOCKS } from '@/lib/types';

interface DetailSheetProps {
  node: RoadmapNode | null;
  isOpen: boolean;
  onClose: () => void;
  updateNotes: (nodeId: string, notes: string) => void;
}

export function DetailSheet({ node, isOpen, onClose, updateNotes }: DetailSheetProps) {
  const [prevNodeState, setPrevNodeState] = useState<{ id: string; notes: string } | null>(null);
  const [localNotes, setLocalNotes] = useState('');

  if (node && (prevNodeState?.id !== node.id || prevNodeState?.notes !== node.notes)) {
    setPrevNodeState({ id: node.id, notes: node.notes || '' });
    setLocalNotes(node.notes || '');
  }

  if (!node) return null;

  const trackLabel = node.track === 'cs' ? 'Coding & AI' : 'Mathematics';

  const badgeClass = node.track === 'cs'
    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    : 'bg-violet-500/10 text-violet-400 border-violet-500/20';

  const headerGradient = node.track === 'cs'
    ? 'from-cyan-400 to-blue-400'
    : 'from-violet-400 to-purple-400';

  const focusRingClass = node.track === 'cs'
    ? 'focus-visible:ring-cyan-500 focus-visible:border-cyan-500/50'
    : 'focus-visible:ring-violet-500 focus-visible:border-violet-500/50';

  const timeBlockLabel = TIME_BLOCKS.find((tb) => tb.key === node.time_block)?.label || node.time_block;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalNotes(value);
    updateNotes(node.id, value);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto pr-8">
        <SheetHeader className="space-y-4 text-left">
          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border", badgeClass)}>
              {trackLabel}
            </span>
            <span className="text-[10px] text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Calendar className="size-3" />
              {timeBlockLabel}
            </span>
          </div>

          {/* Node Title */}
          <div>
            <SheetTitle className={cn(
              "text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent leading-snug",
              headerGradient
            )}>
              {node.title}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Details and notes for {node.title}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Resource Link Section */}
          {node.resource_link && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="size-3.5" />
                Resource
              </h4>
              <a
                href={node.resource_link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5",
                  "hover:bg-white/10 hover:border-white/20 transition-all group"
                )}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-medium text-white/80 truncate">
                    {node.resource_link.replace(/^https?:\/\/(www\.)?/, '')}
                  </p>
                </div>
                <ExternalLink className="size-4 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </a>
            </div>
          )}

          {/* How to Learn Section */}
          {node.how_to_learn && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="size-3.5 text-amber-400" />
                How to Learn
              </h4>
              <div className="p-4 rounded-lg border border-white/5 bg-white/2 backdrop-blur-md">
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line font-light">
                  {node.how_to_learn}
                </p>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2 flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="size-3.5" />
                My Notes
              </h4>
              <span className="text-[10px] text-white/30 font-mono">
                Auto-saves in background
              </span>
            </div>
            <Textarea
              value={localNotes}
              onChange={handleNotesChange}
              placeholder="Jot down notes, links, or progress thoughts here..."
              className={cn(
                "min-h-[250px] font-sans leading-relaxed focus-visible:ring-offset-0",
                focusRingClass
              )}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
