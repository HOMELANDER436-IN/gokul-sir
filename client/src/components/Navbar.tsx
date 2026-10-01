import React, { useRef } from 'react';
import { 
  FileSpreadsheet, 
  BarChart3, 
  Zap, 
  Target, 
  Sliders, 
  Network, 
  Compass, 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';

export type NavTab = 
  | 'excel' 
  | 'quick' 
  | 'dashboard' 
  | 'co-analysis' 
  | 'assessment' 
  | 'mapping' 
  | 'overall' 
  | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onDataRefresh: () => void;
  isSaving?: boolean;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onDataRefresh,
  isSaving
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    window.location.href = api.getExportUrl();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.importExcel(file);
      alert(res.message);
      onDataRefresh();
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const navItems: NavItem[] = [
    { id: 'excel', label: 'Excel Live Sheet', icon: FileSpreadsheet, badge: 'Interactive' },
    { id: 'quick', label: 'Fast Grade Entry', icon: Zap, badge: 'Auto-Calc' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'co-analysis', label: 'CO Analysis', icon: Target },
    { id: 'assessment', label: 'Assessment Tools', icon: Sliders },
    { id: 'mapping', label: 'PO/PSO Mapping', icon: Network },
    { id: 'overall', label: 'Overall CO (8 COs)', icon: Compass },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg text-white tracking-tight">CO ATTAINMENT</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  MAT101 (2019-20)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Automated Real-Time Calculation Engine</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auto-calculating...</span>
              </div>
            )}

            <button
              onClick={handleExport}
              title="Download Excel Workbook with all calculations (.xlsx)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 hover:text-emerald-300 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleImportClick}
              title="Import or update student records from Excel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    active ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
