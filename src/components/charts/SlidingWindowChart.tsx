import React, { useState } from 'react';
import { SequenceWithFeatures } from '../../types/bio';
import { calculateSlidingWindowGC } from '../../utils/bioMath';
import { Activity, ZoomIn } from 'lucide-react';

interface Props {
  sequences: SequenceWithFeatures[];
  unknownSeq?: string;
}

export const SlidingWindowChart: React.FC<Props> = ({
  sequences,
  unknownSeq = 'ATGCGCGATC',
}) => {
  const [selectedSeqId, setSelectedSeqId] = useState<string>('unknown');
  const [windowSize, setWindowSize] = useState<number>(3);
  const [hoveredPos, setHoveredPos] = useState<{ position: number; gcPercent: number; gcSkew: number; subseq: string } | null>(null);

  const currentSeq =
    selectedSeqId === 'unknown'
      ? { id: 'unknown', name: 'Unknown (ATGCGCGATC)', sequence: unknownSeq }
      : sequences.find((s) => s.id === selectedSeqId) || { id: 'unknown', name: 'Unknown', sequence: unknownSeq };

  const windowData = calculateSlidingWindowGC(currentSeq.sequence, windowSize);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Base-by-Base Sliding Window & GC Skew
            </h3>
            <p className="text-xs text-slate-500">
              Inspect localized GC enrichment along the nucleotide chain
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Target Sequence Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-slate-500">Sequence:</span>
            <select
              value={selectedSeqId}
              onChange={(e) => setSelectedSeqId(e.target.value)}
              aria-label="Target Sequence for Sliding Window"
              className="bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="unknown">Unknown Target ({unknownSeq})</option>
              {sequences.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}: {s.sequence} ({s.group})
                </option>
              ))}
            </select>
          </div>

          {/* Window size slider */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-slate-500">Window:</span>
            <span className="font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded text-[11px]">
              {windowSize} bp
            </span>
            <input
              type="range"
              min="2"
              max={Math.max(2, Math.min(8, currentSeq.sequence.length - 1))}
              value={windowSize}
              onChange={(e) => setWindowSize(Number(e.target.value))}
              aria-label="Sliding Window Size"
              className="w-20 accent-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Sequence Overview Bar */}
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Nucleotide Chain ({currentSeq.sequence.length} bp):</span>
          <span className="font-mono text-[11px] text-slate-600">
            Window size: {windowSize} bp | Positions: 1 to {currentSeq.sequence.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 font-mono text-xs">
          {Array.from(currentSeq.sequence).map((base, idx) => {
            const isInsideHover =
              hoveredPos && idx >= hoveredPos.position - 1 && idx < hoveredPos.position - 1 + windowSize;

            const bgClass =
              base === 'A'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : base === 'T'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : base === 'G'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-blue-100 text-blue-800 border-blue-300';

            return (
              <div
                key={idx}
                className={`relative px-2 py-1 rounded border text-center font-bold transition-all ${bgClass} ${
                  isInsideHover ? 'ring-2 ring-teal-600 scale-110 z-10' : ''
                }`}
              >
                <span>{base}</span>
                <span className="block text-[8px] font-normal text-slate-500">{idx + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Line / Area Graph */}
      <div className="mt-5 h-48 relative border-b border-l border-slate-300 ml-8 mb-4">
        {/* Y Axis ticks */}
        <div className="absolute -left-8 top-0 text-[10px] text-slate-400 font-mono">100%</div>
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">50%</div>
        <div className="absolute -left-8 bottom-0 text-[10px] text-slate-400 font-mono">0%</div>

        {/* 50% baseline */}
        <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-slate-300"></div>

        {/* Points & Bars */}
        <div className="absolute inset-0 flex items-end justify-between px-4">
          {windowData.map((pt, i) => {
            const heightPct = pt.gcPercent;
            const isHovered = hoveredPos?.position === pt.position;

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredPos(pt)}
                onMouseLeave={() => setHoveredPos(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Vertical Guide Bar */}
                <div
                  className={`w-full max-w-[24px] rounded-t-sm transition-all duration-200 ${
                    pt.gcPercent >= 60
                      ? 'bg-teal-600/80 group-hover:bg-teal-700'
                      : pt.gcPercent >= 40
                      ? 'bg-teal-400/80 group-hover:bg-teal-500'
                      : 'bg-emerald-400/80 group-hover:bg-emerald-500'
                  } ${isHovered ? 'ring-2 ring-teal-800' : ''}`}
                  style={{ height: `${Math.max(4, heightPct)}%` }}
                ></div>

                {/* Point dot at top */}
                <div
                  className="w-2.5 h-2.5 rounded-full bg-white border-2 border-teal-700 absolute -translate-y-1/2 transition-transform group-hover:scale-130 shadow-xs"
                  style={{ bottom: `calc(${heightPct}% - 5px)` }}
                ></div>

                {/* X Position tick */}
                <span className="text-[10px] font-mono text-slate-500 mt-2">
                  P{pt.position}
                </span>

                {/* Hover Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded shadow-lg text-[10px] pointer-events-none whitespace-nowrap z-20 font-mono transition-opacity">
                  <div className="font-bold text-teal-300">Window: {pt.subseq}</div>
                  <div>GC: {pt.gcPercent}% | GC-Skew: {pt.gcSkew}</div>
                  <div className="text-slate-400 text-[9px]">Pos {pt.position} - {pt.position + windowSize - 1}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 px-2">
        <span className="font-mono text-[11px] text-slate-500">
          Showing GC% profile computed with a {windowSize}-base sliding window
        </span>
        {hoveredPos && (
          <span className="font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px]">
            Inspecting Window: <strong>{hoveredPos.subseq}</strong> (GC: {hoveredPos.gcPercent}%)
          </span>
        )}
      </div>
    </div>
  );
};
