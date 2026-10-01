import { useState, useEffect } from 'react';
import type { MappingData } from '../types';
import { api } from '../api/client';

export const MappingView: React.FC = () => {
  const [data, setData] = useState<MappingData | null>(null);

  useEffect(() => {
    loadMapping();
  }, []);

  const loadMapping = async () => {
    try {
      const res = await api.getMapping();
      setData(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCellChange = (co: string, outcome: string, value: number) => {
    if (!data) return;
    const newMapping = {
      ...data.mapping,
      [co]: {
        ...data.mapping[co],
        [outcome]: value
      }
    };

    // Optimistically update and save
    setData({
      ...data,
      mapping: newMapping
    });

    api.updateMapping(newMapping).then(res => {
      setData(res);
    }).catch(console.error);
  };

  if (!data) {
    return <div className="py-20 text-center text-slate-400">Loading PO/PSO mapping...</div>;
  }

  const outcomes = [
    'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 
    'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12', 
    'PSO1', 'PSO2', 'PSO3'
  ];

  const cos = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">CO – PO – PSO Articulation Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">
            Correlation levels: <strong>0</strong> (None), <strong>1</strong> (Low), <strong>2</strong> (Medium), <strong>3</strong> (High). Changes automatically recalculate Original and Final Attainment.
          </p>
        </div>
      </div>

      {/* Section 1: Original Mapping & Attainment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-1">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <h3 className="font-heading font-bold text-sm text-white">Original Correlation Matrix & Baseline Attainment</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Original Attainment = SUM(&gt;0) / COUNT(&gt;0)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-20">CO</th>
                <th className="py-3 px-3 w-28 text-center text-indigo-400">Final CO</th>
                {outcomes.map(out => (
                  <th key={out} className="py-3 px-2 text-center w-14 font-mono">
                    {out}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {cos.map(co => {
                const coLower = co.toLowerCase();
                const finalCoVal = data.assessmentTools?.final?.[coLower] ?? 0;
                return (
                  <tr key={co} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-heading font-bold text-white text-xs">
                      {co}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-indigo-400">
                      {finalCoVal.toFixed(2)}
                    </td>
                    {outcomes.map(out => {
                      const val = data.mapping[co]?.[out] ?? 0;
                      return (
                        <td key={out} className="py-1 px-1 text-center">
                          <select
                            value={val}
                            onChange={e => handleCellChange(co, out, parseInt(e.target.value))}
                            className={`w-full py-1 text-center font-bold text-xs rounded transition-colors cursor-pointer appearance-none ${
                              val === 3 
                                ? 'bg-indigo-600 text-white' 
                                : val === 2 
                                ? 'bg-indigo-900/60 text-indigo-300' 
                                : val === 1 
                                ? 'bg-slate-800 text-slate-300' 
                                : 'bg-slate-950 text-slate-600'
                            }`}
                          >
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Original Attainment Summary Row */}
              <tr className="bg-indigo-950/40 border-t-2 border-indigo-900/60 font-bold">
                <td colSpan={2} className="py-3 px-3 font-sans text-indigo-300 uppercase text-[11px] tracking-wider">
                  Original PO/PSO Attainment
                </td>
                {outcomes.map(out => {
                  const val = data.originalAttainment[out];
                  return (
                    <td key={out} className="py-3 px-1 text-center">
                      {val !== null ? (
                        <span className="text-white font-extrabold">{val.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-500 font-normal">N/A</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Final Attained Value Matrix & Final Attainment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-1">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="font-heading font-bold text-sm text-white">Final Direct Attainment Matrix & Overall PO/PSO Attainment</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Attained Value = (Final CO &times; Mapping) / 3</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-28">CO</th>
                {outcomes.map(out => (
                  <th key={out} className="py-3 px-2 text-center w-14 font-mono">
                    {out}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {cos.map(co => (
                <tr key={co} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-heading font-bold text-slate-300 text-xs">
                    {co} Attained
                  </td>
                  {outcomes.map(out => {
                    const val = data.attainedMatrix[co]?.[out] ?? 0;
                    return (
                      <td key={out} className="py-2 px-1 text-center">
                        {val > 0 ? (
                          <span className="text-slate-200">{val.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Final PO/PSO Attainment */}
              <tr className="bg-emerald-950/40 border-t-2 border-emerald-900/60 font-bold">
                <td className="py-3.5 px-3 font-sans text-emerald-300 uppercase text-[11px] tracking-wider">
                  Final PO/PSO Attainment
                </td>
                {outcomes.map(out => {
                  const val = data.finalAttainment[out];
                  return (
                    <td key={out} className="py-3.5 px-1 text-center">
                      {val !== null ? (
                        <span className="text-emerald-400 font-extrabold text-sm">{val.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-500 font-normal">N/A</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
