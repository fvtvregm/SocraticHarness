import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

// Module-level constants — env vars don't change at runtime
const PDF_CS_URL = import.meta.env.VITE_PDF_CS_URL || '/roadmap.pdf';
const PDF_MATH_URL = import.meta.env.VITE_PDF_MATH_URL || '/math-roadmap.pdf';

interface PdfDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PdfDialog({ isOpen, onClose }: PdfDialogProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cs' | 'math'>('cs');
  const [viewType, setViewType] = useState<'pdf' | 'md'>('pdf');
  const [mdContent, setMdContent] = useState<string>('');
  const [loadingMd, setLoadingMd] = useState(false);

  const currentUrl =
    viewType === 'pdf'
      ? activeTab === 'cs'
        ? PDF_CS_URL
        : PDF_MATH_URL
      : activeTab === 'cs'
      ? '/roadmap.md'
      : '/math-roadmap.md';

  const openInNewTab = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (viewType === 'md') {
      const url = activeTab === 'cs' ? '/roadmap.md' : '/math-roadmap.md';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingMd(true);
      fetch(url)
        .then((res) => res.text())
        .then((text) => {
          setMdContent(text);
          setLoadingMd(false);
        })
        .catch((err) => {
          console.error(err);
          setMdContent('Failed to load markdown content.');
          setLoadingMd(false);
        });
    }
  }, [activeTab, viewType]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`flex flex-col p-6 border-white/10 bg-slate-900/98 backdrop-blur-xl transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 max-w-none w-screen h-screen rounded-none translate-x-0 translate-y-0 left-0 top-0'
            : 'max-w-[95vw] md:max-w-6xl h-[90vh]'
        }`}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 shrink-0">
          <div>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <span>📄</span> Roadmap Documents
            </DialogTitle>
            <p className="text-xs text-white/50 mt-1">
              View the original curriculum PDFs for reference.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="text-xs border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-xs border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white gap-1.5"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  Fullscreen
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4 flex flex-col">
          <Tabs
            defaultValue="cs"
            className="flex-1 flex flex-col min-h-0"
            onValueChange={(v) => setActiveTab(v as 'cs' | 'math')}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 shrink-0">
              <TabsList className="w-fit bg-white/5 border border-white/10 p-1 rounded-lg">
                <TabsTrigger
                  value="cs"
                  className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white font-medium text-xs px-4 py-1.5 rounded-md"
                >
                  CS &amp; AI Roadmap
                </TabsTrigger>
                <TabsTrigger
                  value="math"
                  className="data-[state=active]:bg-violet-500 data-[state=active]:text-white font-medium text-xs px-4 py-1.5 rounded-md"
                >
                  Mathematics Roadmap
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-lg self-center sm:self-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewType('pdf')}
                  className={`text-xs px-3 py-1 h-7 rounded-md font-medium transition-all ${
                    viewType === 'pdf' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  PDF View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewType('md')}
                  className={`text-xs px-3 py-1 h-7 rounded-md font-medium transition-all ${
                    viewType === 'md' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Markdown View
                </Button>
              </div>
            </div>

            <TabsContent value="cs" className="flex-1 min-h-0 mt-0">
              {viewType === 'pdf' ? (
                <iframe
                  src={PDF_CS_URL}
                  className="w-full h-full border border-white/10 rounded-lg bg-slate-950/50"
                  title="CS & AI Engineering Roadmap PDF"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full overflow-hidden">
                  {loadingMd ? (
                    <div className="flex items-center justify-center h-full text-white/50 text-xs">
                      Loading markdown file...
                    </div>
                  ) : (
                    <pre className="w-full h-full p-4 border border-white/10 rounded-lg bg-slate-950/70 text-slate-300 font-mono text-xs overflow-auto whitespace-pre-wrap leading-relaxed selection:bg-cyan-500/20 selection:text-cyan-200">
                      {mdContent}
                    </pre>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="math" className="flex-1 min-h-0 mt-0">
              {viewType === 'pdf' ? (
                <iframe
                  src={PDF_MATH_URL}
                  className="w-full h-full border border-white/10 rounded-lg bg-slate-950/50"
                  title="Mathematics Roadmap PDF"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full overflow-hidden">
                  {loadingMd ? (
                    <div className="flex items-center justify-center h-full text-white/50 text-xs">
                      Loading markdown file...
                    </div>
                  ) : (
                    <pre className="w-full h-full p-4 border border-white/10 rounded-lg bg-slate-950/70 text-slate-300 font-mono text-xs overflow-auto whitespace-pre-wrap leading-relaxed selection:bg-violet-500/20 selection:text-violet-200">
                      {mdContent}
                    </pre>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
