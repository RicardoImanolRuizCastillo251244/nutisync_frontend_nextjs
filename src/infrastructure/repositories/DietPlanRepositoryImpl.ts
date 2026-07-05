import type { DietPlan } from '../../core/entities/DietPlan';
import type { DietDay } from '../../core/entities/DietDay';
import type { Meal } from '../../core/entities/Meal';
import type { PatientPlanAssignment } from '../../core/entities/PatientPlanAssignment';
import type { DietPlanRepository } from '../../core/ports/DietPlanRepository';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

const DEFAULT_MEAL_NAMES = ['Desayuno', 'Colacion AM', 'Comida', 'Merienda', 'Cena'] as const;

const createEmptyMeals = (): Meal[] =>
  DEFAULT_MEAL_NAMES.map((name) => ({
    id: crypto.randomUUID(),
    name,
    items: [],
    note: '',
  }));

const cloneMeals = (meals: Meal[]): Meal[] =>
  meals.map((meal) => ({
    ...meal,
    items: meal.items.map((item) => ({ ...item })),
  }));

const createWeeklyDays = (meals?: Meal[]): DietDay[] =>
  Array.from({ length: 7 }, (_, index) => ({
    dayNumber: index + 1,
    meals: meals ? cloneMeals(meals) : createEmptyMeals(),
  }));

const normalizeDays = (days: DietDay[]): DietDay[] =>
  Array.from({ length: 7 }, (_, index) => {
    const dayNumber = index + 1;
    const existing = days.find((day) => day.dayNumber === dayNumber);

    return {
      dayNumber,
      meals: existing ? cloneMeals(existing.meals) : createEmptyMeals(),
    };
  });

const normalizePlan = (plan: DietPlan | (DietPlan & { meals?: Meal[] })): DietPlan => {
  const legacyPlan = plan as DietPlan & { meals?: Meal[] };
  const normalizedDays = Array.isArray(plan.days) && plan.days.length > 0
    ? normalizeDays(plan.days)
    : createWeeklyDays(legacyPlan.meals);

  const rest = { ...legacyPlan };
  delete rest.meals;

  return {
    ...rest,
    days: normalizedDays,
  };
};

const loadPlans = (): DietPlan[] =>
  loadFromLocalStorage<Array<DietPlan & { meals?: Meal[] }>>(STORAGE_KEYS.dietPlans, []).map(
    normalizePlan
  );
const savePlans = (plans: DietPlan[]): void =>
  saveToLocalStorage(STORAGE_KEYS.dietPlans, plans);

const loadAssignments = (): PatientPlanAssignment[] =>
  loadFromLocalStorage<PatientPlanAssignment[]>(STORAGE_KEYS.planAssignments, []);
const saveAssignments = (assignments: PatientPlanAssignment[]): void =>
  saveToLocalStorage(STORAGE_KEYS.planAssignments, assignments);

export const dietPlanRepository: DietPlanRepository = {
  async getAllByNutritionist(nutritionistId) {
    const plans = loadPlans();
    return plans.filter((p) => p.nutritionistId === nutritionistId && !p.deletedAt);
  },

  async getById(id, nutritionistId) {
    const plans = await this.getAllByNutritionist(nutritionistId);
    return plans.find((p) => p.id === id) ?? null;
  },

  async create(plan, nutritionistId) {
    const plans = loadPlans();
    const newPlan: DietPlan = {
      ...plan,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      nutritionistId,
      deletedAt: null,
    };
    savePlans([...plans, newPlan]);
    return newPlan;
  },

  async update(id, updates, nutritionistId) {
    const plans = loadPlans();
    const index = plans.findIndex(
      (p) => p.id === id && p.nutritionistId === nutritionistId && !p.deletedAt
    );
    if (index === -1) throw new Error('Plan no encontrado o no autorizado');
    const updated = { ...plans[index], ...updates };
    plans[index] = updated;
    savePlans(plans);
    return updated;
  },

  async delete(id, nutritionistId) {
    const plans = loadPlans();
    const index = plans.findIndex(
      (p) => p.id === id && p.nutritionistId === nutritionistId && !p.deletedAt
    );
    if (index === -1) throw new Error('Plan no encontrado o no autorizado');
    plans[index] = { ...plans[index], deletedAt: new Date().toISOString() };
    savePlans(plans);
    // Desactivar asignaciones activas
    const assignments = loadAssignments();
    let changed = false;
    for (const a of assignments) {
      if (a.planId === id && a.active) {
        a.active = false;
        a.endedAt = new Date().toISOString();
        changed = true;
      }
    }
    if (changed) saveAssignments(assignments);
  },

  async assignToPatient(planId, patientId, nutritionistId) {
    const plans = loadPlans();
    const planExists = plans.some(
      (p) => p.id === planId && p.nutritionistId === nutritionistId && !p.deletedAt
    );
    if (!planExists) throw new Error('Plan no encontrado o no autorizado');

    const assignments = loadAssignments();
    // Desactivar asignación activa previa para este paciente
    for (const a of assignments) {
      if (a.patientId === patientId && a.nutritionistId === nutritionistId && a.active) {
        a.active = false;
        a.endedAt = new Date().toISOString();
      }
    }
    const newAssignment: PatientPlanAssignment = {
      id: crypto.randomUUID(),
      planId,
      patientId,
      nutritionistId,
      assignedAt: new Date().toISOString(),
      active: true,
      endedAt: null,
    };
    assignments.push(newAssignment);
    saveAssignments(assignments);
    return newAssignment;
  },

  async getAssignmentsByPatient(patientId, nutritionistId) {
    const assignments = loadAssignments();
    return assignments.filter(
      (a) => a.patientId === patientId && a.nutritionistId === nutritionistId
    );
  },

  async getActiveAssignmentsByPlan(planId, nutritionistId) {
    const assignments = loadAssignments();
    return assignments.filter(
      (a) => a.planId === planId && a.nutritionistId === nutritionistId && a.active
    );
  },

  async getActivePlanByPatient(patientId, nutritionistId) {
    const assignments = loadAssignments();
    const active = assignments.find(
      (a) => a.patientId === patientId && a.nutritionistId === nutritionistId && a.active
    );
    if (!active) return null;
    const plan = await this.getById(active.planId, nutritionistId);
    return plan;
  },
};