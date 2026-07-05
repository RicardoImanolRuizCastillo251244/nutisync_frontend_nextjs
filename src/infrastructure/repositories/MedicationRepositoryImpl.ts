import type { Medication } from '../../core/entities/Medication';
import type { MedicationRepository } from '../../core/ports/MedicationRepository';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

const loadMedications = (): Medication[] =>
  loadFromLocalStorage<Medication[]>(STORAGE_KEYS.medications, []);
const saveMedications = (items: Medication[]): void =>
  saveToLocalStorage(STORAGE_KEYS.medications, items);

export const medicationRepository: MedicationRepository = {
  async getAllByNutritionist(nutritionistId) {
    const items = loadMedications();
    return items.filter((i) => i.nutritionistId === nutritionistId);
  },

  async getAllByPatient(patientId, nutritionistId) {
    const items = loadMedications();
    return items.filter(
      (i) => i.patientId === patientId && i.nutritionistId === nutritionistId
    );
  },

  async create(medication, nutritionistId) {
    const items = loadMedications();
    const newMed: Medication = {
      ...medication,
      id: crypto.randomUUID(),
      nutritionistId,
      active: true,
      createdAt: new Date().toISOString(),
    };
    saveMedications([...items, newMed]);
    return newMed;
  },

  async update(id, updates, nutritionistId) {
    const items = loadMedications();
    const index = items.findIndex(
      (i) => i.id === id && i.nutritionistId === nutritionistId
    );
    if (index === -1) throw new Error('Medicamento no encontrado o no autorizado');
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    saveMedications(items);
    return updated;
  },

  async delete(id, nutritionistId) {
    const items = loadMedications();
    saveMedications(items.filter((i) => !(i.id === id && i.nutritionistId === nutritionistId)));
  },

  async archive(id, nutritionistId) {
    const items = loadMedications();
    const index = items.findIndex(
      (i) => i.id === id && i.nutritionistId === nutritionistId
    );
    if (index === -1) throw new Error('Medicamento no encontrado o no autorizado');
    const updated = { ...items[index], active: false, endDate: new Date().toISOString() };
    items[index] = updated;
    saveMedications(items);
    return updated;
  },
};