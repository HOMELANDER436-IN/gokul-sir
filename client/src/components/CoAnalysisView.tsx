import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import type { ClassAnalysis } from '../types';

interface CoAnalysisViewProps {
  analysis: ClassAnalysis | null;
}

export const CoAnalysisView: React.FC<CoAnalysisViewProps> = ({ analysis }) => {
  if (!analysis) return null;

  const coRows = [
    { key: 'co1', name: 'CO1', desc: 'Differential Calculus & Infinite Series' },
    { key: 'co2', name: 'CO2', desc: 'Multivariable Calculus & Partial Derivatives' },
    { key: 'co3', name: 'CO3', desc: 'Multiple Integrals & Vector Calculus' },
    { key: 'co4', name: 'CO4', desc: 'First Order Ordinary Differential Equations' },
    { key: 'co5', name: 'CO5', desc: 'Linear Differential Equations of Higher Order' },
  ] as const;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Class Course Outcome (CO) Analysis</h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic attainment criteria: Students with CO between 55% and 100% are counted as attained.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Level 3: &gt; 75%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            Level 2: &gt; 65%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            Level 1: &gt; 55%
          </span>
        </div>
      </div>

      {/* Attainment Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Course Outcome</th>
                <th className="py-3.5 px-3">Description</th>
                <th className="py-3.5 px-3 text-center">Attained (55-100)</th>
                <th className="py-3.5 px-3 text-center">Total Students</th>
                <th className="py-3.5 px-3 text-center">Attainment %</th>
                <th className="py-3.5 px-3 text-center">Attainment Level</th>
                <th className="py-3.5 px-3 text-center">Class Average</th>
                <th className="py-3.5 px-4 text-center">NBA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {coRows.map(row => {
                const item = analysis.summary[row.key];
                const isLevel3 = item.level === 3;
                return (
                  <tr key={row.key} className="hover:bg-slate-800/40 transition-colors font-sans">
                    <td className="py-4 px-4 font-heading font-extrabold text-white text-sm">
                      {row.name}
                    </td>
                    <td className="py-4 px-3 text-slate-300 text-xs">
                      {row.desc}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-white">
                      {item.attainedCount}
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-slate-400">
                      {item.totalStudents}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-extrabold text-base text-indigo-400">
                      {item.percentage}%
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        isLevel3 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : item.level === 2
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : item.level === 1
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        Level {item.level || 0}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-bold text-cyan-400">
                      {item.average}%
                    </td>
                    <td className="py-4 px-4 text-center font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Target Exceeded</span>
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Continuous Evaluation Row */}
              <tr className="bg-slate-950/60 font-sans border-t-2 border-slate-700/60">
                <td className="py-4 px-4 font-heading font-extrabold text-cyan-400 text-sm">
                  Continuous Eval
                </td>
                <td className="py-4 px-3 text-slate-300 text-xs">
                  Continuous Evaluation based on Internal marks (I / 30 * 100)
                </td>
                <td className="py-4 px-3 text-center font-mono font-bold text-white">
                  {analysis.summary.continuousEvaluation.attainedCount}
                </td>
                <td className="py-4 px-3 text-center font-mono text-slate-400">
                  {analysis.summary.continuousEvaluation.denominator} (Configured)
                </td>
                <td className="py-4 px-3 text-center font-mono font-extrabold text-base text-cyan-400">
                  {analysis.summary.continuousEvaluation.percentage}%
                </td>
                <td className="py-4 px-3 text-center">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                    {analysis.summary.continuousEvaluation.level ? `Level ${analysis.summary.continuousEvaluation.level}` : 'No Attainment'}
                  </span>
                </td>
                <td className="py-4 px-3 text-center font-mono font-bold text-amber-400">
                  {analysis.summary.continuousEvaluation.average}%
                </td>
                <td className="py-4 px-4 text-center font-sans text-slate-400 text-[11px]">
                  Threshold: 70/60/50
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Explanatory Box */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-bold text-indigo-400 text-sm">
          <Info className="w-4 h-4" />
          <span>Formula Reference & Mathematical Transparency</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="font-bold text-white block">Student CO Formula</span>
            <code className="text-indigo-300 font-mono text-[11px] block">CO = ((Internal Mark + University Mark) / 150) * 100</code>
            <p className="text-slate-400 text-[11px]">Internal max: 50, University max: 100. Total denominator: 150.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="font-bold text-white block">Continuous Evaluation Formula</span>
            <code className="text-cyan-300 font-mono text-[11px] block">CE = (Internal Mark / 30) * 100</code>
            <p className="text-slate-400 text-[11px]">Class attainment denominator is configurable (default: 14 per legacy workbook).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
