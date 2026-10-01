import React, { useState, useEffect } from 'react';
import { X, UserPlus, Calculator, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import type { Student } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: (student: Student) => void;
  nextRollNo: number;
}

const GRADES = ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'P', 'F', 'FE'];

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onStudentAdded,
  nextRollNo
}) => {
  const [rollNo, setRollNo] = useState<number>(nextRollNo);
  const [name, setName] = useState<string>('');
  const [registerNo, setRegisterNo] = useState<string>('');
  const [internalMark, setInternalMark] = useState<string>('35');
  const [grade, setGrade] = useState<string>('B');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Live preview
  const [preview, setPreview] = useState<{
    universityMark: number;
    co: number;
    ce: number;
  }>({
    universityMark: 74,
    co: 72.67,
    ce: 116.67
  });

  useEffect(() => {
    setRollNo(nextRollNo);
  }, [nextRollNo]);

  useEffect(() => {
    const im = parseFloat(internalMark) || 0;
    api.previewCalculation(im, grade)
      .then(res => {
        setPreview({
          universityMark: res.universityMark,
          co: res.co1,
          ce: res.continuousEvaluation
        });
      })
      .catch(() => {});
  }, [internalMark, grade]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the student name');
      return;
    }
    if (!registerNo.trim()) {
      setError('Please enter the register number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await api.createStudent({
        rollNo: Number(rollNo),
        name: name.trim(),
        registerNo: registerNo.trim().toUpperCase(),
        internalMark: Number(internalMark) || 0,
        grade
      });
      onStudentAdded(created);
      onClose();
      // Reset
      setName('');
      setRegisterNo('');
      setInternalMark('35');
      setGrade('B');
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-white">Add New Student Record</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Roll Number
              </label>
              <input
                type="number"
                value={rollNo}
                onChange={e => setRollNo(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Register Number
              </label>
              <input
                type="text"
                placeholder="e.g. CEC19CS059"
                value={registerNo}
                onChange={e => setRegisterNo(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Student Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Internal Mark (Max 50)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={internalMark}
                onChange={e => setInternalMark(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                University Grade
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500"
              >
                {GRADES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Automatic Calculation Preview */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Automatic Real-Time Calculation Preview</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">University Mark</span>
                <span className="text-base font-extrabold text-cyan-400">{preview.universityMark}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">CO1–CO5</span>
                <span className="text-base font-extrabold text-indigo-400">{preview.co.toFixed(2)}%</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Continuous Eval</span>
                <span className="text-base font-extrabold text-amber-400">{preview.ce.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Calculating & Saving...' : 'Add Student & Calculate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
