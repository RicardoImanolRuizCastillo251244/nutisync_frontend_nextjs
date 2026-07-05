import type { ClinicalRecord } from '../../core/entities/ClinicalRecord';
import type { ClinicalRecordRepository } from '../../core/ports/ClinicalRecordRepository';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

const loadRecords = (): ClinicalRecord[] =>
  loadFromLocalStorage<ClinicalRecord[]>(STORAGE_KEYS.clinicalRecords, []);
const saveRecords = (records: ClinicalRecord[]): void =>
  saveToLocalStorage(STORAGE_KEYS.clinicalRecords, records);

export const clinicalRecordRepository: ClinicalRecordRepository = {
  async getByPatientId(patientId) {
    const records = loadRecords();
    return records.filter((r) => r.patientId === patientId);
  },

  async getById(id) {
    const records = loadRecords();
    return records.find((r) => r.id === id) ?? null;
  },

  async create(record) {
    const records = loadRecords();
    const now = new Date().toISOString();
    const newRecord: ClinicalRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    saveRecords([...records, newRecord]);
    return newRecord;
  },

  async update(id, updates) {
    const records = loadRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Registro no encontrado');
    const updated = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    records[index] = updated;
    saveRecords(records);
    return updated;
  },

  async delete(id) {
    const records = loadRecords();
    saveRecords(records.filter((r) => r.id !== id));
  },
};