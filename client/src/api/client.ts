import type { Student, ClassAnalysis, MappingData, OverallData, Settings, AuditLog } from '../types';

export const api = {
  // Students
  async getStudents(): Promise<Student[]> {
    const res = await fetch('/api/students');
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getStudent(id: string): Promise<Student> {
    const res = await fetch(`/api/students/${id}`);
    if (!res.ok) throw new Error('Failed to fetch student');
    return res.json();
  },

  async createStudent(payload: { name: string; registerNo: string; rollNo?: number; internalMark: number; grade?: string }): Promise<Student> {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create student');
    }
    return res.json();
  },

  async updateStudent(id: string, payload: Partial<Student> & { grade?: string }): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update student');
    }
    return res.json();
  },

  async updateStudentGrade(id: string, grade: string): Promise<{ student: Student; analysis: ClassAnalysis }> {
    const res = await fetch(`/api/students/${id}/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update student grade');
    }
    return res.json();
  },

  async deleteStudent(id: string): Promise<void> {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete student');
  },

  async previewCalculation(internalMark: number, grade: string): Promise<{
    universityMark: number;
    co1: number;
    co2: number;
    co3: number;
    co4: number;
    co5: number;
    continuousEvaluation: number;
  }> {
    const res = await fetch('/api/students/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalMark, grade })
    });
    if (!res.ok) throw new Error('Preview failed');
    return res.json();
  },

  // Analysis
  async getAnalysis(): Promise<ClassAnalysis> {
    const res = await fetch('/api/analysis');
    if (!res.ok) throw new Error('Failed to fetch analysis');
    return res.json();
  },

  // Assessment Tools
  async getAssessmentTools(): Promise<{
    board: Record<string, number>;
    survey: Record<string, number>;
    final: Record<string, number>;
  }> {
    const res = await fetch('/api/assessment-tools');
    if (!res.ok) throw new Error('Failed to fetch assessment tools');
    return res.json();
  },

  async updateAssessmentTools(tools: { board?: Record<string, number>; survey?: Record<string, number> }): Promise<any> {
    const res = await fetch('/api/assessment-tools', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tools)
    });
    if (!res.ok) throw new Error('Failed to update assessment tools');
    return res.json();
  },

  // Mapping
  async getMapping(): Promise<MappingData> {
    const res = await fetch('/api/mapping');
    if (!res.ok) throw new Error('Failed to fetch mapping');
    return res.json();
  },

  async updateMapping(mapping: Record<string, Record<string, number>>): Promise<MappingData> {
    const res = await fetch('/api/mapping', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapping)
    });
    if (!res.ok) throw new Error('Failed to update mapping');
    return res.json();
  },

  // Overall CO
  async getOverall(): Promise<OverallData> {
    const res = await fetch('/api/overall');
    if (!res.ok) throw new Error('Failed to fetch overall CO data');
    return res.json();
  },

  async updateOverallMapping(mapping: any): Promise<OverallData> {
    const res = await fetch('/api/overall/mapping', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapping)
    });
    if (!res.ok) throw new Error('Failed to update overall mapping');
    return res.json();
  },

  async updateOverallTools(tools: any): Promise<OverallData> {
    const res = await fetch('/api/overall/tools', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tools)
    });
    if (!res.ok) throw new Error('Failed to update overall tools');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<Settings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<Settings>): Promise<{ settings: Settings; analysis: ClassAnalysis }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async resetSettings(): Promise<any> {
    const res = await fetch('/api/settings/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset settings');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Excel Export URL
  getExportUrl(): string {
    return '/api/export/excel';
  },

  // Excel Import
  async importExcel(file: File): Promise<{ success: boolean; message: string; totalStudents: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/import/excel', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to import Excel');
    }
    return res.json();
  }
};
