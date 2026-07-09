import type { Patient } from '../entities/Patient';

export interface CreatePatientInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface PatientRepository {
  getAllByNutritionist(nutritionistId: string): Promise<Patient[]>;
  getPendingRegistrations(): Promise<Patient[]>;
  getById(id: string, nutritionistId: string): Promise<Patient | undefined>;
  create(input: CreatePatientInput): Promise<Patient>;
  update(id: string, updates: Partial<Patient>): Promise<Patient>;
  assignToNutritionist(id: string): Promise<Patient>;
  delete(id: string): Promise<void>;
}
