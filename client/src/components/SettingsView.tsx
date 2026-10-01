import { useState, useEffect } from 'react';
import { Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { Settings } from '../types';
import { api } from '../api/client';

interface SettingsViewProps {
  onSettingsSaved: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      setSettings(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleGradeMarkChange = (grade: string, mark: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      gradeMap: {
        ...settings.gradeMap,
        [grade]: mark
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateSettings(settings);
      setSaveSuccess(true);
      onSettingsSaved();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all thresholds and grade conversions to the original MAT101 workbook defaults?')) {
      try {
        await api.resetSettings();
        await loadSettings();
        onSettingsSaved();
        alert('Settings restored to workbook defaults.');
      } catch (err: any) {
        alert(`Reset failed: ${err.message}`);
      }
    }
  };

  if (!settings) {
    return <div className="py-20 text-center text-slate-400">Loading settings...</div>;
  }

  const grades = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'P', 'F', 'FE'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System Settings & Calculation Rubrics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure grade conversion marks, attainment thresholds, and continuous evaluation denominators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Workbook Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved! All student metrics and class attainments have been recalculated.</span>
        </div>
      )}

      {/* Grade Conversion Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
          <span>University Grade to Mark Conversion Rubric</span>
        </h3>
        <p className="text-xs text-slate-400">
          When a teacher selects a letter grade, the corresponding numeric university mark is assigned automatically.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {grades.map(g => (
            <div key={g} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-400 block">Grade {g}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.gradeMap[g] ?? 0}
                  onChange={e => handleGradeMarkChange(g, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold text-center focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thresholds Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CO Attainment Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-heading font-bold text-sm text-white">
            CO Attainment Thresholds (CO1–CO5)
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Level 3 Threshold (% &gt; value)
              </label>
              <input
                type="number"
                value={settings.coThresholds.level3}
                onChange={e => setSettings({
                  ...settings,
                  coThresholds: { ...settings.coThresholds, level3: parseFloat(e.target.value) || 75 }
                })}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Level 2 Threshold (% &gt; value)
              </label>
              <input
                type="number"
                value={settings.coThresholds.level2}
                onChange={e => setSettings({
                  ...settings,
                  coThresholds: { ...settings.coThresholds, level2: parseFloat(e.target.value) || 65 }
                })}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Level 1 Threshold (% &gt; value)
              </label>
              <input
                type="number"
                value={settings.coThresholds.level1}
                onChange={e => setSettings({
                  ...settings,
                  coThresholds: { ...settings.coThresholds, level1: parseFloat(e.target.value) || 55 }
                })}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Continuous Evaluation Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-heading font-bold text-sm text-white">
            Continuous Evaluation Thresholds & Denominator
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Eligible Students Denominator (Default: 14)
              </label>
              <input
                type="number"
                value={settings.ceThresholds.denominator}
                onChange={e => setSettings({
                  ...settings,
                  ceThresholds: { ...settings.ceThresholds, denominator: parseInt(e.target.value) || 14 }
                })}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-cyan-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Level 3 Threshold (% &gt; value, Default: 70)
              </label>
              <input
                type="number"
                value={settings.ceThresholds.level3}
                onChange={e => setSettings({
                  ...settings,
                  ceThresholds: { ...settings.ceThresholds, level3: parseFloat(e.target.value) || 70 }
                })}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Level 2 Threshold (% &gt; value, Default: 60)
              </label>
              <input
                type="number"
                value={settings.ceThresholds.level2}
                onChange={e => setSettings({
                  ...settings,
                  ceThresholds: { ...settings.ceThresholds, level2: parseFloat(e.target.value) || 60 }
                })}
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
