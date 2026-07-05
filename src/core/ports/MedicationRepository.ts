import type { Medication } from '../entities/Medication';

export interface MedicationRepository {
  getAllByNutritionist(nutritionistId: string): Promise<Medication[]>;
  getAllByPatient(patientId: string, nutritionistId: string): Promise<Medication[]>;
  create(
    medication: Omit<Medication, 'id' | 'createdAt' | 'nutritionistId'>,
    nutritionistId: string
  ): Promise<Medication>;
  update(
    id: string,
    updates: Partial<Medication>,
    nutritionistId: string
  ): Promise<Medication>;
  delete(id: string, nutritionistId: string): Promise<void>;
  // Opcional: método para archivar (cambiar active a false)
  archive(id: string, nutritionistId: string): Promise<Medication>;
}