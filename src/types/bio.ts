export type GroupType = 'Group A' | 'Group B' | 'Unknown' | string;

export interface DNASequence {
  id: string;
  name: string;
  sequence: string;
  group: GroupType;
  bioactivityMetric: number; // e.g. Normalized Bioactivity Index / Binding Affinity (0 - 100)
  description?: string;
  isUnknown?: boolean;
}

export interface SequenceFeatures {
  aCount: number;
  tCount: number;
  gCount: number;
  cCount: number;
  length: number;
  gcPercent: number;
  atPercent: number;
  purineRatio: number; // (A + G) / (C + T)
  cpgCount: number; // count of 'CG'
  meltingTemp: number; // in Celsius
  molecularWeight: number; // in g/mol
  gcSkew: number; // (G - C) / (G + C)
  bioactivityMetric: number;
}

export interface SequenceWithFeatures extends DNASequence {
  features: SequenceFeatures;
}

export type MLModelType = 'decision_tree' | 'random_forest' | 'knn' | 'logistic_regression';

export interface ConfusionMatrix {
  tp: number; // True Group B
  tn: number; // True Group A
  fp: number; // Predicted Group B, actually Group A
  fn: number; // Predicted Group A, actually Group B
}

export interface ModelEvaluation {
  modelType: MLModelType;
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: ConfusionMatrix;
  featureImportance: { feature: string; label: string; importance: number }[];
  decisionRules?: string[];
}

export interface PredictionResult {
  sequence: string;
  features: SequenceFeatures;
  predictedGroup: 'Group A' | 'Group B';
  confidence: number; // 0 to 1
  probabilities: { [group: string]: number };
  nearestNeighbors?: {
    id: string;
    name: string;
    group: string;
    distance: number;
    gcPercent: number;
  }[];
  explanation: string;
  decisionPath?: {
    feature: string;
    threshold: number;
    value: number;
    direction: 'left' | 'right';
    outcome: string;
  }[];
}
