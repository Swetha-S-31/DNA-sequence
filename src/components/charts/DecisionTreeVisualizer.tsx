import React from 'react';
import { PredictionResult } from '../../types/bio';
import { GitBranch, ArrowRight, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface Props {
  predictionResult: PredictionResult;
  threshold?: number;
}

export const DecisionTreeVisualizer: React.FC<Props> = ({
  predictionResult,
  threshold = 56.25,
}) => {
  const unknownGC = predictionResult.features.gcPercent;
  const isRightBranch = unknownGC > threshold;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Interactive Decision Tree Diagram (CART Logic)
            </h3>
            <p className="text-xs text-slate-500">
              Visualizes the exact split conditions and execution trace for sequence: <strong className="font-mono text-slate-700">{predictionResult.sequence}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[11px] bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-md font-semibold">
            Target GC Content = {unknownGC}%
          </span>
        </div>
      </div>

      {/* Visual Tree Canvas */}
      <div className="mt-6 flex flex-col items-center">
        {/* Root Node */}
        <div className="relative flex flex-col items-center">
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md border-2 border-slate-700 w-72 text-center relative z-10">
            <span className="text-[10px] font-mono tracking-wider text-purple-300 uppercase block mb-1">
              Root Split Node (Depth 0)
            </span>
            <div className="text-sm font-bold font-mono">
              Is GC Content (%) &gt; {threshold}% ?
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Primary Gini Impurity reduction split
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/80 text-[10px] text-slate-400 font-mono">
              Unknown value: <strong className="text-amber-300 font-bold">{unknownGC}%</strong>
            </div>
          </div>

          {/* Branch connectors SVG */}
          <div className="w-80 sm:w-96 h-12 relative pointer-events-none">
            <svg className="w-full h-full overflow-visible">
              {/* Left Branch line */}
              <line
                x1="50%"
                y1="0"
                x2="20%"
                y2="100%"
                stroke={!isRightBranch ? '#10B981' : '#CBD5E1'}
                strokeWidth={!isRightBranch ? '3' : '1.5'}
                strokeDasharray={!isRightBranch ? '' : '4 4'}
              />
              {/* Right Branch line */}
              <line
                x1="50%"
                y1="0"
                x2="80%"
                y2="100%"
                stroke={isRightBranch ? '#4F46E5' : '#CBD5E1'}
                strokeWidth={isRightBranch ? '3' : '1.5'}
                strokeDasharray={isRightBranch ? '' : '4 4'}
              />
            </svg>

            {/* Left label badge */}
            <span
              className={`absolute top-2 left-10 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                !isRightBranch
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              NO (&le; {threshold}%)
            </span>

            {/* Right label badge */}
            <span
              className={`absolute top-2 right-10 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isRightBranch
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300 ring-2 ring-indigo-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              YES (&gt; {threshold}%)
            </span>
          </div>
        </div>

        {/* Leaf Nodes Row */}
        <div className="grid grid-cols-2 gap-6 sm:gap-12 w-full max-w-xl mt-1">
          {/* Left Leaf: Group A */}
          <div
            className={`rounded-xl p-4 border-2 transition-all flex flex-col items-center text-center ${
              !isRightBranch
                ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-100'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="text-xs font-mono font-bold text-emerald-900 mb-1">
              Leaf Node: Class Prediction
            </div>
            <div className="text-base font-extrabold text-emerald-700 flex items-center gap-1.5">
              <span>Predict: Group A</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-2 font-mono">
              Typical training examples:
              <br />
              S1 (50%), S2 (50%), S5 (50%), S6 (25%)
            </div>
            {!isRightBranch && (
              <span className="mt-3 text-[10px] bg-emerald-600 text-white font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Traversed Path
              </span>
            )}
          </div>

          {/* Right Leaf: Group B */}
          <div
            className={`rounded-xl p-4 border-2 transition-all flex flex-col items-center text-center ${
              isRightBranch
                ? 'bg-indigo-50 border-indigo-600 shadow-md ring-4 ring-indigo-100'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="text-xs font-mono font-bold text-indigo-900 mb-1">
              Leaf Node: Class Prediction
            </div>
            <div className="text-base font-extrabold text-indigo-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-indigo-600" />
              <span>Predict: Group B</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-2 font-mono">
              Typical training examples:
              <br />
              S3 (62.5%), S4 (100%), S9 (100%)
            </div>
            {isRightBranch && (
              <span className="mt-3 text-[10px] bg-indigo-600 text-white font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3" /> Active Decision Path
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Decision Summary Banner */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-start gap-2.5">
        <div className="p-1 bg-indigo-100 text-indigo-700 rounded-md mt-0.5">
          <ChevronRight className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-900">Decision Execution Step:</span>
          <p className="mt-0.5 text-slate-600">
            For sequence <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-indigo-900">{predictionResult.sequence}</code>,
            GC content is <strong className="text-slate-900">{unknownGC}%</strong>. Since {unknownGC}% &gt; {threshold}%, the model traverses the right branch and assigns
            the sequence to <strong className="text-indigo-700">{predictionResult.predictedGroup}</strong> with{' '}
            <strong className="text-slate-900">{Math.round(predictionResult.confidence * 100)}% confidence</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
