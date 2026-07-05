export interface PatientPlanAssignment {
  id: string;
  planId: string;
  patientId: string;
  nutritionistId: string;
  assignedAt: string;
  active: boolean;
  endedAt?: string | null;
}