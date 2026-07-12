import type { DietPlan } from '../entities/DietPlan';
import type { PatientPlanAssignment } from '../entities/PatientPlanAssignment';

export interface DietPlanRepository {
  getAllByNutritionist(nutritionistId: string): Promise<DietPlan[]>;
  getById(id: string, nutritionistId: string): Promise<DietPlan | null>;
  create(
    plan: Omit<DietPlan, 'id' | 'createdAt' | 'nutritionistId'>,
    nutritionistId: string
  ): Promise<DietPlan>;
  update(
    id: string,
    updates: Partial<DietPlan>,
    nutritionistId: string
  ): Promise<DietPlan>;
  delete(id: string, nutritionistId: string): Promise<void>;

  // Asignación de planes a pacientes
  assignToPatient(
    planId: string,
    patientId: string,
    nutritionistId: string
  ): Promise<PatientPlanAssignment>;
  unassignPlan(
    planId: string,
    patientId: string,
    nutritionistId: string
  ): Promise<void>;
  getAssignmentsByPatient(
    patientId: string,
    nutritionistId: string
  ): Promise<PatientPlanAssignment[]>;
  getActiveAssignmentsByPlan(
    planId: string,
    nutritionistId: string
  ): Promise<PatientPlanAssignment[]>;
  getActivePlanByPatient(
    patientId: string,
    nutritionistId: string
  ): Promise<DietPlan | null>;
}