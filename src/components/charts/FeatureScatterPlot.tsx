import React, { useState } from 'react';
import { SequenceWithFeatures, SequenceFeatures } from '../../types/bio';
import { Crosshair, Layers, HelpCircle } from 'lucide-react';

interface Props {
  sequences: SequenceWithFeatures[];
  unknownFeatures?: SequenceFeatures;
  unknownName?: string;
  onSelectSequence?: (seq: SequenceWithFeatures) => void;
}

type FeatureKey = keyof SequenceFeatures;

const AVAILABLE_AXES: { key: FeatureKey; label: string; unit: string }[] = [
  { key: 'gcPercent', label: 'GC Content', unit: '%' },
  { key: 'bioactivityMetric', label: 'Bioactivity Metric', unit: 'AU' },
  { key: 'meltingTemp', label: 'Melting Temp (Tm)', unit: '°C' },
  { key: 'purineRatio', label: 'Purine / Pyrimidine Ratio', unit: 'Ratio' },
  { key: 'cpgCount', label: 'CpG Dinucleotide Count', unit: 'motifs' },
  { key: 'gCount', label: 'Guanine (G) Count', unit: 'bases' },
  { key: 'cCount', label: 'Cytosine (C) Count', unit: 'bases' },
  { key: 'length', label: 'Sequence Length', unit: 'bp' },
];

export const FeatureScatterPlot: React.FC<Props> = ({
  sequences,
  unknownFeatures,
  unknownName = 'ATGCGCGATC',
  onSelectSequence,
}) => {
  const [xAxis, setXAxis] = useState<FeatureKey>('gcPercent');
  const [yAxis, setYAxis] = useState<FeatureKey>('bioactivityMetric');
  const [hoveredPoint, setHoveredPoint] = useState<SequenceWithFeatures | 'unknown' | null>(null);

  // Compute boundaries with padding
  const xValues = sequences.map((s) => s.features[xAxis]);
  const yValues = sequences.map((s) => s.features[yAxis]);

  if (unknownFeatures) {
    xValues.push(unknownFeatures[xAxis]);
    yValues.push(unknownFeatures[yAxis]);
  }

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const padMinX = Math.max(0, minX - spanX * 0.1);
  const padMaxX = maxX + spanX * 0.1;
  const padMinY = Math.max(0, minY - spanY * 0.1);
  const padMaxY = maxY + spanY * 0.1;

  const getCoord = (x: number, y: number) => {
    const xPct = ((x - padMinX) / (padMaxX - padMinX)) * 100;
    const yPct = 100 - ((y - padMinY) / (padMaxY - padMinY)) * 100;
    return {
      x: Math.max(5, Math.min(95, xPct)),
      y: Math.max(5, Math.min(95, yPct)),
    };
  };

  const xConfig = AVAILABLE_AXES.find((a) => a.key === xAxis)!;
  const yConfig = AVAILABLE_AXES.find((a) => a.key === yAxis)!;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Interactive 2D Feature Space & Clustering
            </h3>
            <p className="text-xs text-slate-500">
              Visualize class separation between Group A, Group B & Unknown sequence
            </p>
          </div>
        </div>

        {/* Axis Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-slate-500">X-Axis:</span>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value as FeatureKey)}
              aria-label="X-Axis Feature"
              className="bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {AVAILABLE_AXES.map((axis) => (
                <option key={axis.key} value={axis.key}>
                  {axis.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-slate-500">Y-Axis:</span>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value as FeatureKey)}
              aria-label="Y-Axis Feature"
              className="bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {AVAILABLE_AXES.map((axis) => (
                <option key={axis.key} value={axis.key}>
                  {axis.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2D Canvas Area */}
      <div className="relative mt-4 h-72 sm:h-80 w-full bg-slate-50/70 border border-slate-200 rounded-lg overflow-hidden select-none">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4">
          <div className="border-b border-dashed border-slate-200 w-full"></div>
          <div className="border-b border-dashed border-slate-200 w-full"></div>
          <div className="border-b border-dashed border-slate-200 w-full"></div>
          <div className="border-b border-dashed border-slate-200 w-full"></div>
        </div>
        <div className="absolute inset-0 flex justify-between pointer-events-none p-4">
          <div className="border-r border-dashed border-slate-200 h-full"></div>
          <div className="border-r border-dashed border-slate-200 h-full"></div>
          <div className="border-r border-dashed border-slate-200 h-full"></div>
          <div className="border-r border-dashed border-slate-200 h-full"></div>
        </div>

        {/* Approximate Decision Boundary Line (when GC% is on X axis) */}
        {xAxis === 'gcPercent' && (
          <div
            className="absolute top-0 bottom-0 border-r-2 border-dashed border-indigo-400/80 pointer-events-none z-0"
            style={{
              left: `${getCoord(58, padMinY).x}%`,
            }}
          >
            <span className="absolute top-2 left-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
              Linear Split: GC ≈ 58%
            </span>
          </div>
        )}

        {/* Data points */}
        {sequences.map((seq) => {
          const coords = getCoord(seq.features[xAxis], seq.features[yAxis]);
          const isGroupA = seq.group === 'Group A';

          return (
            <div
              key={seq.id}
              onClick={() => onSelectSequence?.(seq)}
              onMouseEnter={() => setHoveredPoint(seq)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-200 hover:scale-135"
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 shadow-sm flex items-center justify-center transition-all ${
                  isGroupA
                    ? 'bg-emerald-500 border-white ring-2 ring-emerald-300/40'
                    : 'bg-indigo-600 border-white ring-2 ring-indigo-300/40'
                }`}
              ></div>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/80 px-1 py-0.2 rounded absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap shadow-xs">
                {seq.id}
              </span>
            </div>
          );
        })}

        {/* Unknown Sequence Point */}
        {unknownFeatures && (
          <div
            onMouseEnter={() => setHoveredPoint('unknown')}
            onMouseLeave={() => setHoveredPoint(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-transform duration-200 hover:scale-125"
            style={{
              left: `${getCoord(unknownFeatures[xAxis], unknownFeatures[yAxis]).x}%`,
              top: `${getCoord(unknownFeatures[xAxis], unknownFeatures[yAxis]).y}%`,
            }}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-75"></span>
              <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center ring-2 ring-amber-400/80">
                <Crosshair className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-[10px] font-mono font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-xs">
              Unknown: {unknownName}
            </span>
          </div>
        )}

        {/* Floating Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white backdrop-blur-xs p-2.5 rounded-lg text-xs shadow-lg z-30 max-w-xs pointer-events-none border border-slate-700">
            {hoveredPoint === 'unknown' && unknownFeatures ? (
              <div>
                <p className="font-bold text-amber-300 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5" /> Unknown Sequence ({unknownName})
                </p>
                <p className="text-slate-300 font-mono text-[11px] mt-0.5">
                  {xAxis}: <span className="text-white font-bold">{unknownFeatures[xAxis]} {xConfig.unit}</span>
                </p>
                <p className="text-slate-300 font-mono text-[11px]">
                  {yAxis}: <span className="text-white font-bold">{unknownFeatures[yAxis]} {yConfig.unit}</span>
                </p>
                <p className="text-[10px] text-amber-200/90 mt-1 italic">
                  Clustering closely with Group B high-GC specimens!
                </p>
              </div>
            ) : hoveredPoint !== 'unknown' && hoveredPoint ? (
              <div>
                <p className="font-bold text-white flex items-center justify-between">
                  <span>{hoveredPoint.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      hoveredPoint.group === 'Group A' ? 'bg-emerald-800 text-emerald-200' : 'bg-indigo-800 text-indigo-200'
                    }`}
                  >
                    {hoveredPoint.group}
                  </span>
                </p>
                <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                  Seq: <span className="text-amber-300">{hoveredPoint.sequence}</span>
                </p>
                <div className="grid grid-cols-2 gap-x-2 mt-1 text-[11px] font-mono">
                  <span>{xConfig.label}: {hoveredPoint.features[xAxis]}</span>
                  <span>{yConfig.label}: {hoveredPoint.features[yAxis]}</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Axis & Legend Footnote */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Group A (Low GC / Standard)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
            <span>Group B (High GC / High Affinity)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-amber-800">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-300 inline-block"></span>
            <span>Unknown Target</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Click any marker to inspect its full nucleotide breakdown.</span>
        </div>
      </div>
    </div>
  );
};
