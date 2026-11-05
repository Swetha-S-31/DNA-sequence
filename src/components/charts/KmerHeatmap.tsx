import React, { useState } from 'react';
import { SequenceWithFeatures, SequenceFeatures } from '../../types/bio';
import { getDinucleotideFrequencies } from '../../utils/bioMath';
import { Grid, Sparkles } from 'lucide-react';

interface Props {
  sequences: SequenceWithFeatures[];
  unknownSeq?: string;
}

export const KmerHeatmap: React.FC<Props> = ({ sequences, unknownSeq = 'ATGCGCGATC' }) => {
  const [viewMode, setViewMode] = useState<'groupA' | 'groupB' | 'diff' | 'unknown'>('diff');

  const bases = ['A', 'C', 'G', 'T'];

  const groupA = sequences.filter((s) => s.group === 'Group A');
  const groupB = sequences.filter((s) => s.group === 'Group B');

  const computeAvgFreqs = (subset: SequenceWithFeatures[]) => {
    const sumMap: Record<string, number> = {};
    if (subset.length === 0) return sumMap;

    for (const s of subset) {
      const f = getDinucleotideFrequencies(s.sequence);
      for (const [k, v] of Object.entries(f)) {
        sumMap[k] = (sumMap[k] || 0) + v;
      }
    }

    const avgMap: Record<string, number> = {};
    for (const [k, v] of Object.entries(sumMap)) {
      avgMap[k] = Math.round((v / subset.length) * 10) / 10;
    }
    return avgMap;
  };

  const freqsA = computeAvgFreqs(groupA);
  const freqsB = computeAvgFreqs(groupB);
  const freqsUnknown = getDinucleotideFrequencies(unknownSeq);

  const getHeatmapColor = (val: number, isDiff = false) => {
    if (isDiff) {
      if (val > 0.5) return 'bg-indigo-600 text-white font-bold';
      if (val > 0.1) return 'bg-indigo-300 text-indigo-950 font-semibold';
      if (val < -0.5) return 'bg-emerald-600 text-white font-bold';
      if (val < -0.1) return 'bg-emerald-300 text-emerald-950 font-semibold';
      return 'bg-slate-100 text-slate-600';
    }

    if (val >= 2.0) return 'bg-blue-700 text-white font-bold';
    if (val >= 1.2) return 'bg-blue-500 text-white font-semibold';
    if (val >= 0.6) return 'bg-blue-300 text-blue-950 font-medium';
    if (val > 0) return 'bg-blue-100 text-blue-900';
    return 'bg-slate-50 text-slate-400';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Dinucleotide (2-mer) Spectrum Heatmap
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of all 16 consecutive pairs (AA, AC ... TT)
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setViewMode('diff')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'diff' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Δ Diff (B - A)
          </button>
          <button
            onClick={() => setViewMode('groupA')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'groupA' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Group A
          </button>
          <button
            onClick={() => setViewMode('groupB')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'groupB' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Group B
          </button>
          <button
            onClick={() => setViewMode('unknown')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'unknown' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unknown Target
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mt-5 flex justify-center">
        <div className="inline-block">
          <div className="flex items-center mb-1 pl-10 text-[11px] font-semibold text-slate-500">
            <span className="w-16 sm:w-20 text-center">Second: A</span>
            <span className="w-16 sm:w-20 text-center">C</span>
            <span className="w-16 sm:w-20 text-center">G</span>
            <span className="w-16 sm:w-20 text-center">T</span>
          </div>

          {bases.map((first) => (
            <div key={first} className="flex items-center mb-1">
              <span className="w-10 text-right pr-2 text-xs font-bold text-slate-700 font-mono">
                {first}
              </span>
              <div className="flex gap-1">
                {bases.map((second) => {
                  const pair = `${first}${second}`;
                  const valA = freqsA[pair] || 0;
                  const valB = freqsB[pair] || 0;
                  const valUnk = freqsUnknown[pair] || 0;
                  const diff = Math.round((valB - valA) * 10) / 10;

                  const displayVal =
                    viewMode === 'diff'
                      ? diff > 0
                        ? `+${diff}`
                        : `${diff}`
                      : viewMode === 'groupA'
                      ? `${valA}`
                      : viewMode === 'groupB'
                      ? `${valB}`
                      : `${valUnk}`;

                  const rawForColor =
                    viewMode === 'diff'
                      ? diff
                      : viewMode === 'groupA'
                      ? valA
                      : viewMode === 'groupB'
                      ? valB
                      : valUnk;

                  const colorClass = getHeatmapColor(rawForColor, viewMode === 'diff');

                  return (
                    <div
                      key={pair}
                      className={`w-16 sm:w-20 h-12 rounded-lg flex flex-col items-center justify-center border border-slate-200/80 transition-all hover:scale-105 cursor-pointer shadow-2xs ${colorClass}`}
                      title={`${pair}: Group A=${valA}, Group B=${valB}, Unknown=${valUnk}`}
                    >
                      <span className="text-[10px] font-mono tracking-wider opacity-80">{pair}</span>
                      <span className="text-xs font-mono">{displayVal}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Interpretive Caption */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-3">
          {viewMode === 'diff' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block"></span>
                <span>Enriched in Group B (CG, GC, GG)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block"></span>
                <span>Enriched in Group A (AT, TG, AA)</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-700 inline-block"></span>
              <span>High Frequency pair (&ge; 2.0 occurrences)</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 italic">
          High CpG (`CG` & `GC`) islands are distinctive markers of Group B and high bioactivity promoters.
        </div>
      </div>
    </div>
  );
};
