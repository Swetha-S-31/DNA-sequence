import React, { useState } from 'react';
import { SequenceWithFeatures } from '../../types/bio';
import { Table, ArrowUpDown, Search, Filter, Download, ExternalLink, Dna } from 'lucide-react';

interface Props {
  sequences: SequenceWithFeatures[];
  onSelectSequence: (seq: SequenceWithFeatures) => void;
  onOpenManageModal: () => void;
}

export const FeatureDataTable: React.FC<Props> = ({
  sequences,
  onSelectSequence,
  onOpenManageModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | 'Group A' | 'Group B'>('all');
  const [sortKey, setSortKey] = useState<keyof SequenceWithFeatures['features'] | 'id' | 'sequence'>('gcPercent');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter sequences
  const filtered = sequences.filter((s) => {
    const matchesGroup = groupFilter === 'all' || s.group === groupFilter;
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sequence.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  // Sort sequences
  const sorted = [...filtered].sort((a, b) => {
    let valA: any;
    let valB: any;

    if (sortKey === 'id') {
      valA = a.id;
      valB = b.id;
    } else if (sortKey === 'sequence') {
      valA = a.sequence;
      valB = b.sequence;
    } else {
      valA = a.features[sortKey];
      valB = b.features[sortKey];
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Sequence_ID,Name,Sequence,Group,A,T,G,C,Length,GC_Percent,AT_Percent,Purine_Ratio,CpG_Count,Tm_Celsius,Bioactivity',
    ];
    const rows = sorted.map(
      (s) =>
        `${s.id},"${s.name}",${s.sequence},${s.group},${s.features.aCount},${s.features.tCount},${s.features.gCount},${s.features.cCount},${s.features.length},${s.features.gcPercent},${s.features.atPercent},${s.features.purineRatio},${s.features.cpgCount},${s.features.meltingTemp},${s.features.bioactivityMetric}`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dna_feature_table_extracted.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Extracted Feature Matrix & Bioactivity Table
            </h3>
            <p className="text-xs text-slate-500">
              Interactive numerical representation of all {sequences.length} DNA samples
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID or bases..."
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Group Filter */}
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as any)}
            aria-label="Filter by Group"
            className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">All Groups</option>
            <option value="Group A">Group A Only</option>
            <option value="Group B">Group B Only</option>
          </select>

          {/* Manage Modal Trigger */}
          <button
            onClick={onOpenManageModal}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            Manage Data
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 select-none">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors min-w-[70px]"
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sequence')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors min-w-[130px]"
              >
                <div className="flex items-center gap-1">
                  <span>DNA Sequence</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-2 min-w-[80px]">Group</th>
              <th
                onClick={() => handleSort('aCount')}
                className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                A
              </th>
              <th
                onClick={() => handleSort('tCount')}
                className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                T
              </th>
              <th
                onClick={() => handleSort('gCount')}
                className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                G
              </th>
              <th
                onClick={() => handleSort('cCount')}
                className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                C
              </th>
              <th
                onClick={() => handleSort('length')}
                className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Length
              </th>
              <th
                onClick={() => handleSort('gcPercent')}
                className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors font-bold text-slate-900"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>GC%</span>
                  <ArrowUpDown className="w-3 h-3 text-indigo-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort('meltingTemp')}
                className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Tm (°C)
              </th>
              <th
                onClick={() => handleSort('cpgCount')}
                className="py-2.5 px-2 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              >
                CpG
              </th>
              <th
                onClick={() => handleSort('bioactivityMetric')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors min-w-[90px]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Bioactivity</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
            {sorted.map((s) => {
              const isGroupA = s.group === 'Group A';
              return (
                <tr
                  key={s.id}
                  onClick={() => onSelectSequence(s)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-2 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{s.id}</span>
                    <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="py-2 px-3 font-bold tracking-wider">
                    <span className="font-mono">{s.sequence}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                        isGroupA
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}
                    >
                      {s.group}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center text-emerald-800 font-medium">
                    {s.features.aCount}
                  </td>
                  <td className="py-2 px-2 text-center text-rose-800 font-medium">
                    {s.features.tCount}
                  </td>
                  <td className="py-2 px-2 text-center text-amber-800 font-bold">
                    {s.features.gCount}
                  </td>
                  <td className="py-2 px-2 text-center text-blue-800 font-bold">
                    {s.features.cCount}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600">
                    {s.features.length}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-indigo-900 bg-indigo-50/40">
                    {s.features.gcPercent}%
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600">
                    {s.features.meltingTemp}°
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600">
                    {s.features.cpgCount}
                  </td>
                  <td className="py-2 px-3 text-right font-sans font-bold text-slate-900">
                    {s.features.bioactivityMetric}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Showing {sorted.length} of {sequences.length} sequence records</span>
        <span className="italic">Click any row to open the duplex sequence inspector.</span>
      </div>
    </div>
  );
};
