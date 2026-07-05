import type { MealLog } from '../entities/MealLog';

export interface MealLogRepository {
  getByPatient(patientId: string): Promise<MealLog[]>;
  getByPatientAndDate(patientId: string, date: string): Promise<MealLog[]>;
  getByPatientAndPlan(patientId: string, planId: string): Promise<MealLog[]>;
  create(
    log: Omit<MealLog, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MealLog>;
  update(
    id: string,
    updates: Partial<MealLog>
  ): Promise<MealLog>;
  delete(id: string): Promise<void>;
}