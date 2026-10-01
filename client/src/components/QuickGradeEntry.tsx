import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Zap, 
  CheckCircle2, 
  History, 
  Calculator 
} from 'lucide-react';
import type { Student, AuditLog } from '../types';
import { api } from '../api/client';

interface QuickGradeEntryProps {
  students: Student[];
  onStudentUpdated: (student: Student) => void;
}

const GRADES = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'P', 'F', 'FE'];

export const QuickGradeEntry: React.FC<QuickGradeEntryProps> = ({
  students,
  onStudentUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('B');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live preview state
  const [preview, setPreview] = useState<{
    universityMark: number;
    co1: number;
    co2: number;
    co3: number;
    co4: number;
    co5: number;
    continuousEvaluation: number;
  } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Autocomplete suggestions
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.registerNo.toLowerCase().includes(q) ||
      String(s.rollNo).includes(q)
    ).slice(0, 8);
  }, [students, searchQuery]);

  // Load audit logs on mount
  useEffect(() => {
    api.getAuditLogs().then(setAuditLogs).catch(() => {});
  }, []);

  // Set default student if none selected
  useEffect(() => {
    if (!selectedStudent && students.length > 0) {
      handleSelectStudent(students[0]);
    }
  }, [students]);

  // Recalculate preview whenever selectedStudent or selectedGrade changes
  useEffect(() => {
    if (!selectedStudent) return;
    api.previewCalculation(selectedStudent.internalMark, selectedGrade)
      .then(res => setPreview(res))
      .catch(() => {});
  }, [selectedStudent, selectedGrade]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSelectedGrade(student.assessment?.grade || 'B');
    setSearchQuery('');
    setIsDropdownOpen(false);
    setSaveSuccess(false);
  };

  const handleSaveAndCalculate = async () => {
    if (!selectedStudent) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.updateStudentGrade(selectedStudent.id, selectedGrade);
      onStudentUpdated(res.student);
      setSelectedStudent(res.student);
      setSaveSuccess(true);
      // Refresh audit logs
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide uppercase">
          <Zap className="w-3.5 h-3.5" />
          <span>Focused Teacher Assessment Mode</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Quick Grade Entry & Calculation</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Type student name or register number, pick the grade, and click Save. All CO metrics, university marks, and continuous evaluations calculate automatically.
        </p>
      </div>

      {/* Main Interactive Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Step 1: Search Autocomplete */}
        <div className="space-y-2" ref={searchContainerRef}>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Step 1: Search / Select Student
          </label>
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type student name (e.g. Akash), register number (CEC19CS...), or roll..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-slate-800/90 border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
            />

            {/* Dropdown suggestions */}
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-850 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 divide-y divide-slate-800">
                {searchResults.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStudent(s)}
                    className="w-full px-4 py-3 text-left hover:bg-indigo-600/20 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-indigo-300 text-sm">
                        {s.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {s.registerNo} • Roll: {s.rollNo}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">Internal: {s.internalMark}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {s.assessment?.grade || 'None'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Student Banner & Grade Selection */}
        {selectedStudent && (
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                  {selectedStudent.rollNo}
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-lg text-white">{selectedStudent.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{selectedStudent.registerNo}</span>
                    <span>•</span>
                    <span>Roll No: {selectedStudent.rollNo}</span>
                  </div>
                </div>
              </div>

              {/* Internal Mark badge */}
              <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Internal Mark</span>
                  <span className="text-xl font-extrabold text-indigo-400 font-mono">
                    {selectedStudent.internalMark} <span className="text-xs text-slate-500">/ 50</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Pick Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Step 2: Select University Grade
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {GRADES.map(g => {
                    const isSelected = selectedGrade === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGrade(g)}
                        className={`py-3 px-2 rounded-xl font-heading font-bold text-sm transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400 scale-105'
                            : 'bg-slate-900/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col justify-center items-center sm:items-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAndCalculate}
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSaving ? 'Calculating...' : 'SAVE & CALCULATE'}</span>
                </button>
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Calculated & saved to database!
                  </span>
                )}
              </div>
            </div>

            {/* Step 3: Automatic Calculation Live Preview */}
            {preview && (
              <div className="rounded-2xl bg-slate-950/80 border border-indigo-500/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    <Calculator className="w-4 h-4" />
                    <span>Automatic Live Calculation Preview</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    CO = (({selectedStudent.internalMark} + {preview.universityMark}) / 150) * 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Univ Mark</span>
                    <span className="text-xl font-extrabold text-cyan-400 font-mono">{preview.universityMark}</span>
                    <span className="text-[9px] text-slate-500 block">From Grade {selectedGrade}</span>
                  </div>

                  {(['co1', 'co2', 'co3', 'co4', 'co5'] as const).map((co, idx) => {
                    const val = preview[co];
                    const isAttained = val >= 55;
                    return (
                      <div key={co} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">CO{idx + 1}</span>
                        <span className={`text-xl font-extrabold font-mono ${isAttained ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {val.toFixed(2)}%
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          {isAttained ? 'Attained (≥55)' : 'Below 55'}
                        </span>
                      </div>
                    );
                  })}

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cont. Eval</span>
                    <span className="text-xl font-extrabold text-amber-400 font-mono">
                      {preview.continuousEvaluation.toFixed(2)}%
                    </span>
                    <span className="text-[9px] text-slate-500 block">Internal/30*100</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Grade History / Audit Logs */}
      {auditLogs.length > 0 && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Recent Grade Change Audit Trail</span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-slate-950/80 text-slate-400 sticky top-0 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Roll</th>
                  <th className="p-2.5">Student</th>
                  <th className="p-2.5 text-center">Previous Grade</th>
                  <th className="p-2.5 text-center">New Grade</th>
                  <th className="p-2.5 text-center">Previous Univ Mark</th>
                  <th className="p-2.5 text-center">New Univ Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.slice(0, 10).map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-slate-400 font-sans text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2.5 text-slate-300">{log.rollNo}</td>
                    <td className="p-2.5 font-sans font-medium text-white">{log.studentName}</td>
                    <td className="p-2.5 text-center text-slate-400">{log.oldGrade || '-'}</td>
                    <td className="p-2.5 text-center font-bold text-indigo-400">{log.newGrade}</td>
                    <td className="p-2.5 text-center text-slate-400">{log.oldUniversityMark ?? '-'}</td>
                    <td className="p-2.5 text-center font-bold text-cyan-400">{log.newUniversityMark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
