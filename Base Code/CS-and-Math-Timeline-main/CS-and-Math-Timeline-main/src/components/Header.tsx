import { FileText } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  onOpenPdf: () => void;
}

export function Header({ onOpenPdf }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500">
            <span className="text-lg">🗺️</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Personal Timeline
            </h1>
            <p className="text-xs text-white/40 -mt-0.5">
              Dual-track progress tracker
            </p>
          </div>
        </div>

        <Button
          onClick={onOpenPdf}
          variant="outline"
          size="sm"
          className="gap-2 border-white/20 hover:border-cyan-400/40 hover:bg-cyan-400/5"
        >
          <FileText className="size-4" />
          <span className="hidden sm:inline">📄 View Raw PDFs</span>
          <span className="sm:hidden">📄 PDFs</span>
        </Button>
      </div>
    </header>
  );
}
