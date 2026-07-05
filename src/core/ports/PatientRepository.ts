import type { Patient } from '../entities/Patient';

export interface PatientRepository {
  getAllByNutritionist(nutritionistId: string): Promise<Patient[]>;
  getPendingRegistrations(): Promise<Patient[]>;
  getById(id: string, nutritionistId: string): Promise<Patient | undefined>;
  create(
    patient: Omit<Patient, 'id' | 'createdAt' | 'nutritionistId'>,
    nutritionistId: string
  ): Promise<Patient>;
  update(
    id: string,
    updates: Partial<Patient>,
    nutritionistId: string
  ): Promise<Patient>;
  assignToNutritionist(id: string, nutritionistId: string): Promise<Patient>;
  delete(id: string, nutritionistId: string): Promise<void>;
}