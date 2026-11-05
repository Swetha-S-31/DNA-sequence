import React, { useState } from 'react';
import { SequenceWithFeatures } from '../../types/bio';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface Props {
  sequences: SequenceWithFeatures[];
  unknownGC?: number;
}

export const GCBoxDistributionChart: React.FC<Props> = ({ sequences, unknownGC }) => {
  const [metric, setMetric] = useState<'gcPercent' | 'bioactivityMetric' | 'meltingTemp'>('gcPercent');

  const metricLabels = {
    gcPercent: { title: 'GC Content (%)', unit: '%' },
    bioactivityMetric: { title: 'Bioactivity Metric', unit: 'AU' },
    meltingTemp: { title: 'Melting Temperature Tm (°C)', unit: '°C' },
  };

  const calculateStats = (groupSeqs: SequenceWithFeatures[]) => {
    if (groupSeqs.length === 0) return { min: 0, q1: 0, median: 0, mean: 0, q3: 0, max: 0, values: [] };
    const values = groupSeqs.map((s) => s.features[metric]).sort((a, b) => a - b);
    const n = values.length;
    const min = values[0];
    const max = values[n - 1];
    const mean = Math.round((values.reduce((a, b) => a + b, 0) / n) * 10) / 10;
    const median = n % 2 === 1 ? values[Math.floor(n / 2)] : (values[n / 2 - 1] + values[n / 2]) / 2;
    const q1 = values[Math.floor(n / 4)];
    const q3 = values[Math.floor((3 * n) / 4)];

    return { min, q1, median, mean, q3, max, values };
  };

  const groupASeqs = sequences.filter((s) => s.group === 'Group A');
  const groupBSeqs = sequences.filter((s) => s.group === 'Group B');

  const statsA = calculateStats(groupASeqs);
  const statsB = calculateStats(groupBSeqs);

  const globalMin = Math.min(statsA.min, statsB.min, unknownGC || 100);
  const globalMax = Math.max(statsA.max, statsB.max, unknownGC || 0);
  const range = globalMax - globalMin || 1;
  const scaleMin = Math.max(0, globalMin - range * 0.1);
  const scaleMax = globalMax + range * 0.1;

  const toPercent = (val: number) => {
    return Math.max(0, Math.min(100, ((val - scaleMin) / (scaleMax - scaleMin)) * 100));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Comparative Distribution & Quartiles
            </h3>
            <p className="text-xs text-slate-500">
              Interquartile range (IQR), median & spread across groups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium text-slate-500">Metric:</span>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as any)}
            aria-label="Comparison Metric"
            className="bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="gcPercent">GC Content (%)</option>
            <option value="bioactivityMetric">Bioactivity Metric</option>
            <option value="meltingTemp">Melting Temperature (°C)</option>
          </select>
        </div>
      </div>

      {/* Horizontal Box & Whisker Tracks */}
      <div className="mt-6 space-y-7">
        {/* Group A Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Group A (n = {groupASeqs.length})
            </span>
            <span className="font-mono text-slate-500 text-[11px]">
              Median: <strong className="text-slate-800">{statsA.median} {metricLabels[metric].unit}</strong> | Mean: {statsA.mean} | IQR: [{statsA.q1} - {statsA.q3}]
            </span>
          </div>

          <div className="relative h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center px-4 overflow-hidden">
            {/* Whiskers line */}
            <div
              className="absolute h-0.5 bg-slate-400"
              style={{
                left: `${toPercent(statsA.min)}%`,
                width: `${toPercent(statsA.max) - toPercent(statsA.min)}%`,
              }}
            ></div>

            {/* Min tick */}
            <div
              className="absolute h-4 w-0.5 bg-slate-500 -translate-x-1/2"
              style={{ left: `${toPercent(statsA.min)}%` }}
            ></div>
            {/* Max tick */}
            <div
              className="absolute h-4 w-0.5 bg-slate-500 -translate-x-1/2"
              style={{ left: `${toPercent(statsA.max)}%` }}
            ></div>

            {/* IQR Box */}
            <div
              className="absolute h-6 bg-emerald-200/80 border border-emerald-600 rounded-xs shadow-xs"
              style={{
                left: `${toPercent(statsA.q1)}%`,
                width: `${Math.max(1, toPercent(statsA.q3) - toPercent(statsA.q1))}%`,
              }}
            >
              {/* Median Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-emerald-700 -translate-x-1/2 shadow-xs"
                style={{
                  left: `${((statsA.median - statsA.q1) / (statsA.q3 - statsA.q1 || 1)) * 100}%`,
                }}
              ></div>
            </div>

            {/* Raw Points Jitter */}
            {statsA.values.map((v, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-emerald-700/70 border border-white -translate-x-1/2 shadow-xs"
                style={{ left: `${toPercent(v)}%` }}
                title={`Value: ${v}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Group B Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Group B (n = {groupBSeqs.length})
            </span>
            <span className="font-mono text-slate-500 text-[11px]">
              Median: <strong className="text-slate-800">{statsB.median} {metricLabels[metric].unit}</strong> | Mean: {statsB.mean} | IQR: [{statsB.q1} - {statsB.q3}]
            </span>
          </div>

          <div className="relative h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center px-4 overflow-hidden">
            {/* Whiskers line */}
            <div
              className="absolute h-0.5 bg-slate-400"
              style={{
                left: `${toPercent(statsB.min)}%`,
                width: `${toPercent(statsB.max) - toPercent(statsB.min)}%`,
              }}
            ></div>

            {/* Min tick */}
            <div
              className="absolute h-4 w-0.5 bg-slate-500 -translate-x-1/2"
              style={{ left: `${toPercent(statsB.min)}%` }}
            ></div>
            {/* Max tick */}
            <div
              className="absolute h-4 w-0.5 bg-slate-500 -translate-x-1/2"
              style={{ left: `${toPercent(statsB.max)}%` }}
            ></div>

            {/* IQR Box */}
            <div
              className="absolute h-6 bg-indigo-200/80 border border-indigo-600 rounded-xs shadow-xs"
              style={{
                left: `${toPercent(statsB.q1)}%`,
                width: `${Math.max(1, toPercent(statsB.q3) - toPercent(statsB.q1))}%`,
              }}
            >
              {/* Median Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-indigo-800 -translate-x-1/2 shadow-xs"
                style={{
                  left: `${((statsB.median - statsB.q1) / (statsB.q3 - statsB.q1 || 1)) * 100}%`,
                }}
              ></div>
            </div>

            {/* Raw Points Jitter */}
            {statsB.values.map((v, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-indigo-800/70 border border-white -translate-x-1/2 shadow-xs"
                style={{ left: `${toPercent(v)}%` }}
                title={`Value: ${v}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Unknown Sequence Target Indicator (if GC% metric) */}
        {metric === 'gcPercent' && unknownGC !== undefined && (
          <div className="pt-2">
            <div className="relative h-6 flex items-center">
              <div className="absolute inset-x-0 h-px bg-slate-200"></div>
              <div
                className="absolute flex items-center gap-1.5 -translate-x-1/2 bg-amber-50 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-xs"
                style={{ left: `${toPercent(unknownGC)}%` }}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Unknown: {unknownGC}% GC</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Min: {scaleMin.toFixed(1)} {metricLabels[metric].unit}</span>
        <span className="font-semibold text-slate-700">Distribution Difference: Δ Mean = {Math.abs(statsB.mean - statsA.mean).toFixed(1)}</span>
        <span>Max: {scaleMax.toFixed(1)} {metricLabels[metric].unit}</span>
      </div>
    </div>
  );
};
