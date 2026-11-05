import React from 'react';
import { ModelEvaluation, MLModelType } from '../../types/bio';
import { Cpu, CheckCircle, BarChart2, ShieldCheck, Target } from 'lucide-react';

interface Props {
  evaluation: ModelEvaluation;
  selectedModel: MLModelType;
  onSelectModel: (model: MLModelType) => void;
  kNeighbors: number;
  onKChange: (k: number) => void;
}

export const ModelMetricsCard: React.FC<Props> = ({
  evaluation,
  selectedModel,
  onSelectModel,
  kNeighbors,
  onKChange,
}) => {
  const { confusionMatrix, accuracy, precision, recall, f1Score, featureImportance } = evaluation;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Machine Learning Model & Performance Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Training performance, confusion matrix & feature importance
            </p>
          </div>
        </div>

        {/* Model Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => onSelectModel('decision_tree')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              selectedModel === 'decision_tree'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Decision Tree
          </button>
          <button
            onClick={() => onSelectModel('random_forest')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              selectedModel === 'random_forest'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Random Forest
          </button>
          <button
            onClick={() => onSelectModel('knn')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              selectedModel === 'knn'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            KNN Classifier
          </button>
          <button
            onClick={() => onSelectModel('logistic_regression')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              selectedModel === 'logistic_regression'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Logistic Regression
          </button>
        </div>
      </div>

      {/* Hyperparameter Sub-bar (if KNN selected) */}
      {selectedModel === 'knn' && (
        <div className="mt-3 p-2 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-center justify-between text-xs text-indigo-900">
          <span>K Nearest Neighbors parameter:</span>
          <div className="flex items-center gap-2">
            {[1, 3, 5].map((k) => (
              <button
                key={k}
                onClick={() => onKChange(k)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  kNeighbors === k
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-indigo-700 border border-indigo-300'
                }`}
              >
                k = {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Accuracy</span>
          <span className="text-2xl font-mono font-extrabold text-slate-900">{accuracy}%</span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">Overall Fit</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Precision</span>
          <span className="text-2xl font-mono font-extrabold text-blue-600">{precision}%</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Group B Precision</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Recall / Sens</span>
          <span className="text-2xl font-mono font-extrabold text-indigo-600">{recall}%</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">True Positive Rate</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">F1 Score</span>
          <span className="text-2xl font-mono font-extrabold text-purple-600">{f1Score}%</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Harmonic Mean</span>
        </div>
      </div>

      {/* Grid: Confusion Matrix & Feature Importance */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Confusion Matrix (2x2) */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              2x2 Confusion Matrix
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Actual vs Predicted</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            {/* True Negatives (Group A correctly predicted) */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-md">
              <span className="text-[10px] text-emerald-800 block uppercase font-sans font-bold">
                True Group A (TN)
              </span>
              <span className="text-xl font-bold text-emerald-900">{confusionMatrix.tn}</span>
              <span className="text-[9px] text-emerald-700 block">Actual A &rarr; Pred A</span>
            </div>

            {/* False Positives (Group A incorrectly predicted as B) */}
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md">
              <span className="text-[10px] text-rose-800 block uppercase font-sans font-bold">
                False Positives (FP)
              </span>
              <span className="text-xl font-bold text-rose-900">{confusionMatrix.fp}</span>
              <span className="text-[9px] text-rose-700 block">Actual A &rarr; Pred B</span>
            </div>

            {/* False Negatives (Group B incorrectly predicted as A) */}
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md">
              <span className="text-[10px] text-rose-800 block uppercase font-sans font-bold">
                False Negatives (FN)
              </span>
              <span className="text-xl font-bold text-rose-900">{confusionMatrix.fn}</span>
              <span className="text-[9px] text-rose-700 block">Actual B &rarr; Pred A</span>
            </div>

            {/* True Positives (Group B correctly predicted) */}
            <div className="p-2.5 bg-indigo-50 border border-indigo-300 rounded-md">
              <span className="text-[10px] text-indigo-800 block uppercase font-sans font-bold">
                True Group B (TP)
              </span>
              <span className="text-xl font-bold text-indigo-900">{confusionMatrix.tp}</span>
              <span className="text-[9px] text-indigo-700 block">Actual B &rarr; Pred B</span>
            </div>
          </div>
        </div>

        {/* Feature Importance Ranking */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
              Feature Importance Ranking
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Relative Weight (0 - 1)</span>
          </div>

          <div className="space-y-2 mt-1">
            {featureImportance.slice(0, 5).map((item) => (
              <div key={item.feature} className="text-xs">
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  <span className="font-mono text-slate-600">{Math.round(item.importance * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.importance * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
