import type { ClinicalRecord } from '../entities/ClinicalRecord';

export interface ClinicalRecordRepository {
  getByPatientId(patientId: string): Promise<ClinicalRecord[]>;
  getById(id: string): Promise<ClinicalRecord | null>;
  create(
    record: Omit<ClinicalRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ClinicalRecord>;
  update(
    id: string,
    updates: Partial<Omit<ClinicalRecord, 'id' | 'createdAt'>>
  ): Promise<ClinicalRecord>;
  delete(id: string): Promise<void>;
}