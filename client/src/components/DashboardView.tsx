import { 
  Users, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  BarChart2, 
  Layers, 
  Target 
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import type { ClassAnalysis, Student } from '../types';

interface DashboardViewProps {
  analysis: ClassAnalysis | null;
  students: Student[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analysis,
  students
}) => {
  if (!analysis) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse">
        Loading dashboard metrics...
      </div>
    );
  }

  // Prepare chart data for CO Attainment
  const coChartData = (['co1', 'co2', 'co3', 'co4', 'co5'] as const).map((co, idx) => ({
    name: `CO${idx + 1}`,
    percentage: analysis.summary[co].percentage,
    level: analysis.summary[co].level,
    attained: analysis.summary[co].attainedCount,
    total: analysis.summary[co].totalStudents
  }));

  // Prepare chart data for Grade Distribution
  const gradeChartData = Object.entries(analysis.gradeDistribution)
    .filter(([grade]) => grade !== 'Pending')
    .map(([grade, count]) => ({
      grade,
      count
    }));

  // Prepare chart data for PO/PSO Attainment
  const poChartData = Object.entries(analysis.mappingData.finalAttainment).map(([code, val]) => ({
    code,
    attainment: val !== null ? Number(val.toFixed(2)) : 0,
    hasMapping: val !== null
  }));

  const avgCo = Number(
    (
      (['co1', 'co2', 'co3', 'co4', 'co5'] as const).reduce(
        (sum, co) => sum + analysis.summary[co].percentage, 0
      ) / 5
    ).toFixed(1)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{analysis.totalStudents}</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">enrolled in MAT101</span>
          </div>
        </div>

        {/* Evaluated Students */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluated</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-400">{analysis.evaluatedStudents}</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">({Math.round((analysis.evaluatedStudents / (analysis.totalStudents || 1)) * 100)}%)</span>
          </div>
        </div>

        {/* Average CO Attainment */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Average CO</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-cyan-400">{avgCo}%</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">across CO1–CO5</span>
          </div>
        </div>

        {/* Overall Status */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">NBA Level Achieved</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-400">Level 3</span>
            <span className="text-xs text-slate-400 ml-2 font-medium">High Attainment (&gt;75%)</span>
          </div>
        </div>
      </div>

      {/* CO Badges Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <span>Course Outcomes Attainment Status</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(['co1', 'co2', 'co3', 'co4', 'co5'] as const).map((co, idx) => {
            const item = analysis.summary[co];
            return (
              <div key={co} className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 text-center space-y-1">
                <span className="text-xs font-bold text-slate-400 block uppercase">CO{idx + 1}</span>
                <span className="text-2xl font-extrabold text-white block">{item.percentage}%</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block">
                  Level {item.level}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {item.attainedCount} of {item.totalStudents} attained
                </span>
              </div>
            );
          })}

          <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 block uppercase">Continuous Eval</span>
            <span className="text-2xl font-extrabold text-cyan-400 block">
              {analysis.summary.continuousEvaluation.percentage}%
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700 inline-block">
              {analysis.summary.continuousEvaluation.level ? `Level ${analysis.summary.continuousEvaluation.level}` : 'No Attain'}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {analysis.summary.continuousEvaluation.attainedCount} of {analysis.summary.continuousEvaluation.denominator} attained
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: CO Attainment Percentages */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>CO Attainment Profile (%)</span>
            </h4>
            <span className="text-xs text-slate-400">Target Level 3 = 75%</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Attainment']}
                />
                <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Level 3 (75%)', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={65} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Level 2 (65%)', fill: '#f59e0b', fontSize: 10 }} />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {coChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.level === 3 ? '#6366f1' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grade Distribution */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>University Grade Distribution</span>
            </h4>
            <span className="text-xs text-slate-400">{students.length} Total Students</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="grade" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(val: any) => [`${val} students`, 'Count']}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Program Outcomes (PO/PSO) Final Attainment */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Final PO & PSO Attainment Profile</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Calculated from Course Outcomes mapped to NBA/NAAC Graduate Attributes</p>
          </div>
          <span className="text-xs text-slate-400">Scale: 0.0 - 3.0</span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={poChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="code" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 3]} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                formatter={(val: any, _name: any, item: any) => [item.payload.hasMapping ? Number(val).toFixed(2) : 'N/A (No mapping)', 'Attainment']}
              />
              <Bar dataKey="attainment" radius={[6, 6, 0, 0]}>
                {poChartData.map((entry, index) => (
                  <Cell 
                    key={`po-cell-${index}`} 
                    fill={entry.hasMapping ? '#8b5cf6' : '#334155'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
