import { useState } from 'react';
import { useRoadmapData } from '@/lib/data';
import { Header } from '@/components/Header';
import { TimelineView } from '@/components/TimelineView';
import { DrillDownView } from '@/components/DrillDownView';
import { DetailSheet } from '@/components/DetailSheet';
import { PdfDialog } from '@/components/PdfDialog';
import type { RoadmapNode } from '@/lib/types';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function App() {
  const {
    nodes,
    loading,
    isOnline,
    toggleParentNode,
    toggleChildNode,
    updateNotes,
    getChildren,
    getParentNodes,
  } = useRoadmapData();

  const [drillDownPhaseId, setDrillDownPhaseId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  // Handles clicking a node in the timeline
  const handleSelectNode = (node: RoadmapNode) => {
    // If it's a parent phase node, trigger the full-page drill down view
    if (!node.parent_id) {
      setDrillDownPhaseId(node.id);
    } else {
      // If it's a child topic, open the notes sheet directly
      setSelectedNode(node);
      setIsDetailOpen(true);
    }
  };



  // Find updated selectedNode from state to keep notes/status in sync when it changes
  const activeNode = selectedNode
    ? nodes.find((n) => n.id === selectedNode.id) || selectedNode
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Header */}
      <Header onOpenPdf={() => setIsPdfOpen(true)} />

      {/* Main content area */}
      <main className="flex-1 mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 className="size-10 text-cyan-400 animate-spin" />
            <p className="text-sm text-white/40 font-medium">Loading roadmap data...</p>
          </div>
        ) : drillDownPhaseId ? (
          <DrillDownView
            phaseId={drillDownPhaseId}
            nodes={nodes}
            getChildren={getChildren}
            onToggleChild={toggleChildNode}
            onSelectTopic={(topicNode) => {
              setSelectedNode(topicNode);
              setIsDetailOpen(true);
            }}
            onBack={() => setDrillDownPhaseId(null)}
          />
        ) : (
          /* Split timelines view */
          <TimelineView
            nodes={nodes}
            getParentNodes={getParentNodes}
            getChildren={getChildren}
            onToggleParent={toggleParentNode}
            onSelectNode={handleSelectNode}
          />
        )}
      </main>

      {/* Detail Slide Panel (Sheet) */}
      <DetailSheet
        node={activeNode}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        updateNotes={updateNotes}
      />

      {/* PDF View Modal */}
      <PdfDialog isOpen={isPdfOpen} onClose={() => setIsPdfOpen(false)} />

      {/* Connection status footer badge */}
      {!loading && (
        <div className="fixed bottom-4 right-4 z-40">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-lg backdrop-blur-md transition-all duration-300",
              isOnline
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}
          >
            {isOnline ? (
              <>
                <Cloud className="size-3.5" />
                <span>Synced to Supabase</span>
              </>
            ) : (
              <>
                <CloudOff className="size-3.5 animate-pulse" />
                <span>Offline Mode (Local Storage)</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
