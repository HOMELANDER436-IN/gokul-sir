import { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertCircle
} from 'lucide-react';
import type { Student, ClassAnalysis } from '../types';
import { api } from '../api/client';
import { AddStudentModal } from './AddStudentModal';

interface ExcelSheetViewProps {
  students: Student[];
  analysis: ClassAnalysis | null;
  onStudentUpdated: (student: Student) => void;
  onStudentAdded: (student: Student) => void;
  onStudentDeleted: (id: string) => void;
}

const GRADES = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'P', 'F', 'FE'];

export const ExcelSheetView: React.FC<ExcelSheetViewProps> = ({
  students,
  analysis,
  onStudentUpdated,
  onStudentAdded,
  onStudentDeleted
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.rollNo).includes(searchTerm);
      
      const matchGrade = gradeFilter === 'ALL' || (s.assessment?.grade || '').toUpperCase() === gradeFilter;

      return matchSearch && matchGrade;
    });
  }, [students, searchTerm, gradeFilter]);

  const handleGradeChange = async (student: Student, newGrade: string) => {
    setSavingId(student.id);
    try {
      const res = await api.updateStudentGrade(student.id, newGrade);
      onStudentUpdated(res.student);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleInternalMarkBlur = async (student: Student, newMark: number) => {
    if (isNaN(newMark) || newMark === student.internalMark) return;
    setSavingId(student.id);
    try {
      const res = await api.updateStudent(student.id, { internalMark: newMark });
      onStudentUpdated(res);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleTextChange = async (student: Student, field: 'name' | 'registerNo', val: string) => {
    if (!val.trim() || val === student[field]) return;
    setSavingId(student.id);
    try {
      const res = await api.updateStudent(student.id, { [field]: val.trim() });
      onStudentUpdated(res);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"?`)) {
      try {
        await api.deleteStudent(id);
        onStudentDeleted(id);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const nextRollNo = useMemo(() => {
    if (students.length === 0) return 1;
    return Math.max(...students.map(s => s.rollNo)) + 1;
  }, [students]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Attainment Summary Strip */}
      {analysis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(['co1', 'co2', 'co3', 'co4', 'co5'] as const).map((co, idx) => {
            const item = analysis.summary[co];
            const isLevel3 = item.level === 3;
            return (
              <div 
                key={co} 
                className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 p-3 shadow-md hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CO{idx + 1}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isLevel3 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    Level {item.level}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white tracking-tight">{item.percentage}%</span>
                  <span className="text-[11px] text-slate-400">({item.attainedCount}/{item.totalStudents})</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isLevel3 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Continuous Evaluation Summary Card */}
          <div className="relative overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 p-3 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Continuous Eval</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                {analysis.summary.continuousEvaluation.level ? `L${analysis.summary.continuousEvaluation.level}` : 'No Attain'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-cyan-400 tracking-tight">
                {analysis.summary.continuousEvaluation.percentage}%
              </span>
              <span className="text-[11px] text-slate-400">
                ({analysis.summary.continuousEvaluation.attainedCount}/{analysis.summary.continuousEvaluation.denominator})
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, analysis.summary.continuousEvaluation.percentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Excel-like Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student, register no, or roll..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Grades ({students.length})</option>
              {GRADES.map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Type Name, Reg No & Grade → Everything Auto-Calculates</span>
            </span>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Interactive Spreadsheet Grid */}
        <div className="overflow-x-auto max-h-[720px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="sticky top-0 z-20 bg-slate-950 text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-14 text-center">Roll</th>
                <th className="py-3 px-3 min-w-[200px]">Student Name</th>
                <th className="py-3 px-3 min-w-[130px]">Register No</th>
                <th className="py-3 px-2 w-28 text-center bg-indigo-950/30 border-x border-indigo-900/30">
                  Internal (50)
                </th>
                <th className="py-3 px-3 w-28 text-center bg-indigo-900/40 border-r border-indigo-800/40">
                  Grade
                </th>
                <th className="py-3 px-2 w-28 text-center text-cyan-400 bg-cyan-950/20 border-r border-cyan-900/30">
                  Univ Mark (100)
                </th>
                <th className="py-3 px-2 w-20 text-center">CO1</th>
                <th className="py-3 px-2 w-20 text-center">CO2</th>
                <th className="py-3 px-2 w-20 text-center">CO3</th>
                <th className="py-3 px-2 w-20 text-center">CO4</th>
                <th className="py-3 px-2 w-20 text-center">CO5</th>
                <th className="py-3 px-2 w-24 text-center text-amber-400">Cont. Eval</th>
                <th className="py-3 px-2 w-24 text-center">Status</th>
                <th className="py-3 px-2 w-14 text-center">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400 font-sans">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, rowIdx) => {
                  const assessment = s.assessment || {};
                  const isSaving = savingId === s.id;
                  const isAttained = (assessment.co1 ?? 0) >= 55;

                  return (
                    <tr 
                      key={s.id}
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        rowIdx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/70'
                      }`}
                    >
                      {/* Roll No */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-bold">
                        {s.rollNo}
                      </td>

                      {/* Student Name */}
                      <td className="py-2.5 px-3 font-sans text-slate-200">
                        <input
                          type="text"
                          defaultValue={s.name}
                          onBlur={e => handleTextChange(s, 'name', e.target.value)}
                          className="excel-grid-input font-medium text-white hover:bg-slate-800/60 focus:bg-slate-800"
                        />
                      </td>

                      {/* Register No */}
                      <td className="py-2.5 px-3 text-slate-300">
                        <input
                          type="text"
                          defaultValue={s.registerNo}
                          onBlur={e => handleTextChange(s, 'registerNo', e.target.value)}
                          className="excel-grid-input text-slate-300 hover:bg-slate-800/60 focus:bg-slate-800 uppercase"
                        />
                      </td>

                      {/* Internal Mark */}
                      <td className="py-2.5 px-2 text-center bg-indigo-950/15 border-x border-indigo-900/20">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="50"
                          defaultValue={s.internalMark}
                          onBlur={e => handleInternalMarkBlur(s, parseFloat(e.target.value))}
                          className="excel-grid-input text-center font-bold text-indigo-300 hover:bg-indigo-900/30 focus:bg-slate-800"
                        />
                      </td>

                      {/* Grade Selector (Interactive dropdown) */}
                      <td className="py-2 px-2 text-center bg-indigo-900/20 border-r border-indigo-800/30">
                        <select
                          value={assessment.grade || ''}
                          onChange={e => handleGradeChange(s, e.target.value)}
                          className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold text-center appearance-none cursor-pointer transition-all ${
                            assessment.grade === 'S' 
                              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                              : assessment.grade?.startsWith('A') 
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                              : assessment.grade?.startsWith('B')
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                              : assessment.grade?.startsWith('C')
                              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                              : assessment.grade === 'P'
                              ? 'bg-orange-600/30 text-orange-300 border border-orange-500/40'
                              : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          <option value="" disabled>Grade</option>
                          {GRADES.map(g => (
                            <option key={g} value={g} className="bg-slate-900 text-white font-semibold">
                              {g}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* University Mark (Calculated) */}
                      <td className="py-2.5 px-2 text-center font-extrabold text-cyan-400 bg-cyan-950/10 border-r border-cyan-900/20">
                        {isSaving ? (
                          <span className="text-[10px] text-indigo-400 animate-pulse">calc...</span>
                        ) : (
                          assessment.universityMark ?? '-'
                        )}
                      </td>

                      {/* CO1 to CO5 */}
                      <td className={`py-2.5 px-2 text-center ${(assessment.co1 ?? 0) >= 55 ? 'text-slate-200' : 'text-rose-400'}`}>
                        {(assessment.co1 ?? 0).toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-2 text-center ${(assessment.co2 ?? 0) >= 55 ? 'text-slate-200' : 'text-rose-400'}`}>
                        {(assessment.co2 ?? 0).toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-2 text-center ${(assessment.co3 ?? 0) >= 55 ? 'text-slate-200' : 'text-rose-400'}`}>
                        {(assessment.co3 ?? 0).toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-2 text-center ${(assessment.co4 ?? 0) >= 55 ? 'text-slate-200' : 'text-rose-400'}`}>
                        {(assessment.co4 ?? 0).toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-2 text-center ${(assessment.co5 ?? 0) >= 55 ? 'text-slate-200' : 'text-rose-400'}`}>
                        {(assessment.co5 ?? 0).toFixed(2)}
                      </td>

                      {/* Continuous Evaluation */}
                      <td className="py-2.5 px-2 text-center text-amber-300/90 font-medium">
                        {(assessment.continuousEvaluation ?? 0).toFixed(2)}
                      </td>

                      {/* Attainment Badge */}
                      <td className="py-2.5 px-2 text-center font-sans">
                        {isAttained ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-2.5 h-2.5" />
                            <span>Attained</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Below 55</span>
                          </span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          title="Delete student"
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Showing <span className="font-bold text-white">{filteredStudents.length}</span> of <span className="font-bold text-white">{students.length}</span> total students.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Attained (CO &ge; 55)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Needs Improvement (&lt; 55)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStudentAdded={onStudentAdded}
        nextRollNo={nextRollNo}
      />
    </div>
  );
};
