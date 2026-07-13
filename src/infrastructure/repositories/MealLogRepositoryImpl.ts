import type { MealLog } from '../../core/entities/MealLog';
import type { MealLogRepository } from '../../core/ports/MealLogRepository';
import axiosClient from '../api/axiosClient';

type ApiMealLog = {
  id: string;
  patientUserId: string;
  planId?: string | null;
  mealName: string;
  date: string;
  consumed: boolean;
  consumedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const mapLog = (raw: ApiMealLog): MealLog => ({
  id: raw.id,
  patientId: raw.patientUserId,
  planId: raw.planId ?? '',
  mealName: raw.mealName,
  date: raw.date,
  consumed: raw.consumed,
  consumedAt: raw.consumedAt ?? null,
  voiceNoteId: null,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

export const mealLogRepository: MealLogRepository = {
  async getByPatient(patientId) {
    const { data } = await axiosClient.get(`/v1/adherence/meals?patientId=${patientId}`);
    const rawLogs: ApiMealLog[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return rawLogs.map(mapLog);
  },

  async getByPatientAndDate(patientId, date) {
    const { data } = await axiosClient.get(`/v1/adherence/meals?patientId=${patientId}&date=${date}`);
    const rawLogs: ApiMealLog[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return rawLogs.map(mapLog);
  },

  async getByPatientAndPlan(patientId, planId) {
    const { data } = await axiosClient.get(`/v1/adherence/meals?patientId=${patientId}&planId=${planId}`);
    const rawLogs: ApiMealLog[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return rawLogs.map(mapLog);
  },

  async create(log) {
    const { data } = await axiosClient.post('/v1/adherence/meals', {
      patientId: log.patientId,
      planId: log.planId,
      mealName: log.mealName,
      date: log.date,
      consumed: log.consumed,
      consumedAt: log.consumedAt,
    });
    const raw = data?.data ?? data;
    return mapLog(raw);
  },

  async update(id, updates) {
    const { data } = await axiosClient.patch(`/v1/adherence/meals/${id}`, updates);
    const raw = data?.data ?? data;
    return mapLog(raw);
  },

  async delete(id) {
    await axiosClient.delete(`/v1/adherence/meals/${id}`);
  },
};