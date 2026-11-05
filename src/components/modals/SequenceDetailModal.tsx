import React from 'react';
import { SequenceWithFeatures } from '../../types/bio';
import { X, Dna, Info, Thermometer, Weight, Sparkles } from 'lucide-react';

interface Props {
  sequence: SequenceWithFeatures | null;
  onClose: () => void;
}

export const SequenceDetailModal: React.FC<Props> = ({ sequence, onClose }) => {
  if (!sequence) return null;

  const f = sequence.features;

  // Generate complement
  const complement = Array.from(sequence.sequence)
    .map((b) => (b === 'A' ? 'T' : b === 'T' ? 'A' : b === 'G' ? 'C' : 'G'))
    .join('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
              <Dna className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {sequence.id} — {sequence.name}
              </h3>
              <span
                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  sequence.group === 'Group A'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {sequence.group}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Double-Stranded Duplex View */}
          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg font-mono space-y-1">
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>5&apos; Sense Strand</span>
              <span>3&apos;</span>
            </div>
            <div className="text-sm font-bold tracking-widest text-emerald-400">
              5&apos;- {sequence.sequence} -3&apos;
            </div>
            <div className="text-[10px] tracking-widest text-slate-500 pl-4">
              {'|'.repeat(sequence.sequence.length).split('').join(' ')}
            </div>
            <div className="text-sm font-bold tracking-widest text-blue-400">
              3&apos;- {complement} -5&apos;
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between pt-1">
              <span>3&apos; Antisense Strand</span>
              <span>5&apos;</span>
            </div>
          </div>

          {/* Core Quantitative Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Length</span>
              <span className="text-base font-mono font-bold text-slate-800">{f.length} bp</span>
            </div>
            <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-[10px] text-purple-700 block uppercase font-medium">GC Content</span>
              <span className="text-base font-mono font-bold text-purple-900">{f.gcPercent}%</span>
            </div>
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-[10px] text-blue-700 block uppercase font-medium">Bioactivity</span>
              <span className="text-base font-mono font-bold text-blue-900">{f.bioactivityMetric}</span>
            </div>
          </div>

          {/* Biophysical Constants */}
          <div className="grid grid-cols-2 gap-2 text-slate-700 font-mono">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <div>
                <span className="text-[10px] text-slate-500 block">Melting Temp (Tm)</span>
                <span className="font-bold text-slate-900">{f.meltingTemp} °C</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Weight className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="text-[10px] text-slate-500 block">Molecular Weight</span>
                <span className="font-bold text-slate-900">{f.molecularWeight} g/mol</span>
              </div>
            </div>
          </div>

          {/* Base Breakdown */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[11px] font-bold text-slate-700 block">Nucleotide Counts:</span>
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded border border-emerald-200 font-bold">
                A: {f.aCount} ({Math.round((f.aCount / f.length) * 100)}%)
              </div>
              <div className="bg-rose-50 text-rose-800 p-1.5 rounded border border-rose-200 font-bold">
                T: {f.tCount} ({Math.round((f.tCount / f.length) * 100)}%)
              </div>
              <div className="bg-amber-50 text-amber-800 p-1.5 rounded border border-amber-200 font-bold">
                G: {f.gCount} ({Math.round((f.gCount / f.length) * 100)}%)
              </div>
              <div className="bg-blue-50 text-blue-800 p-1.5 rounded border border-blue-200 font-bold">
                C: {f.cCount} ({Math.round((f.cCount / f.length) * 100)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
