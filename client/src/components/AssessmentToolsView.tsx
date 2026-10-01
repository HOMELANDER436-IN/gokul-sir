import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Calculator } from 'lucide-react';
import { api } from '../api/client';

export const AssessmentToolsView: React.FC = () => {
  const [tools, setTools] = useState<{
    board: Record<string, number>;
    survey: Record<string, number>;
    final: Record<string, number>;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const data = await api.getAssessmentTools();
      setTools(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleValueChange = (type: 'board' | 'survey', co: string, val: number) => {
    if (!tools) return;
    const updated = {
      ...tools,
      [type]: {
        ...tools[type],
        [co]: val
      },
      final: {
        ...tools.final,
        [co]: (type === 'board' ? val + (tools.survey[co] || 0) : (tools.board[co] || 0) + val) / 2
      }
    };
    setTools(updated);
  };

  const handleSave = async () => {
    if (!tools) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateAssessmentTools({
        board: tools.board,
        survey: tools.survey
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!tools) {
    return <div className="py-20 text-center text-slate-400">Loading assessment tools...</div>;
  }

  const cos = ['co1', 'co2', 'co3', 'co4', 'co5'] as const;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Assessment Tools Configuration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure Board/University Exam and Indirect Survey metrics. Final CO is calculated as: <code>(Board + Survey) / 2</code>.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Assessment Tools'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Assessment tools updated and all PO/PSO attainments recalculated successfully!</span>
        </div>
      )}

      {/* Main Tools Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 min-w-[200px]">Assessment Tool</th>
                {cos.map((co, idx) => (
                  <th key={co} className="py-4 px-3 text-center w-28">
                    CO{idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {/* Board / University Exam */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-4 px-4 font-sans font-bold text-white">
                  Board / University Exam
                  <span className="block text-[11px] font-normal text-slate-400">Direct Assessment Tool</span>
                </td>
                {cos.map(co => (
                  <td key={co} className="py-3 px-3 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="3"
                      value={tools.board[co] ?? 3}
                      onChange={e => handleValueChange('board', co, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1.5 text-center bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                ))}
              </tr>

              {/* Survey */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-4 px-4 font-sans font-bold text-white">
                  Course Exit Survey
                  <span className="block text-[11px] font-normal text-slate-400">Indirect Assessment Tool</span>
                </td>
                {cos.map(co => (
                  <td key={co} className="py-3 px-3 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="3"
                      value={tools.survey[co] ?? 0}
                      onChange={e => handleValueChange('survey', co, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1.5 text-center bg-slate-800 border border-slate-700 rounded-lg text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </td>
                ))}
              </tr>

              {/* Final CO (Computed) */}
              <tr className="bg-indigo-950/20 font-bold border-t-2 border-indigo-900/40">
                <td className="py-4 px-4 font-sans text-indigo-300">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    <span>Final CO (Calculated)</span>
                  </div>
                  <span className="block text-[11px] font-normal text-slate-400 font-mono">=(Board + Survey) / 2</span>
                </td>
                {cos.map(co => (
                  <td key={co} className="py-4 px-3 text-center">
                    <span className="text-base text-indigo-400 font-extrabold">
                      {(tools.final[co] ?? 0).toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
