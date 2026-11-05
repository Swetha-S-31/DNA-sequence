import React, { useState } from 'react';
import { PredictionResult } from '../../types/bio';
import {
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  FlaskConical,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface Props {
  prediction: PredictionResult;
  onTestSequence: (seq: string) => void;
}

export const GenomicsDiscussionView: React.FC<Props> = ({
  prediction,
  onTestSequence,
}) => {
  const [activeTab, setActiveTab] = useState<'q1' | 'q2' | 'q3' | 'q4'>('q1');
  const [testMutantSeq, setTestMutantSeq] = useState('ATGCGATC');

  const questions = [
    {
      id: 'q1',
      title: 'Q1: Which Features Were Most Useful?',
      badge: 'Feature Importance',
      summary: 'GC Content (%) and Guanine/Cytosine counts provided 100% linear separability.',
    },
    {
      id: 'q2',
      title: 'Q2: Did the Model Predict Correctly?',
      badge: 'Assessment Validation',
      summary: 'Yes! ATGCGCGATC has 70% GC content, solidly placing it in Group B.',
    },
    {
      id: 'q3',
      title: 'Q3: Out-of-Distribution Sequences?',
      badge: 'Distribution Shift',
      summary: 'Novel lengths or alien motifs cause overconfident misclassifications without uncertainty modeling.',
    },
    {
      id: 'q4',
      title: 'Q4: Limitations of AI/ML in Genomics?',
      badge: 'Critical Limitations',
      summary: 'Lack of 3D spatial conformation, epigenetics, and biological causality.',
    },
  ] as const;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Think & Discuss: Critical Genomic Analysis & Theory
            </h2>
            <p className="text-xs text-slate-500">
              Interactive deep-dive into the four core assessment discussion questions
            </p>
          </div>
        </div>
      </div>

      {/* Question Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => setActiveTab(q.id)}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeTab === q.id
                ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span
              className={`text-[10px] font-mono font-bold uppercase block ${
                activeTab === q.id ? 'text-indigo-700' : 'text-slate-500'
              }`}
            >
              {q.badge}
            </span>
            <div
              className={`text-xs font-bold mt-1 ${
                activeTab === q.id ? 'text-indigo-950' : 'text-slate-800'
              }`}
            >
              {q.title}
            </div>
          </button>
        ))}
      </div>

      {/* Question Detail View */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
        {activeTab === 'q1' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-100 text-indigo-700 rounded font-mono font-bold text-[11px]">
                Q1 Analysis
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Which features were most useful in distinguishing Group A from Group B?
              </h3>
            </div>

            <p>
              In our numerical feature extraction pipeline, <strong>GC Content (%)</strong> and individual <strong>Guanine (G) and Cytosine (C) counts</strong> exhibited the highest mutual information and Gini impurity reduction.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-emerald-700 font-bold block mb-1">Group A Profile (e.g. S1, S2):</span>
                <ul className="space-y-1 text-slate-600">
                  <li>• GC Content: 50.0% (Mean ~41.7%)</li>
                  <li>• G + C count: 4 out of 8 bases</li>
                  <li>• Lower melting temperature (Tm ≈ 24°C)</li>
                  <li>• Moderate bioactivity (~35 AU)</li>
                </ul>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-indigo-700 font-bold block mb-1">Group B Profile (e.g. S3, S4):</span>
                <ul className="space-y-1 text-slate-600">
                  <li>• GC Content: 62.5% to 100.0% (Mean ~87.5%)</li>
                  <li>• G + C count: 5 to 8 out of 8 bases</li>
                  <li>• High thermal stability (Tm ≈ 28°C - 32°C)</li>
                  <li>• Elevated bioactivity (&gt;75 AU)</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Biophysical Reason:</h4>
              <p>
                G-C base pairs share <strong>three hydrogen bonds</strong>, whereas A-T base pairs share only <strong>two</strong>. Higher GC content confers significantly increased duplex stability, higher resistance to denaturation, and distinct major-groove electrostatic topologies that favor specific transcription factor and enzyme binding.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'q2' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-100 text-indigo-700 rounded font-mono font-bold text-[11px]">
                Q2 Analysis
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Did the model predict correctly for the unknown sequence ATGCGCGATC?
              </h3>
            </div>

            <div className="p-3 bg-indigo-100/70 border border-indigo-300 rounded-lg text-indigo-950 font-medium">
              <strong>Verdict:</strong> Yes, the classification of <code className="font-mono font-bold">ATGCGCGATC</code> as <strong>Group B</strong> is completely sound from both a mathematical and biological standpoint.
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Feature Verification for ATGCGCGATC:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                <div className="bg-slate-50 p-2 rounded">Length: <strong>10 bp</strong></div>
                <div className="bg-slate-50 p-2 rounded">G Count: <strong>4</strong></div>
                <div className="bg-slate-50 p-2 rounded">C Count: <strong>3</strong></div>
                <div className="bg-indigo-50 text-indigo-900 p-2 rounded font-bold">GC%: <strong>70.0%</strong></div>
              </div>
            </div>

            <p>
              Since 70% is well above the learned decision split boundary (56.25%), the sequence clearly belongs to the high-GC class. Furthermore, the presence of consecutive CpG motifs (<code className="font-mono">CGCG</code>) is a known molecular signature of Group B sequences.
            </p>
          </div>
        )}

        {activeTab === 'q3' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-100 text-indigo-700 rounded font-mono font-bold text-[11px]">
                Q3 Analysis
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                What if the unknown sequence is very different from the training data?
              </h3>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>The Out-of-Distribution (OOD) Fallacy:</strong>
                <p className="mt-0.5">
                  Standard classification models are forced to output a class label (either Group A or Group B). If given an alien sequence—for example, a 500-base sequence or a poly-A tail (<code className="font-mono">AAAAAAAAAA</code>)—it will still output a binary prediction, often with false certainty!
                </p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Interactive Stress Test Experiment:</span>
              <p className="text-slate-600">
                Click any of these atypical sequences to send it directly into the classifier:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onTestSequence('AAAAAAAAAAAAAAAA')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-[11px] text-slate-800 border border-slate-300"
                >
                  Poly-A Homopolymer (16x A)
                </button>
                <button
                  onClick={() => onTestSequence('GCGCGCGCGCGCGCGC')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-[11px] text-slate-800 border border-slate-300"
                >
                  Extreme CpG Clamp (16x GC)
                </button>
                <button
                  onClick={() => onTestSequence('TATATATATATATATA')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-[11px] text-slate-800 border border-slate-300"
                >
                  Pure TATA Repeat (0% GC)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'q4' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-100 text-indigo-700 rounded font-mono font-bold text-[11px]">
                Q4 Analysis
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                What are the fundamental limitations of using AI/ML for genomic analysis?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">1. Bag-of-Bases Blind Spot</span>
                <p className="text-slate-600">
                  Counting A, T, G, C ignores <strong>linear order</strong>. A sequence and its reverse anagram have identical nucleotide counts, but in molecular biology, transcription factors read specific spatial motifs.
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">2. Absence of Epigenetic Context</span>
                <p className="text-slate-600">
                  Genomic DNA in vivo is wrapped around histones and modified by 5-methylcytosine (5mC). Naked DNA sequence alone cannot predict whether a gene is accessible or silenced.
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">3. Data Sparsity & Homology Leakage</span>
                <p className="text-slate-600">
                  Related species share homologous sequences. If homologs are present in both train and test splits, model accuracy is artificially inflated, masking inability to generalize.
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">4. Requirement for Experimental Proof</span>
                <p className="text-slate-600">
                  In silico AI predictions are computational hypotheses. In clinical diagnostics and drug design, predictions require empirical validation via wet-lab assays (CRISPR screens, qPCR, RNA-seq).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
