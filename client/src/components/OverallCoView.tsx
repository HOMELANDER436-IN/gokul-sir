import { useState, useEffect } from 'react';
import type { OverallData } from '../types';
import { api } from '../api/client';

export const OverallCoView: React.FC = () => {
  const [data, setData] = useState<OverallData | null>(null);

  useEffect(() => {
    loadOverall();
  }, []);

  const loadOverall = async () => {
    try {
      const res = await api.getOverall();
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

    setData({
      ...data,
      mapping: newMapping
    });

    api.updateOverallMapping(newMapping).then(res => {
      setData(res);
    }).catch(console.error);
  };

  if (!data) {
    return <div className="py-20 text-center text-slate-400">Loading Overall CO module...</div>;
  }

  const outcomes = [
    'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 
    'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12', 
    'PSO1', 'PSO2', 'PSO3'
  ];

  const cos = [
    'ESL120.1', 'ESL120.2', 'ESL120.3', 'ESL120.4', 
    'ESL120.5', 'ESL120.6', 'ESL120.7', 'ESL120.8'
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
              ESL120 Laboratory Module
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">Overall CO Assessment & Mapping (8 COs)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Independent course outcome articulation for ESL120.1 – ESL120.8 laboratory outcomes.
          </p>
        </div>
      </div>

      {/* Assessment Tools for Overall CO */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-heading font-bold text-sm text-white">Assessment Tools Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          {cos.map(co => (
            <div key={co} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">{co}</span>
              <span className="text-lg font-extrabold text-cyan-400 block mt-0.5">
                {data.tools?.final?.[co] ?? 3}
              </span>
              <span className="text-[9px] text-slate-500">Attained CO</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mapping & Attainment Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-1">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <h3 className="font-heading font-bold text-sm text-white">ESL120 Correlation Matrix & Direct Attainment</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Scale 0–3, Target = 3</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-24">CO</th>
                <th className="py-3 px-2 text-center w-16 text-cyan-400">Target</th>
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
                  <td className="py-2.5 px-3 font-heading font-bold text-white text-xs">
                    {co}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-cyan-400">
                    {data.mapping[co]?.targetCO ?? 3}
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
                              ? 'bg-cyan-600 text-white' 
                              : val === 2 
                              ? 'bg-cyan-900/60 text-cyan-300' 
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
              ))}

              {/* Original Attainment */}
              <tr className="bg-cyan-950/40 border-t-2 border-cyan-900/60 font-bold">
                <td colSpan={2} className="py-3 px-3 font-sans text-cyan-300 uppercase text-[11px] tracking-wider">
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

              {/* Final PO/PSO Attainment */}
              <tr className="bg-emerald-950/40 border-t border-emerald-900/40 font-bold">
                <td colSpan={2} className="py-3 px-3 font-sans text-emerald-300 uppercase text-[11px] tracking-wider">
                  Final PO/PSO Attainment
                </td>
                {outcomes.map(out => {
                  const val = data.finalAttainment[out];
                  return (
                    <td key={out} className="py-3 px-1 text-center">
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
