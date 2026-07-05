import type { AdherenceRecord } from '../entities/AdherenceRecord';

export interface AdherenceRepository {
  getByPatient(patientId: string): Promise<AdherenceRecord[]>;
  getByPatientAndDate(patientId: string, date: string): Promise<AdherenceRecord | null>;
  create(record: Omit<AdherenceRecord, 'id'>): Promise<AdherenceRecord>;
  update(id: string, updates: Partial<AdherenceRecord>): Promise<AdherenceRecord>;
}