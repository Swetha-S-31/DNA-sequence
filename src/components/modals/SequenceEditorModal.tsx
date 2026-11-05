import React, { useState } from 'react';
import { DNASequence } from '../../types/bio';
import { isValidDNA, sanitizeDNA } from '../../utils/bioMath';
import { Plus, Trash2, Edit3, X, Check, Upload, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sequences: DNASequence[];
  onUpdateSequences: (newSeqs: DNASequence[]) => void;
  onResetToDefault: () => void;
}

export const SequenceEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sequences,
  onUpdateSequences,
  onResetToDefault,
}) => {
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newSeq, setNewSeq] = useState('');
  const [newGroup, setNewGroup] = useState<'Group A' | 'Group B'>('Group A');
  const [newBioactivity, setNewBioactivity] = useState(50);
  const [errorMsg, setErrorMsg] = useState('');

  const [fastaInput, setFastaInput] = useState('');
  const [showFasta, setShowFasta] = useState(false);

  if (!isOpen) return null;

  const handleAddSequence = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanSeq = sanitizeDNA(newSeq);
    const valid = isValidDNA(cleanSeq);

    if (!valid.valid) {
      setErrorMsg('Invalid DNA sequence. Only characters A, T, G, C allowed.');
      return;
    }

    if (!newId.trim()) {
      setErrorMsg('Please specify a Sequence ID (e.g. S13)');
      return;
    }

    if (sequences.some((s) => s.id.toLowerCase() === newId.trim().toLowerCase())) {
      setErrorMsg(`Sequence ID "${newId}" already exists. Please choose a unique ID.`);
      return;
    }

    const item: DNASequence = {
      id: newId.trim().toUpperCase(),
      name: newName.trim() || `Sample ${newId.trim()}`,
      sequence: cleanSeq,
      group: newGroup,
      bioactivityMetric: Number(newBioactivity),
      description: 'User added custom biological sample',
    };

    onUpdateSequences([...sequences, item]);
    setNewId('');
    setNewName('');
    setNewSeq('');
    setNewBioactivity(50);
  };

  const handleDelete = (id: string) => {
    onUpdateSequences(sequences.filter((s) => s.id !== id));
  };

  const handleImportFasta = () => {
    try {
      const lines = fastaInput.split('\n');
      const parsed: DNASequence[] = [];
      let currentHeader = '';
      let currentSeq = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('>')) {
          if (currentHeader && currentSeq) {
            const clean = sanitizeDNA(currentSeq);
            if (clean.length > 0) {
              const id = currentHeader.split(' ')[0].replace('>', '');
              parsed.push({
                id,
                name: currentHeader.replace('>', ''),
                sequence: clean,
                group: clean.split('').filter((c) => c === 'G' || c === 'C').length / clean.length > 0.55 ? 'Group B' : 'Group A',
                bioactivityMetric: 50,
                description: 'Imported via FASTA',
              });
            }
          }
          currentHeader = trimmed;
          currentSeq = '';
        } else {
          currentSeq += trimmed;
        }
      }

      if (currentHeader && currentSeq) {
        const clean = sanitizeDNA(currentSeq);
        if (clean.length > 0) {
          const id = currentHeader.split(' ')[0].replace('>', '');
          parsed.push({
            id,
            name: currentHeader.replace('>', ''),
            sequence: clean,
            group: clean.split('').filter((c) => c === 'G' || c === 'C').length / clean.length > 0.55 ? 'Group B' : 'Group A',
            bioactivityMetric: 50,
            description: 'Imported via FASTA',
          });
        }
      }

      if (parsed.length > 0) {
        onUpdateSequences([...sequences, ...parsed]);
        setFastaInput('');
        setShowFasta(false);
      } else {
        setErrorMsg('Could not parse any valid FASTA records with A, T, G, C nucleotides.');
      }
    } catch (err) {
      setErrorMsg('Failed to parse FASTA string. Ensure format begins with >Header.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage Dataset Sequences</h3>
            <p className="text-xs text-slate-500">
              Add, remove, or edit training sequences and bioactivity labels
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Add New Sequence Form */}
          <form onSubmit={handleAddSequence} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              Add New DNA Sequence
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ID (e.g. S13)
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="S13"
                  className="w-full font-mono text-xs px-2.5 py-1.5 border border-slate-300 rounded-md uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Label / Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Optional Name"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Class Group
                </label>
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-semibold"
                >
                  <option value="Group A">Group A (Low/Mod GC)</option>
                  <option value="Group B">Group B (High GC)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bioactivity ({newBioactivity})
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newBioactivity}
                  onChange={(e) => setNewBioactivity(Number(e.target.value))}
                  className="w-full mt-2 accent-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                DNA Sequence String (A, T, G, C)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSeq}
                  onChange={(e) => setNewSeq(e.target.value.toUpperCase())}
                  placeholder="e.g. ATGCGATCGG"
                  className="flex-1 font-mono text-xs uppercase px-2.5 py-1.5 border border-slate-300 rounded-md"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Sample</span>
                </button>
              </div>
            </div>
          </form>

          {/* FASTA Import Expandable Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Batch FASTA Import</span>
              <button
                type="button"
                onClick={() => setShowFasta(!showFasta)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {showFasta ? 'Hide FASTA Box' : 'Import Multiple via FASTA'}
              </button>
            </div>

            {showFasta && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <textarea
                  value={fastaInput}
                  onChange={(e) => setFastaInput(e.target.value)}
                  placeholder=">Seq_Sample1&#10;ATGCGATCGCTA&#10;>Seq_Sample2&#10;GCGCGCGCTATA"
                  className="w-full h-24 font-mono text-xs p-2 border border-slate-300 rounded-md"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    onClick={handleImportFasta}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-md flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" /> Import Sequences
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Sequences List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Active Training Samples ({sequences.length})
              </span>
              <button
                onClick={onResetToDefault}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset to Assignment Defaults
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {sequences.map((s) => (
                <div key={s.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800 w-10">{s.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        s.group === 'Group A'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}
                    >
                      {s.group}
                    </span>
                    <span className="font-mono font-bold text-slate-900 tracking-wider">
                      {s.sequence}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({s.sequence.length} bp, Act: {s.bioactivityMetric})
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Remove sequence"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
