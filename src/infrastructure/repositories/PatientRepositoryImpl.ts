import type { Patient } from '../../core/entities/Patient';
import type { PatientRepository } from '../../core/ports/PatientRepository';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';
import type { PatientPlanAssignment } from '../../core/entities/PatientPlanAssignment';

const MOCK_NUTRITIONIST_ID = '1';

const createMockPatients = (): Patient[] => {
  const firstNames = [
    'Ana', 'Luis', 'Mariana', 'Carlos', 'Sofia', 'Diego', 'Valeria', 'Jorge', 'Camila', 'Ricardo',
    'Lucia', 'Hector', 'Elena', 'Mateo', 'Fernanda', 'Pablo', 'Daniela', 'Roberto', 'Paula', 'Andres',
    'Natalia', 'Ivan', 'Karla', 'Emilio', 'Sara', 'Alberto', 'Gabriela', 'Tomas'
  ];
  const lastNames = [
    'Lopez', 'Garcia', 'Ramirez', 'Torres', 'Sanchez', 'Mendoza', 'Reyes', 'Herrera',
    'Gutierrez', 'Vega', 'Flores', 'Navarro', 'Rios', 'Castillo', 'Ortega', 'Morales'
  ];

  return Array.from({ length: 28 }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];
    const isApproved = index < 16;
    const createdAt = new Date(Date.now() - index * 86_400_000).toISOString();

    return {
      id: `mock-patient-${index + 1}`,
      name: firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@demo.com`,
      phone: `55123${String(index + 1000).slice(-4)}`,
      birthDate: `199${index % 10}-0${(index % 9) + 1}-1${index % 9}`,
      gender: (index % 3 === 0 ? 'female' : index % 3 === 1 ? 'male' : 'other') as Patient['gender'],
      createdAt,
      nutritionistId: isApproved ? MOCK_NUTRITIONIST_ID : '',
      deletedAt: null,
    };
  });
};

const loadPatients = (): Patient[] => {
  const patients = loadFromLocalStorage<Patient[]>(STORAGE_KEYS.patients, []);

  if (patients.length > 0) {
    return patients;
  }

  const mockPatients = createMockPatients();
  saveToLocalStorage(STORAGE_KEYS.patients, mockPatients);
  return mockPatients;
};

const loadAssignments = (): PatientPlanAssignment[] =>
  loadFromLocalStorage<PatientPlanAssignment[]>(STORAGE_KEYS.planAssignments, []);

export const patientRepository: PatientRepository = {
  async getAllByNutritionist(nutritionistId) {
    const patients = loadPatients();
    return patients.filter((p) => p.nutritionistId === nutritionistId && !p.deletedAt);
  },

  async getPendingRegistrations() {
    const patients = loadPatients();
    return patients.filter((p) => !p.nutritionistId && !p.deletedAt);
  },

  async getById(id, nutritionistId) {
    const patients = await this.getAllByNutritionist(nutritionistId);
    return patients.find((p) => p.id === id);
  },

  async create(patient, nutritionistId) {
    const patients = loadPatients();
    const newPatient: Patient = {
      ...patient,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      nutritionistId,
    };
    saveToLocalStorage(STORAGE_KEYS.patients, [...patients, newPatient]);
    return newPatient;
  },

  async update(id, updates, nutritionistId) {
    const patients = loadPatients();
    const index = patients.findIndex(
      (p) => p.id === id && p.nutritionistId === nutritionistId
    );
    if (index === -1) throw new Error('Paciente no encontrado o no autorizado');
    const updated = { ...patients[index], ...updates };
    patients[index] = updated;
    saveToLocalStorage(STORAGE_KEYS.patients, patients);
    return updated;
  },

  async assignToNutritionist(id, nutritionistId) {
    const patients = loadPatients();
    const index = patients.findIndex((p) => p.id === id && !p.deletedAt);
    if (index === -1) throw new Error('Paciente no encontrado');
    const currentPatient = patients[index];
    if (currentPatient.nutritionistId && currentPatient.nutritionistId !== nutritionistId) {
      throw new Error('Paciente ya asignado a otro nutriólogo');
    }
    const assignedPatient: Patient = {
      ...currentPatient,
      nutritionistId,
    };
    patients[index] = assignedPatient;
    saveToLocalStorage(STORAGE_KEYS.patients, patients);
    return assignedPatient;
  },

  async delete(id, nutritionistId) {
    const patients = loadPatients();
    const assignments = loadAssignments();
    const activeAssignments = assignments.filter(
      (a) => a.patientId === id && a.nutritionistId === nutritionistId && a.active
    );
    if (activeAssignments.length > 0) {
      throw new Error('No se puede eliminar paciente con planes activos');
    }
    saveToLocalStorage(
      STORAGE_KEYS.patients,
      patients.filter((p) => !(p.id === id && p.nutritionistId === nutritionistId))
    );
  },
};