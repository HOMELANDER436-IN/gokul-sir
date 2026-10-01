export interface StudentAssessment {
  grade: string;
  universityMark: number;
  co1: number;
  co2: number;
  co3: number;
  co4: number;
  co5: number;
  continuousEvaluation: number;
  updatedAt?: string;
}

export interface Student {
  id: string;
  rollNo: number;
  name: string;
  registerNo: string;
  internalMark: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  assessment: StudentAssessment;
}

export interface COSummaryItem {
  attainedCount: number;
  totalStudents: number;
  denominator?: number;
  percentage: number;
  level: number;
  average: number;
}

export interface ClassAnalysis {
  totalStudents: number;
  evaluatedStudents: number;
  pendingStudents: number;
  summary: {
    co1: COSummaryItem;
    co2: COSummaryItem;
    co3: COSummaryItem;
    co4: COSummaryItem;
    co5: COSummaryItem;
    continuousEvaluation: COSummaryItem;
  };
  gradeDistribution: Record<string, number>;
  assessmentTools: {
    board: Record<string, number>;
    survey: Record<string, number>;
    final: Record<string, number>;
  };
  mappingData: {
    originalAttainment: Record<string, number | null>;
    finalAttainment: Record<string, number | null>;
  };
}

export interface MappingData {
  mapping: Record<string, Record<string, number>>;
  originalAttainment: Record<string, number | null>;
  attainedMatrix: Record<string, Record<string, number>>;
  finalAttainment: Record<string, number | null>;
  assessmentTools: {
    board: Record<string, number>;
    survey: Record<string, number>;
    final: Record<string, number>;
  };
}

export interface OverallData {
  tools: {
    board: Record<string, number>;
    survey: Record<string, number>;
    final: Record<string, number>;
  };
  mapping: Record<string, { targetCO: number; [key: string]: number }>;
  originalAttainment: Record<string, number | null>;
  attainedMatrix: Record<string, Record<string, number>>;
  finalAttainment: Record<string, number | null>;
}

export interface AuditLog {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  registerNo: string;
  oldGrade: string;
  newGrade: string;
  oldUniversityMark: number;
  newUniversityMark: number;
  timestamp: string;
}

export interface Settings {
  gradeMap: Record<string, number>;
  coThresholds: {
    lower: number;
    upper: number;
    level3: number;
    level2: number;
    level1: number;
  };
  ceThresholds: {
    lower: number;
    upper: number;
    level3: number;
    level2: number;
    level1: number;
    denominator: number;
  };
  internalMax: number;
  universityMax: number;
  totalMax: number;
  ceMax: number;
  assessmentTools: {
    board: Record<string, number>;
    survey: Record<string, number>;
  };
}
