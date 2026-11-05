import React, { useState } from 'react';
import { SequenceWithFeatures } from '../../types/bio';
import { AlignLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  sequences: SequenceWithFeatures[];
  unknownSeq?: string;
}

export const SequenceAlignmentView: React.FC<Props> = ({
  sequences,
  unknownSeq = 'ATGCGCGATC',
}) => {
  const [filterGroup, setFilterGroup] = useState<'all' | 'Group A' | 'Group B'>('all');

  const filtered = sequences.filter((s) => (filterGroup === 'all' ? true : s.group === filterGroup));

  // Determine max sequence length
  const maxLen = Math.max(
    unknownSeq.length,
    ...sequences.map((s) => s.sequence.length)
  );

  // Compute position consensus
  const consensus: { base: string; pct: number }[] = [];
  for (let pos = 0; pos < maxLen; pos++) {
    const counts: Record<string, number> = { A: 0, T: 0, G: 0, C: 0 };
    let validCount = 0;
    for (const s of sequences) {
      if (pos < s.sequence.length) {
        counts[s.sequence[pos]] = (counts[s.sequence[pos]] || 0) + 1;
        validCount++;
      }
    }
    let topBase = '-';
    let topCount = 0;
    for (const [b, c] of Object.entries(counts)) {
      if (c > topCount) {
        topCount = c;
        topBase = b;
      }
    }
    consensus.push({
      base: topBase,
      pct: validCount > 0 ? Math.round((topCount / validCount) * 100) : 0,
    });
  }

  const renderBaseBadge = (base: string, isConsensus = false) => {
    let color = 'bg-slate-100 text-slate-500 border-slate-200';
    if (base === 'A') color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    else if (base === 'T') color = 'bg-rose-100 text-rose-800 border-rose-300';
    else if (base === 'G') color = 'bg-amber-100 text-amber-900 border-amber-300';
    else if (base === 'C') color = 'bg-blue-100 text-blue-800 border-blue-300';

    return (
      <span
        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded font-mono font-bold text-xs border ${color} ${
          isConsensus ? 'ring-1 ring-slate-400 font-extrabold' : ''
        }`}
      >
        {base}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
            <AlignLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Multiple Sequence Alignment & Polymorphism Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Positional nucleotide inspection and consensus conservation
            </p>
          </div>
        </div>

        {/* Group Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilterGroup('all')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterGroup === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            All Sequences ({sequences.length})
          </button>
          <button
            onClick={() => setFilterGroup('Group A')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterGroup === 'Group A' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Group A
          </button>
          <button
            onClick={() => setFilterGroup('Group B')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterGroup === 'Group B' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Group B
          </button>
        </div>
      </div>

      {/* Alignment Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 text-left">
              <th className="py-2 pr-3 min-w-[120px]">Sample ID</th>
              <th className="py-2 px-2 min-w-[80px]">Group</th>
              <th className="py-2 px-2 min-w-[60px]">GC%</th>
              <th className="py-2 px-2">
                <div className="flex gap-1">
                  {Array.from({ length: maxLen }).map((_, idx) => (
                    <span
                      key={idx}
                      className="w-7 sm:w-8 text-center font-mono text-slate-400 font-bold"
                    >
                      {idx + 1}
                    </span>
                  ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {/* Unknown Sequence Row - Pinned at top */}
            <tr className="bg-amber-50/70 border-b border-amber-200 font-medium">
              <td className="py-2.5 pr-3 font-mono font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Unknown Target
              </td>
              <td className="py-2.5 px-2">
                <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  Predicting
                </span>
              </td>
              <td className="py-2.5 px-2 font-mono font-bold text-amber-900">
                {Math.round(
                  ((Array.from(unknownSeq).filter((c) => c === 'G' || c === 'C').length /
                    unknownSeq.length) *
                    1000) /
                    10
                )}
                %
              </td>
              <td className="py-2.5 px-2">
                <div className="flex gap-1">
                  {Array.from(unknownSeq).map((base, idx) => (
                    <div key={idx} className="relative">
                      {renderBaseBadge(base, false)}
                    </div>
                  ))}
                </div>
              </td>
            </tr>

            {/* Training Samples Rows */}
            {filtered.map((seq) => {
              const isGroupA = seq.group === 'Group A';
              return (
                <tr key={seq.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 pr-3 font-mono font-semibold text-slate-800">
                    {seq.id} <span className="text-slate-400 font-normal">({seq.name})</span>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isGroupA
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}
                    >
                      {seq.group}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-mono text-slate-700 font-semibold">
                    {seq.features.gcPercent}%
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex gap-1">
                      {Array.from({ length: maxLen }).map((_, idx) => {
                        const base = idx < seq.sequence.length ? seq.sequence[idx] : '-';
                        return (
                          <div key={idx} className="relative">
                            {renderBaseBadge(base)}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Consensus Track Row */}
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-medium">
              <td className="py-2.5 pr-3 font-mono font-bold text-slate-800">
                Consensus
              </td>
              <td className="py-2.5 px-2 text-[10px] text-slate-500 font-mono">
                Cohort Mode
              </td>
              <td className="py-2.5 px-2 font-mono text-slate-600 text-[11px]">
                Conserved
              </td>
              <td className="py-2.5 px-2">
                <div className="flex gap-1">
                  {consensus.map((c, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      {renderBaseBadge(c.base, true)}
                      <span className="text-[9px] font-mono text-slate-500 mt-1">
                        {c.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Nucleotide Color Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-400 inline-block"></span>
            <span>A (Adenine)</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-xs bg-rose-100 border border-rose-400 inline-block"></span>
            <span>T (Thymine)</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-xs bg-amber-100 border border-amber-400 inline-block"></span>
            <span>G (Guanine)</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-xs bg-blue-100 border border-blue-400 inline-block"></span>
            <span>C (Cytosine)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Consensus percentage reflects position conservation across training sequences.
        </div>
      </div>
    </div>
  );
};
