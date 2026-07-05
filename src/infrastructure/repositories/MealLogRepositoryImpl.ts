import type { MealLog } from '../../core/entities/MealLog';
import type { MealLogRepository } from '../../core/ports/MealLogRepository';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

const loadLogs = (): MealLog[] =>
  loadFromLocalStorage<MealLog[]>(STORAGE_KEYS.mealLogs, []);
const saveLogs = (logs: MealLog[]): void =>
  saveToLocalStorage(STORAGE_KEYS.mealLogs, logs);

export const mealLogRepository: MealLogRepository = {
  async getByPatient(patientId) {
    const logs = loadLogs();
    return logs.filter((l) => l.patientId === patientId);
  },

  async getByPatientAndDate(patientId, date) {
    const logs = loadLogs();
    return logs.filter((l) => l.patientId === patientId && l.date === date);
  },

  async getByPatientAndPlan(patientId, planId) {
    const logs = loadLogs();
    return logs.filter((l) => l.patientId === patientId && l.planId === planId);
  },

  async create(log) {
    const logs = loadLogs();
    const now = new Date().toISOString();
    const newLog: MealLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    saveLogs([...logs, newLog]);
    return newLog;
  },

  async update(id, updates) {
    const logs = loadLogs();
    const index = logs.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Registro no encontrado');
    const updated = { ...logs[index], ...updates, updatedAt: new Date().toISOString() };
    logs[index] = updated;
    saveLogs(logs);
    return updated;
  },

  async delete(id) {
    const logs = loadLogs();
    saveLogs(logs.filter((l) => l.id !== id));
  },
};