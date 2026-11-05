import React, { useState } from 'react';
import { SequenceWithFeatures, SequenceFeatures } from '../../types/bio';
import { BarChart3, Info } from 'lucide-react';

interface Props {
  sequences: SequenceWithFeatures[];
  unknownFeatures?: SequenceFeatures;
  unknownSequenceName?: string;
}

export const CompositionComparisonChart: React.FC<Props> = ({
  sequences,
  unknownFeatures,
  unknownSequenceName = 'Unknown (ATGCGCGATC)',
}) => {
  const [metricMode, setMetricMode] = useState<'percent' | 'count'>('percent');
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const groupA = sequences.filter((s) => s.group === 'Group A');
  const groupB = sequences.filter((s) => s.group === 'Group B');

  // Compute averages
  const avg = (items: SequenceWithFeatures[], key: 'aCount' | 'tCount' | 'gCount' | 'cCount') => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, s) => acc + s.features[key], 0);
    return Math.round((sum / items.length) * 10) / 10;
  };

  const avgPct = (items: SequenceWithFeatures[], key: 'aCount' | 'tCount' | 'gCount' | 'cCount') => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, s) => acc + (s.features[key] / s.features.length) * 100, 0);
    return Math.round((sum / items.length) * 10) / 10;
  };

  const stats = {
    groupA: {
      A: metricMode === 'percent' ? avgPct(groupA, 'aCount') : avg(groupA, 'aCount'),
      T: metricMode === 'percent' ? avgPct(groupA, 'tCount') : avg(groupA, 'tCount'),
      G: metricMode === 'percent' ? avgPct(groupA, 'gCount') : avg(groupA, 'gCount'),
      C: metricMode === 'percent' ? avgPct(groupA, 'cCount') : avg(groupA, 'cCount'),
    },
    groupB: {
      A: metricMode === 'percent' ? avgPct(groupB, 'aCount') : avg(groupB, 'aCount'),
      T: metricMode === 'percent' ? avgPct(groupB, 'tCount') : avg(groupB, 'tCount'),
      G: metricMode === 'percent' ? avgPct(groupB, 'gCount') : avg(groupB, 'gCount'),
      C: metricMode === 'percent' ? avgPct(groupB, 'cCount') : avg(groupB, 'cCount'),
    },
    unknown: unknownFeatures
      ? {
          A:
            metricMode === 'percent'
              ? Math.round((unknownFeatures.aCount / unknownFeatures.length) * 1000) / 10
              : unknownFeatures.aCount,
          T:
            metricMode === 'percent'
              ? Math.round((unknownFeatures.tCount / unknownFeatures.length) * 1000) / 10
              : unknownFeatures.tCount,
          G:
            metricMode === 'percent'
              ? Math.round((unknownFeatures.gCount / unknownFeatures.length) * 1000) / 10
              : unknownFeatures.gCount,
          C:
            metricMode === 'percent'
              ? Math.round((unknownFeatures.cCount / unknownFeatures.length) * 1000) / 10
              : unknownFeatures.cCount,
        }
      : null,
  };

  const nucleotides = [
    { key: 'A', name: 'Adenine (A)', color: '#10B981', light: '#ECFDF5', border: '#059669' },
    { key: 'T', name: 'Thymine (T)', color: '#EF4444', light: '#FEF2F2', border: '#DC2626' },
    { key: 'G', name: 'Guanine (G)', color: '#F59E0B', light: '#FFFBEB', border: '#D97706' },
    { key: 'C', name: 'Cytosine (C)', color: '#3B82F6', light: '#EFF6FF', border: '#2563EB' },
  ] as const;

  const maxVal = metricMode === 'percent' ? 60 : 6;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Comparative Nucleotide Composition
            </h3>
            <p className="text-xs text-slate-500">
              Contrasting Group A vs Group B vs Unknown Sequence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('percent')}
            className={`px-3 py-1 rounded-md transition-all ${
              metricMode === 'percent'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Percentage (%)
          </button>
          <button
            onClick={() => setMetricMode('count')}
            className={`px-3 py-1 rounded-md transition-all ${
              metricMode === 'count'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Raw Base Count
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="pt-6 pb-2">
        <div className="grid grid-cols-4 gap-4 h-64 items-end relative border-b border-slate-200 px-4">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-slate-300 w-full"></div>
            <div className="border-b border-slate-300 w-full"></div>
            <div className="border-b border-slate-300 w-full"></div>
            <div className="border-b border-slate-300 w-full"></div>
          </div>

          {nucleotides.map((nuc) => {
            const valA = stats.groupA[nuc.key];
            const valB = stats.groupB[nuc.key];
            const valU = stats.unknown ? stats.unknown[nuc.key] : 0;

            const heightA = Math.min(100, (valA / maxVal) * 100);
            const heightB = Math.min(100, (valB / maxVal) * 100);
            const heightU = Math.min(100, (valU / maxVal) * 100);

            return (
              <div key={nuc.key} className="flex flex-col items-center h-full justify-end z-10 group">
                <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2.5 h-full">
                  {/* Group A Bar */}
                  <div
                    onMouseEnter={() => setHoveredSeries(`A-${nuc.key}`)}
                    onMouseLeave={() => setHoveredSeries(null)}
                    className="flex-1 max-w-[28px] bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all duration-300 relative cursor-pointer"
                    style={{ height: `${Math.max(4, heightA)}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 transition-opacity">
                      A: {valA}
                      {metricMode === 'percent' ? '%' : ''}
                    </div>
                  </div>

                  {/* Group B Bar */}
                  <div
                    onMouseEnter={() => setHoveredSeries(`B-${nuc.key}`)}
                    onMouseLeave={() => setHoveredSeries(null)}
                    className="flex-1 max-w-[28px] bg-indigo-600 hover:bg-indigo-700 rounded-t-md transition-all duration-300 relative cursor-pointer"
                    style={{ height: `${Math.max(4, heightB)}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 transition-opacity">
                      B: {valB}
                      {metricMode === 'percent' ? '%' : ''}
                    </div>
                  </div>

                  {/* Unknown Bar */}
                  {stats.unknown && (
                    <div
                      onMouseEnter={() => setHoveredSeries(`U-${nuc.key}`)}
                      onMouseLeave={() => setHoveredSeries(null)}
                      className="flex-1 max-w-[28px] bg-amber-500 hover:bg-amber-600 rounded-t-md transition-all duration-300 relative cursor-pointer ring-2 ring-amber-300/60"
                      style={{ height: `${Math.max(4, heightU)}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 transition-opacity">
                        Unk: {valU}
                        {metricMode === 'percent' ? '%' : ''}
                      </div>
                    </div>
                  )}
                </div>

                {/* X Axis Label */}
                <div className="mt-3 flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: nuc.color }}
                  ></span>
                  <span className="text-xs font-mono font-bold text-slate-800">{nuc.key}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Scientific Interpretation */}
      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
            <span>Group A (Avg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block"></span>
            <span>Group B (Avg)</span>
          </div>
          {stats.unknown && (
            <div className="flex items-center gap-1.5 font-medium text-amber-800">
              <span className="w-3 h-3 rounded-xs bg-amber-500 ring-2 ring-amber-300/60 inline-block"></span>
              <span>{unknownSequenceName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Notice Guanine (G) and Cytosine (C) dominance in Group B vs Group A.</span>
        </div>
      </div>
    </div>
  );
};
