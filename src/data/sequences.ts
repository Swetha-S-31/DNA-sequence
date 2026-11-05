import { DNASequence } from '../types/bio';

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  bioactivityName: string;
  bioactivityUnit: string;
  sequences: DNASequence[];
  defaultUnknown: string;
}

export const INITIAL_ASSIGNMENT_SEQUENCES: DNASequence[] = [
  // Group A (Standard Assessment sequences S1, S2, + extended balanced training set)
  {
    id: 'S1',
    name: 'Seq-01 (Group A)',
    sequence: 'ATGCGATC',
    group: 'Group A',
    bioactivityMetric: 34.5,
    description: 'Assignment training sample 1 - Moderate AT-rich baseline binding',
  },
  {
    id: 'S2',
    name: 'Seq-02 (Group A)',
    sequence: 'ATGCGTAC',
    group: 'Group A',
    bioactivityMetric: 38.2,
    description: 'Assignment training sample 2 - Standard 50% GC motif',
  },
  {
    id: 'S5',
    name: 'Seq-05 (Group A)',
    sequence: 'ATGCATGC',
    group: 'Group A',
    bioactivityMetric: 32.0,
    description: 'Symmetrical duplex motif, 50% GC, low thermal stability',
  },
  {
    id: 'S6',
    name: 'Seq-06 (Group A)',
    sequence: 'AATTCGAT',
    group: 'Group A',
    bioactivityMetric: 25.8,
    description: 'EcoRI-adjacent AT-rich core, 25% GC, low bioactivity profile',
  },
  {
    id: 'S7',
    name: 'Seq-07 (Group A)',
    sequence: 'ATGCAATT',
    group: 'Group A',
    bioactivityMetric: 28.4,
    description: 'TATA-box proxy flank, 25% GC content',
  },
  {
    id: 'S8',
    name: 'Seq-08 (Group A)',
    sequence: 'TACGATGC',
    group: 'Group A',
    bioactivityMetric: 36.7,
    description: 'Inverted repeat ATGC variant, 50% GC',
  },

  // Group B (Standard Assessment sequences S3, S4, + extended high-GC set)
  {
    id: 'S3',
    name: 'Seq-03 (Group B)',
    sequence: 'GCGCGTAT',
    group: 'Group B',
    bioactivityMetric: 76.4,
    description: 'Assignment training sample 3 - High GC anchor with terminal AT',
  },
  {
    id: 'S4',
    name: 'Seq-04 (Group B)',
    sequence: 'GCGCGCGC',
    group: 'Group B',
    bioactivityMetric: 96.8,
    description: 'Assignment training sample 4 - Pure CpG island repeat, 100% GC',
  },
  {
    id: 'S9',
    name: 'Seq-09 (Group B)',
    sequence: 'CGCGCGCG',
    group: 'Group B',
    bioactivityMetric: 94.2,
    description: 'High-affinity CpG repeat duplex, 100% GC',
  },
  {
    id: 'S10',
    name: 'Seq-10 (Group B)',
    sequence: 'GCGCATGC',
    group: 'Group B',
    bioactivityMetric: 68.9,
    description: 'GC-rich island with interior AT insertion, 75% GC',
  },
  {
    id: 'S11',
    name: 'Seq-11 (Group B)',
    sequence: 'CGGCGCGT',
    group: 'Group B',
    bioactivityMetric: 88.5,
    description: 'Heavy G/C clamp motif, 87.5% GC',
  },
  {
    id: 'S12',
    name: 'Seq-12 (Group B)',
    sequence: 'GGCCGCGC',
    group: 'Group B',
    bioactivityMetric: 91.0,
    description: 'HaeIII-like GC rich palindrome, 100% GC',
  },
];

export const MINIMAL_ASSESSMENT_SEQUENCES: DNASequence[] = [
  {
    id: 'S1',
    name: 'Seq-01 (Group A)',
    sequence: 'ATGCGATC',
    group: 'Group A',
    bioactivityMetric: 34.5,
    description: 'Assignment sample S1',
  },
  {
    id: 'S2',
    name: 'Seq-02 (Group A)',
    sequence: 'ATGCGTAC',
    group: 'Group A',
    bioactivityMetric: 38.2,
    description: 'Assignment sample S2',
  },
  {
    id: 'S3',
    name: 'Seq-03 (Group B)',
    sequence: 'GCGCGTAT',
    group: 'Group B',
    bioactivityMetric: 76.4,
    description: 'Assignment sample S3',
  },
  {
    id: 'S4',
    name: 'Seq-04 (Group B)',
    sequence: 'GCGCGCGC',
    group: 'Group B',
    bioactivityMetric: 96.8,
    description: 'Assignment sample S4',
  },
];

export const DATASET_PRESETS: DatasetPreset[] = [
  {
    id: 'assessment_full',
    name: 'Assignment Cohort (12 Samples)',
    description: 'Includes original S1, S2, S3, S4 from assignment prompt plus balanced training controls.',
    bioactivityName: 'Relative Bioactivity Score',
    bioactivityUnit: 'Score (0-100)',
    sequences: INITIAL_ASSIGNMENT_SEQUENCES,
    defaultUnknown: 'ATGCGCGATC',
  },
  {
    id: 'assessment_minimal',
    name: 'Assignment Exact (4 Samples)',
    description: 'The exact 4 benchmark sequences listed in the student assignment text (S1-S4).',
    bioactivityName: 'Relative Bioactivity Score',
    bioactivityUnit: 'Score (0-100)',
    sequences: MINIMAL_ASSESSMENT_SEQUENCES,
    defaultUnknown: 'ATGCGCGATC',
  },
  {
    id: 'promoter_strength',
    name: 'Promoter Transcription Affinity',
    description: 'Bacterial sigma-70 promoter spacer variants compared by in-vitro transcriptional output.',
    bioactivityName: 'Transcriptional Output',
    bioactivityUnit: 'AU (Arbitrary Units)',
    sequences: [
      { id: 'P01', name: 'lacZ-A1', sequence: 'TTGACATTTATGCTTCC', group: 'Group A', bioactivityMetric: 22.0, description: 'Weak promoter with low GC%' },
      { id: 'P02', name: 'lacZ-A2', sequence: 'TTGAAAGCTATGTTTAC', group: 'Group A', bioactivityMetric: 18.5, description: 'Weak promoter mutant' },
      { id: 'P03', name: 'lacZ-A3', sequence: 'TAGACATTTATACTAGT', group: 'Group A', bioactivityMetric: 24.1, description: 'Baseline AT spacer' },
      { id: 'P04', name: 'lacZ-A4', sequence: 'TTTACATTTATGATATC', group: 'Group A', bioactivityMetric: 15.3, description: 'Low activity AT rich' },
      { id: 'P05', name: 'tac-B1', sequence: 'TTGACACCCGCCCTGCG', group: 'Group B', bioactivityMetric: 88.0, description: 'High-strength tac hybrid' },
      { id: 'P06', name: 'tac-B2', sequence: 'CTGACACGCGCGCACCG', group: 'Group B', bioactivityMetric: 94.6, description: 'Strong GC-clamp hybrid' },
      { id: 'P07', name: 'tac-B3', sequence: 'TTGACCGGCGGGCGAGG', group: 'Group B', bioactivityMetric: 91.2, description: 'Strong promoter mutant' },
      { id: 'P08', name: 'tac-B4', sequence: 'CTGACCGGCCGCCACGG', group: 'Group B', bioactivityMetric: 86.4, description: 'High transcription index' },
    ],
    defaultUnknown: 'TTGACACCGGCGCGCCG',
  },
];
