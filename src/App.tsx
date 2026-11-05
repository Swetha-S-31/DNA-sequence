import React, { useState, useMemo } from 'react';
import {
  DNASequence,
  SequenceWithFeatures,
  MLModelType,
} from './types/bio';
import { extractFeatures } from './utils/bioMath';
import { trainAndEvaluateModel } from './utils/classifier';
import {
  INITIAL_ASSIGNMENT_SEQUENCES,
  MINIMAL_ASSESSMENT_SEQUENCES,
  DATASET_PRESETS,
} from './data/sequences';

// Components
import { CompositionComparisonChart } from './components/charts/CompositionComparisonChart';
import { FeatureScatterPlot } from './components/charts/FeatureScatterPlot';
import { GCBoxDistributionChart } from './components/charts/GCBoxDistributionChart';
import { KmerHeatmap } from './components/charts/KmerHeatmap';
import { SlidingWindowChart } from './components/charts/SlidingWindowChart';
import { SequenceAlignmentView } from './components/charts/SequenceAlignmentView';
import { DecisionTreeVisualizer } from './components/charts/DecisionTreeVisualizer';
import { UnknownPredictorCard } from './components/ml/UnknownPredictorCard';
import { ModelMetricsCard } from './components/ml/ModelMetricsCard';
import { ReportDocumentView } from './components/report/ReportDocumentView';
import { GenomicsDiscussionView } from './components/discussion/GenomicsDiscussionView';
import { FeatureDataTable } from './components/table/FeatureDataTable';
import { SequenceEditorModal } from './components/modals/SequenceEditorModal';
import { SequenceDetailModal } from './components/modals/SequenceDetailModal';

// Icons
import {
  Dna,
  BarChart3,
  AlignLeft,
  Cpu,
  Crosshair,
  FileText,
  Lightbulb,
  Database,
  PlusCircle,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'alignment' | 'ml' | 'predict' | 'report' | 'discussion'
  >('predict');

  const [datasetPresetId, setDatasetPresetId] = useState<string>('assessment_full');
  const [rawSequences, setRawSequences] = useState<DNASequence[]>(INITIAL_ASSIGNMENT_SEQUENCES);
  const [unknownSeqString, setUnknownSeqString] = useState<string>('ATGCGCGATC');

  // ML configuration
  const [selectedModel, setSelectedModel] = useState<MLModelType>('decision_tree');
  const [kNeighbors, setKNeighbors] = useState<number>(3);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [inspectSeq, setInspectSeq] = useState<SequenceWithFeatures | null>(null);

  // Extract features for all active sequences
  const sequencesWithFeatures: SequenceWithFeatures[] = useMemo(() => {
    return rawSequences.map((s) => ({
      ...s,
      features: extractFeatures(s.sequence, s.bioactivityMetric),
    }));
  }, [rawSequences]);

  // Train and evaluate model
  const { evaluation, predict, decisionTreeRoot } = useMemo(() => {
    return trainAndEvaluateModel(sequencesWithFeatures, selectedModel, kNeighbors);
  }, [sequencesWithFeatures, selectedModel, kNeighbors]);

  // Current prediction for the unknown sequence
  const currentPrediction = useMemo(() => {
    return predict(unknownSeqString);
  }, [predict, unknownSeqString]);

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    setDatasetPresetId(presetId);
    const found = DATASET_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setRawSequences(found.sequences);
      setUnknownSeqString(found.defaultUnknown);
    }
  };

  const handleTestSequenceFromDiscussion = (seq: string) => {
    setUnknownSeqString(seq);
    setActiveTab('predict');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Banner & Assessment Context */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-xs">
                <Dna className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">
                    BioSeq Analytics
                  </h1>
                  <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    Bioactivity & DNA ML
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Interactive sequence visualization, feature extraction & classification workbench
                </p>
              </div>
            </div>

            {/* Quick Presets & Data Management */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <span className="text-slate-400 pl-1">
                  <Database className="w-3.5 h-3.5" />
                </span>
                <button
                  onClick={() => handleSelectPreset('assessment_full')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    datasetPresetId === 'assessment_full'
                      ? 'bg-white text-indigo-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Assignment (12 Seqs)
                </button>
                <button
                  onClick={() => handleSelectPreset('assessment_minimal')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    datasetPresetId === 'assessment_minimal'
                      ? 'bg-white text-indigo-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Exact S1-S4 (4 Seqs)
                </button>
                <button
                  onClick={() => handleSelectPreset('promoter_strength')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    datasetPresetId === 'promoter_strength'
                      ? 'bg-white text-indigo-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Promoter Variants
                </button>
              </div>

              <button
                onClick={() => setIsEditorOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Manage Data</span>
              </button>
            </div>
          </div>

          {/* Assessment Prompt Alert Notification */}
          <div className="py-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-800">Target Problem:</span>
              <span>
                Predict group for unknown sequence <code className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">{unknownSeqString}</code> trained on Group A (S1, S2) & Group B (S3, S4).
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-500">Current Model:</span>
              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                {evaluation.modelName} ({evaluation.accuracy}% Acc)
              </span>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-0.5">
            <button
              onClick={() => setActiveTab('predict')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'predict'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>Unknown Predictor (ATGCGCGATC)</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Comparative Analytics & Charts</span>
            </button>

            <button
              onClick={() => setActiveTab('alignment')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'alignment'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              <span>Alignment & Feature Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('ml')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'ml'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>ML Classifier & CART Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'report'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Report Document (Sections 1-6)</span>
            </button>

            <button
              onClick={() => setActiveTab('discussion')}
              className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'discussion'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Think & Discuss</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: UNKNOWN SEQUENCE PREDICTOR */}
        {activeTab === 'predict' && (
          <div className="space-y-6">
            <UnknownPredictorCard
              onPredict={predict}
              defaultSequence={unknownSeqString}
              sequences={sequencesWithFeatures}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DecisionTreeVisualizer
                predictionResult={currentPrediction}
                threshold={decisionTreeRoot?.threshold || 56.25}
              />
              <CompositionComparisonChart
                sequences={sequencesWithFeatures}
                unknownFeatures={currentPrediction.features}
                unknownSequenceName={`Unknown Target (${currentPrediction.sequence})`}
              />
            </div>

            <FeatureScatterPlot
              sequences={sequencesWithFeatures}
              unknownFeatures={currentPrediction.features}
              unknownName={currentPrediction.sequence}
              onSelectSequence={(seq) => setInspectSeq(seq)}
            />
          </div>
        )}

        {/* TAB 2: COMPARATIVE ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompositionComparisonChart
                sequences={sequencesWithFeatures}
                unknownFeatures={currentPrediction.features}
                unknownSequenceName={`Unknown Target (${currentPrediction.sequence})`}
              />
              <GCBoxDistributionChart
                sequences={sequencesWithFeatures}
                unknownGC={currentPrediction.features.gcPercent}
              />
            </div>

            <FeatureScatterPlot
              sequences={sequencesWithFeatures}
              unknownFeatures={currentPrediction.features}
              unknownName={currentPrediction.sequence}
              onSelectSequence={(seq) => setInspectSeq(seq)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <KmerHeatmap
                sequences={sequencesWithFeatures}
                unknownSeq={currentPrediction.sequence}
              />
              <SlidingWindowChart
                sequences={sequencesWithFeatures}
                unknownSeq={currentPrediction.sequence}
              />
            </div>
          </div>
        )}

        {/* TAB 3: ALIGNMENT & FEATURE MATRIX */}
        {activeTab === 'alignment' && (
          <div className="space-y-6">
            <SequenceAlignmentView
              sequences={sequencesWithFeatures}
              unknownSeq={currentPrediction.sequence}
            />
            <FeatureDataTable
              sequences={sequencesWithFeatures}
              onSelectSequence={(seq) => setInspectSeq(seq)}
              onOpenManageModal={() => setIsEditorOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: ML CLASSIFIER & CART VISUALIZER */}
        {activeTab === 'ml' && (
          <div className="space-y-6">
            <ModelMetricsCard
              evaluation={evaluation}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              kNeighbors={kNeighbors}
              onKChange={setKNeighbors}
            />

            <DecisionTreeVisualizer
              predictionResult={currentPrediction}
              threshold={decisionTreeRoot?.threshold || 56.25}
            />

            <FeatureScatterPlot
              sequences={sequencesWithFeatures}
              unknownFeatures={currentPrediction.features}
              unknownName={currentPrediction.sequence}
              onSelectSequence={(seq) => setInspectSeq(seq)}
            />
          </div>
        )}

        {/* TAB 5: REPORT DOCUMENT VIEW */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            <ReportDocumentView
              sequences={sequencesWithFeatures}
              evaluation={evaluation}
              prediction={currentPrediction}
              unknownSequenceString={currentPrediction.sequence}
            />
          </div>
        )}

        {/* TAB 6: THINK & DISCUSS */}
        {activeTab === 'discussion' && (
          <div className="space-y-6">
            <GenomicsDiscussionView
              prediction={currentPrediction}
              onTestSequence={handleTestSequenceFromDiscussion}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">BioSeq Analytics</span>
            <span>—</span>
            <span>DNA Sequence Bioactivity & Machine Learning Visualizer</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Compliant with Scikit-Learn CART & Scientific Sequence Standards
          </div>
        </div>
      </footer>

      {/* Sequence Editor Modal */}
      <SequenceEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        sequences={rawSequences}
        onUpdateSequences={setRawSequences}
        onResetToDefault={() => setRawSequences(INITIAL_ASSIGNMENT_SEQUENCES)}
      />

      {/* Sequence Detail Inspector Modal */}
      <SequenceDetailModal
        sequence={inspectSeq}
        onClose={() => setInspectSeq(null)}
      />
    </div>
  );
}
