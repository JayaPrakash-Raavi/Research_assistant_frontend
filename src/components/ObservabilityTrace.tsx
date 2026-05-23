import { useRef, useEffect } from 'react';
import { Activity, Target, FileSpreadsheet } from 'lucide-react';
import type { RetrievalChunk } from '../types';

interface ObservabilityTraceProps {
  chunks: RetrievalChunk[];
  highlightedSource: { filename: string; page: number } | null;
}

export const ObservabilityTrace: React.FC<ObservabilityTraceProps> = ({
  chunks,
  highlightedSource
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const chunksCount = chunks.length;
  const maxScore = chunksCount > 0 ? Math.max(...chunks.map((c) => c.score)) : 0;

  // Auto-scroll and highlight matching card when highlightedSource changes
  useEffect(() => {
    if (highlightedSource && containerRef.current) {
      const match = containerRef.current.querySelector(
        `[data-filename="${highlightedSource.filename}"][data-page="${highlightedSource.page}"]`
      );
      if (match) {
        match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedSource]);

  return (
    <aside className="glass-panel-right w-[320px] flex flex-col h-full shrink-0 border-l border-border-color bg-bg-glass backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-border-color flex items-center gap-2 bg-bg-surface/30 shrink-0">
        <Activity className="w-4 h-4 text-accent-primary" />
        <h2 className="text-sm font-semibold text-white">Retrieval Tracing</h2>
      </div>

      {/* Observability Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-3 shrink-0">
        <div className="bg-bg-surface border border-border-color rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-mono text-accent-secondary">{chunksCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Chunks Retrieved</div>
        </div>
        <div className="bg-bg-surface border border-border-color rounded-xl p-3 text-center">
          <div className="text-xl font-bold font-mono text-accent-primary">{maxScore.toFixed(3)}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Max Cosine Score</div>
        </div>
      </div>

      {/* Trace Title */}
      <div className="px-4 py-2 border-b border-border-color shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Retrieved Source Chunks</span>
      </div>

      {/* Scrollable list of retrieved chunks */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chunksCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-2">
            <span className="text-base">🔍</span>
            <p className="text-xs text-center px-4">Submit a query to inspect vector database retrieval paths and chunks.</p>
          </div>
        ) : (
          chunks.map((chunk, index) => {
            const isHighlighted =
              highlightedSource?.filename === chunk.filename &&
              highlightedSource?.page === chunk.page_number;

            return (
              <div
                key={index}
                data-filename={chunk.filename}
                data-page={chunk.page_number}
                className={`bg-bg-surface border rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-300 ${
                  isHighlighted
                    ? 'border-accent-primary shadow-[0_0_12px_rgba(0,242,254,0.18)] scale-[1.01]'
                    : 'border-border-color hover:border-border-color/80'
                }`}
              >
                {/* Chunk Meta Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="text-[11px] font-semibold text-white flex items-center gap-1 min-w-0" title={chunk.filename}>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-accent-secondary shrink-0" />
                    <span className="truncate">{chunk.filename} (p. {chunk.page_number})</span>
                  </div>
                  <div className="text-[10px] font-semibold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                    <Target className="w-3.5 h-3.5" /> {chunk.score.toFixed(3)}
                  </div>
                </div>
                {/* Chunk text */}
                <div className="text-xs text-text-secondary leading-relaxed bg-bg-base/40 p-2.5 rounded-lg border border-border-color/40 select-text">
                  {chunk.text}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
export default ObservabilityTrace;
