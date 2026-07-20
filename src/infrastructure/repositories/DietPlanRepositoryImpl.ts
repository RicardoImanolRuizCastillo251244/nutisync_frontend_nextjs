import type { DietDay } from '../../core/entities/DietDay';
import type { DietPlan } from '../../core/entities/DietPlan';
import type { Meal } from '../../core/entities/Meal';
import type { MealFoodItem } from '../../core/entities/MealFoodItem';
import type { PatientPlanAssignment } from '../../core/entities/PatientPlanAssignment';
import type { DietPlanRepository } from '../../core/ports/DietPlanRepository';
import axiosClient from '../api/axiosClient';

type ApiMealItem = {
  id: string;
  name: string;
  portion?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
};

type ApiMeal = {
  id: string;
  name: string;
  note?: string | null;
  items?: ApiMealItem[];
};

type ApiDay = {
  dayNumber: number;
  meals?: ApiMeal[];
};

type ApiPlan = {
  id: string;
  nutritionistUserId: string;
  name: string;
  deletedAt?: string | null;
  createdAt: string;
  days?: ApiDay[];
};

type ApiAssignment = {
  id: string;
  planId: string;
  patientId: string;
  nutritionistUserId: string;
  assignedAt: string;
  active: boolean;
  endedAt?: string | null;
};

const toMealFoodItem = (raw: ApiMealItem): MealFoodItem => ({
  foodId: String(raw.id ?? ''),
  foodName: String(raw.name ?? ''),
  quantity: 1,
  unit: 'g',
  portion: String(raw.portion ?? '1 porcion'),
  calories: Number(raw.calories ?? 0),
  protein: Number(raw.protein ?? 0),
  carbs: Number(raw.carbs ?? 0),
  fat: Number(raw.fat ?? 0),
});

const toMeal = (raw: ApiMeal): Meal => ({
  id: String(raw.id ?? ''),
  name: String(raw.name ?? ''),
  note: raw.note ? String(raw.note) : '',
  items: Array.isArray(raw.items) ? raw.items.map(toMealFoodItem) : [],
});

const toDay = (raw: ApiDay): DietDay => ({
  dayNumber: Number(raw.dayNumber ?? 1),
  meals: Array.isArray(raw.meals) ? raw.meals.map(toMeal) : [],
});

const toPlan = (raw: ApiPlan): DietPlan => ({
  id: String(raw.id ?? ''),
  name: String(raw.name ?? ''),
  nutritionistId: String(raw.nutritionistUserId ?? ''),
  createdAt: String(raw.createdAt ?? ''),
  deletedAt: raw.deletedAt ? String(raw.deletedAt) : null,
  days: Array.isArray(raw.days) ? raw.days.map(toDay) : [],
});

const toAssignment = (raw: ApiAssignment): PatientPlanAssignment => ({
  id: String(raw.id ?? ''),
  planId: String(raw.planId ?? ''),
  patientId: String(raw.patientId ?? ''),
  nutritionistId: String(raw.nutritionistUserId ?? ''),
  assignedAt: String(raw.assignedAt ?? ''),
  active: Boolean(raw.active),
  endedAt: raw.endedAt ? String(raw.endedAt) : null,
});

const toApiCreateOrUpdatePayload = (plan: Partial<DietPlan>) => ({
  ...(plan.name ? { name: plan.name } : {}),
  ...(plan.days
    ? {
        days: plan.days.map((day) => ({
          dayNumber: day.dayNumber,
          meals: day.meals.map((meal) => ({
            ...(meal.id ? { id: meal.id } : {}),
            name: meal.name,
            note: meal.note ?? '',
            items: meal.items.map((item) => ({
              name: item.foodName,
              portion: item.portion,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
              imageUrl: item.imageUrl ?? null,
              type: item.type ?? null,
              ingredients: item.ingredients ?? null,
            })),
          })),
        })),
      }
    : {}),
});

export const dietPlanRepository: DietPlanRepository = {
  async getAllByNutritionist(nutritionistId) {
    void nutritionistId;
    const { data } = await axiosClient.get('/v1/meal-plans');
    const rawPlans = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return rawPlans.map((raw: ApiPlan) => toPlan(raw)).filter((plan: DietPlan) => !plan.deletedAt);
  },

  async getById(id, nutritionistId) {
    void nutritionistId;
    try {
      const { data } = await axiosClient.get(`/v1/meal-plans/${id}`);
      const raw = (data?.data ?? data) as ApiPlan;
      return toPlan(raw);
    } catch {
      return null;
    }
  },

  async create(plan, nutritionistId) {
    void nutritionistId;
    const payload = toApiCreateOrUpdatePayload(plan);
    const { data } = await axiosClient.post('/v1/meal-plans', payload);
    const raw = (data?.data ?? data) as ApiPlan;
    return toPlan(raw);
  },

  async update(id, updates, nutritionistId) {
    void nutritionistId;
    const payload = toApiCreateOrUpdatePayload(updates);
    const { data } = await axiosClient.patch(`/v1/meal-plans/${id}`, payload);
    const raw = (data?.data ?? data) as ApiPlan;
    return toPlan(raw);
  },

  async delete(id, nutritionistId) {
    void nutritionistId;
    await axiosClient.delete(`/v1/meal-plans/${id}`);
  },

  async assignToPatient(planId, patientId, nutritionistId) {
    void nutritionistId;
    const { data } = await axiosClient.post(`/v1/meal-plans/${planId}/assign`, { patientId });
    const raw = (data?.data ?? data) as ApiAssignment;
    return toAssignment(raw);
  },

  async unassignPlan(planId, patientId, nutritionistId) {
    void nutritionistId;
    await axiosClient.post(`/v1/meal-plans/${planId}/unassign`, { patientId });
  },

  async getAssignmentsByPatient(patientId, nutritionistId) {
    void nutritionistId;
    const { data } = await axiosClient.get(`/v1/meal-plans/patients/${patientId}/assignments`);
    const rawAssignments = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return rawAssignments.map((raw: ApiAssignment) => toAssignment(raw));
  },

  async getActiveAssignmentsByPlan(planId, nutritionistId) {
    void nutritionistId;
    const { data } = await axiosClient.get(`/v1/meal-plans/${planId}/assignments/active`);
    const rawAssignments = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return rawAssignments.map((raw: ApiAssignment) => toAssignment(raw));
  },

  async getActivePlanByPatient(patientId, nutritionistId) {
    const assignments = await this.getAssignmentsByPatient(patientId, nutritionistId);
    const activeAssignment = assignments.find((assignment) => assignment.active);
    if (!activeAssignment) return null;
    return this.getById(activeAssignment.planId, nutritionistId);
  },
};