import type { AdherenceRecord } from '../../core/entities/AdherenceRecord';
import type { AdherenceRepository } from '../../core/ports/AdherenceRepository';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

const loadRecords = (): AdherenceRecord[] =>
  loadFromLocalStorage<AdherenceRecord[]>(STORAGE_KEYS.adherence, []);
const saveRecords = (records: AdherenceRecord[]): void =>
  saveToLocalStorage(STORAGE_KEYS.adherence, records);

export const adherenceRepository: AdherenceRepository = {
  async getByPatient(patientId) {
    const records = loadRecords();
    return records.filter((r) => r.patientId === patientId);
  },

  async getByPatientAndDate(patientId, date) {
    const records = loadRecords();
    return records.find((r) => r.patientId === patientId && r.date === date) ?? null;
  },

  async create(record) {
    const records = loadRecords();
    const newRecord: AdherenceRecord = {
      ...record,
      id: crypto.randomUUID(),
    };
    saveRecords([...records, newRecord]);
    return newRecord;
  },

  async update(id, updates) {
    const records = loadRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Registro no encontrado');
    const updated = { ...records[index], ...updates };
    records[index] = updated;
    saveRecords(records);
    return updated;
  },
};