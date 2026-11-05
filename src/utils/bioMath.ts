import { SequenceFeatures } from '../types/bio';

/**
 * Sanitizes and normalizes DNA sequence string
 */
export function sanitizeDNA(raw: string): string {
  return raw.toUpperCase().replace(/[^ATGC]/g, '');
}

/**
 * Validates if string contains valid DNA nucleotides
 */
export function isValidDNA(raw: string): { valid: boolean; invalidChars: string[] } {
  const upper = raw.toUpperCase().trim();
  const invalid = upper.match(/[^ATGC]/g);
  return {
    valid: invalid === null && upper.length > 0,
    invalidChars: invalid ? Array.from(new Set(invalid)) : [],
  };
}

/**
 * Calculates primary nucleotide features from a DNA sequence
 */
export function extractFeatures(sequence: string, bioactivityMetric = 50): SequenceFeatures {
  const clean = sanitizeDNA(sequence);
  const length = clean.length || 1;

  let aCount = 0;
  let tCount = 0;
  let gCount = 0;
  let cCount = 0;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === 'A') aCount++;
    else if (char === 'T') tCount++;
    else if (char === 'G') gCount++;
    else if (char === 'C') cCount++;
  }

  const gcCount = gCount + cCount;
  const atCount = aCount + tCount;
  const gcPercent = clean.length > 0 ? (gcCount / length) * 100 : 0;
  const atPercent = clean.length > 0 ? (atCount / length) * 100 : 0;

  // Purine (A+G) vs Pyrimidine (C+T) ratio
  const purines = aCount + gCount;
  const pyrimidines = cCount + tCount;
  const purineRatio = pyrimidines > 0 ? Number((purines / pyrimidines).toFixed(2)) : purines;

  // Count CpG motifs ('CG')
  let cpgCount = 0;
  for (let i = 0; i < clean.length - 1; i++) {
    if (clean[i] === 'C' && clean[i + 1] === 'G') {
      cpgCount++;
    }
  }

  // Melting temperature (Tm in Celsius)
  // For oligonucleotides <= 14 bp: Wallace formula: Tm = 2*(A+T) + 4*(G+C)
  // For longer: Tm = 64.9 + 41*(G+C - 16.4)/length
  let meltingTemp = 0;
  if (length <= 14) {
    meltingTemp = 2 * (aCount + tCount) + 4 * (gCount + cCount);
  } else {
    meltingTemp = 64.9 + (41 * (gcCount - 16.4)) / length;
  }
  meltingTemp = Math.round(meltingTemp * 10) / 10;

  // Molecular weight of ssDNA: A=313.21, T=304.2, C=289.18, G=329.21
  const mw =
    aCount * 313.21 +
    tCount * 304.2 +
    cCount * 289.18 +
    gCount * 329.21 -
    61.96; // terminal hydroxyl / phosphate adjustment
  const molecularWeight = Math.max(0, Math.round(mw * 10) / 10);

  // GC Skew = (G - C) / (G + C)
  const gcSkew = gcCount > 0 ? Number(((gCount - cCount) / gcCount).toFixed(3)) : 0;

  return {
    aCount,
    tCount,
    gCount,
    cCount,
    length,
    gcPercent: Math.round(gcPercent * 10) / 10,
    atPercent: Math.round(atPercent * 10) / 10,
    purineRatio,
    cpgCount,
    meltingTemp,
    molecularWeight,
    gcSkew,
    bioactivityMetric,
  };
}

/**
 * Calculates 16 dinucleotide frequencies
 */
export function getDinucleotideFrequencies(sequence: string): Record<string, number> {
  const clean = sanitizeDNA(sequence);
  const dinucleotides = [
    'AA', 'AT', 'AG', 'AC',
    'TA', 'TT', 'TG', 'TC',
    'GA', 'GT', 'GG', 'GC',
    'CA', 'CT', 'CG', 'CC'
  ];

  const freqs: Record<string, number> = {};
  for (const di of dinucleotides) {
    freqs[di] = 0;
  }

  if (clean.length < 2) return freqs;

  for (let i = 0; i < clean.length - 1; i++) {
    const pair = clean.slice(i, i + 2);
    if (freqs[pair] !== undefined) {
      freqs[pair]++;
    }
  }

  return freqs;
}

/**
 * Calculates sliding window GC content along a sequence
 */
export function calculateSlidingWindowGC(
  sequence: string,
  windowSize = 4
): { position: number; gcPercent: number; gcSkew: number; subseq: string }[] {
  const clean = sanitizeDNA(sequence);
  if (clean.length === 0) return [];
  const effectiveWindow = Math.min(windowSize, clean.length);
  const result: { position: number; gcPercent: number; gcSkew: number; subseq: string }[] = [];

  for (let i = 0; i <= clean.length - effectiveWindow; i++) {
    const subseq = clean.slice(i, i + effectiveWindow);
    let g = 0;
    let c = 0;
    for (let j = 0; j < subseq.length; j++) {
      if (subseq[j] === 'G') g++;
      if (subseq[j] === 'C') c++;
    }
    const gc = ((g + c) / effectiveWindow) * 100;
    const skew = g + c > 0 ? (g - c) / (g + c) : 0;
    result.push({
      position: i + 1,
      gcPercent: Math.round(gc * 10) / 10,
      gcSkew: Math.round(skew * 100) / 100,
      subseq,
    });
  }

  return result;
}

/**
 * Calculates standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates Pearson Correlation Coefficient between two arrays
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return Math.round((num / den) * 100) / 100;
}
