import React, { useState } from 'react';
import { PredictionResult, SequenceWithFeatures } from '../../types/bio';
import { isValidDNA, sanitizeDNA } from '../../utils/bioMath';
import { Crosshair, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onPredict: (seq: string) => PredictionResult;
  defaultSequence?: string;
  sequences: SequenceWithFeatures[];
}

export const UnknownPredictorCard: React.FC<Props> = ({
  onPredict,
  defaultSequence = 'ATGCGCGATC',
  sequences,
}) => {
  const [inputSeq, setInputSeq] = useState<string>(defaultSequence);
  const [result, setResult] = useState<PredictionResult>(() => onPredict(defaultSequence));

  const validation = isValidDNA(inputSeq);

  const handleSequenceChange = (newSeq: string) => {
    const upper = newSeq.toUpperCase();
    setInputSeq(upper);
    const valid = isValidDNA(upper);
    if (valid.valid) {
      const res = onPredict(upper);
      setResult(res);
    }
  };

  const handlePredictClick = () => {
    if (!validation.valid) return;
    const res = onPredict(inputSeq);
    setResult(res);

    // Fire subtle celebratory confetti for a successful prediction
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: res.predictedGroup === 'Group B' ? ['#4F46E5', '#6366F1', '#38BDF8'] : ['#10B981', '#34D399', '#6EE7B7'],
    });
  };

  const presets = [
    { label: 'Prompt Unknown: ATGCGCGATC', seq: 'ATGCGCGATC' },
    { label: 'High GC Test: GCGCGCGCAT', seq: 'GCGCGCGCAT' },
    { label: 'Low GC Test: AATTATGCG', seq: 'AATTATGCG' },
    { label: 'Boundary Test: ATGCATGCGC', seq: 'ATGCATGCGC' },
  ];

  const features = result.features;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Unknown Sequence Group Predictor
            </h3>
            <p className="text-xs text-slate-500">
              Assessment Target: Enter sequence to extract features & predict group
            </p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p.seq}
              onClick={() => handleSequenceChange(p.seq)}
              className={`text-[11px] font-mono px-2 py-1 rounded border transition-all ${
                inputSeq === p.seq
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.label.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field Area */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Enter Unknown DNA Sequence (A, T, G, C):
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputSeq}
              onChange={(e) => handleSequenceChange(e.target.value)}
              placeholder="e.g. ATGCGCGATC"
              className="w-full font-mono text-sm tracking-wider uppercase px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400">
              {inputSeq.length} bp
            </span>
          </div>

          <button
            onClick={handlePredictClick}
            disabled={!validation.valid}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Prediction</span>
          </button>
        </div>

        {!validation.valid && (
          <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Invalid nucleotides detected: {validation.invalidChars.join(', ')}. Only A, T, G, C characters permitted.
            </span>
          </div>
        )}
      </div>

      {/* Extracted Features Banner */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Length</span>
          <span className="text-sm font-mono font-bold text-slate-800">{features.length} bp</span>
        </div>
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="text-[10px] text-emerald-700 block uppercase font-semibold">Adenine (A)</span>
          <span className="text-sm font-mono font-bold text-emerald-900">{features.aCount}</span>
        </div>
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg">
          <span className="text-[10px] text-rose-700 block uppercase font-semibold">Thymine (T)</span>
          <span className="text-sm font-mono font-bold text-rose-900">{features.tCount}</span>
        </div>
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-[10px] text-amber-700 block uppercase font-semibold">Guanine (G)</span>
          <span className="text-sm font-mono font-bold text-amber-900">{features.gCount}</span>
        </div>
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-[10px] text-blue-700 block uppercase font-semibold">Cytosine (C)</span>
          <span className="text-sm font-mono font-bold text-blue-900">{features.cCount}</span>
        </div>
        <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
          <span className="text-[10px] text-purple-700 block uppercase font-semibold">GC Content</span>
          <span className="text-sm font-mono font-bold text-purple-900">{features.gcPercent}%</span>
        </div>
      </div>

      {/* Main Prediction Output Result Card */}
      <div className="mt-5 p-4 rounded-xl border-2 transition-all bg-gradient-to-r from-slate-50 to-indigo-50/40 border-indigo-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Model Classification Output
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl font-extrabold tracking-tight ${
                  result.predictedGroup === 'Group B' ? 'text-indigo-700' : 'text-emerald-700'
                }`}
              >
                {result.predictedGroup}
              </span>
              <span className="bg-white border border-slate-300 text-slate-800 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shadow-2xs">
                Confidence: {Math.round(result.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              {result.explanation}
            </p>
          </div>

          {/* Probability Distribution Meters */}
          <div className="w-full sm:w-56 space-y-2 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">
              Class Probabilities
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-emerald-700 font-semibold">Group A</span>
                  <span>{Math.round((result.probabilities['Group A'] || 0) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(result.probabilities['Group A'] || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-indigo-700 font-semibold">Group B</span>
                  <span>{Math.round((result.probabilities['Group B'] || 0) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(result.probabilities['Group B'] || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nearest Neighbor Diagnostics */}
        {result.nearestNeighbors && result.nearestNeighbors.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 block mb-2">
              Nearest Training Homologs in Normalized Feature Space:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {result.nearestNeighbors.map((n, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">{n.id}</span>
                    <span
                      className={`ml-1.5 text-[10px] px-1 rounded ${
                        n.group === 'Group A' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {n.group}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Dist: {n.distance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
