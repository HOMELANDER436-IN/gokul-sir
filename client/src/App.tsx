import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import type { NavTab } from './components/Navbar';
import { ExcelSheetView } from './components/ExcelSheetView';
import { QuickGradeEntry } from './components/QuickGradeEntry';
import { DashboardView } from './components/DashboardView';
import { CoAnalysisView } from './components/CoAnalysisView';
import { AssessmentToolsView } from './components/AssessmentToolsView';
import { MappingView } from './components/MappingView';
import { OverallCoView } from './components/OverallCoView';
import { SettingsView } from './components/SettingsView';
import type { Student, ClassAnalysis } from './types';
import { api } from './api/client';
import { Loader2 } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('excel');
  const [students, setStudents] = useState<Student[]>([]);
  const [analysis, setAnalysis] = useState<ClassAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [studentsData, analysisData] = await Promise.all([
        api.getStudents(),
        api.getAnalysis()
      ]);
      setStudents(studentsData);
      setAnalysis(analysisData);
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time update handlers
  const handleStudentUpdated = async (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    // Refresh analysis to keep class attainment perfectly synced
    try {
      const newAnalysis = await api.getAnalysis();
      setAnalysis(newAnalysis);
    } catch (e) {}
  };

  const handleStudentAdded = async (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent].sort((a, b) => a.rollNo - b.rollNo));
    try {
      const newAnalysis = await api.getAnalysis();
      setAnalysis(newAnalysis);
    } catch (e) {}
  };

  const handleStudentDeleted = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    try {
      const newAnalysis = await api.getAnalysis();
      setAnalysis(newAnalysis);
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold font-heading">Initializing CO Attainment System...</h2>
          <p className="text-xs text-slate-400">Loading student records and calculation engine</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 max-w-md">
          <h3 className="font-bold text-base mb-1">Connection Error</h3>
          <p className="text-xs text-slate-300">{error}</p>
        </div>
        <button 
          onClick={loadData}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onDataRefresh={loadData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'excel' && (
          <ExcelSheetView
            students={students}
            analysis={analysis}
            onStudentUpdated={handleStudentUpdated}
            onStudentAdded={handleStudentAdded}
            onStudentDeleted={handleStudentDeleted}
          />
        )}

        {currentTab === 'quick' && (
          <QuickGradeEntry
            students={students}
            onStudentUpdated={handleStudentUpdated}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            analysis={analysis}
            students={students}
          />
        )}

        {currentTab === 'co-analysis' && (
          <CoAnalysisView
            analysis={analysis}
          />
        )}

        {currentTab === 'assessment' && (
          <AssessmentToolsView />
        )}

        {currentTab === 'mapping' && (
          <MappingView />
        )}

        {currentTab === 'overall' && (
          <OverallCoView />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            onSettingsSaved={loadData}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>CO Attainment Management System • Automatic Real-Time Academic Calculation Engine</p>
      </footer>
    </div>
  );
}

export default App;
