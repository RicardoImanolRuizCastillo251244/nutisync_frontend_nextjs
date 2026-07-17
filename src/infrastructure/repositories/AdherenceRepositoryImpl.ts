import type { AdherenceRecord } from '../../core/entities/AdherenceRecord';
import type { AdherenceRepository } from '../../core/ports/AdherenceRepository';
import axiosClient from '../api/axiosClient';

type ApiAdherenceSummary = {
  meals?: unknown[];
  hydration?: unknown[];
  mood?: unknown[];
};

export const adherenceRepository: AdherenceRepository = {
  async getByPatient(patientId) {
    // Obtener summary + meals + hydration + mood del backend
    const [summaryRes, mealsRes, hydrationRes, moodRes] = await Promise.all([
      axiosClient.get(`/v1/adherence/summary/${patientId}?days=30`),
      axiosClient.get(`/v1/adherence/meals?patientId=${patientId}`),
      axiosClient.get(`/v1/adherence/hydration?patientId=${patientId}`),
      axiosClient.get(`/v1/adherence/mood?patientId=${patientId}`),
    ]);

    const meals = (Array.isArray(mealsRes.data?.data) ? mealsRes.data.data : Array.isArray(mealsRes.data) ? mealsRes.data : []) as Array<{ date?: string; consumed?: boolean }>;
    const hydrations = (Array.isArray(hydrationRes.data?.data) ? hydrationRes.data.data : Array.isArray(hydrationRes.data) ? hydrationRes.data : []) as Array<{ date?: string; loggedAt?: string; amountMl?: number }>;
    const moods = (Array.isArray(moodRes.data?.data) ? moodRes.data.data : Array.isArray(moodRes.data) ? moodRes.data : []) as Array<{ date?: string; loggedAt?: string; mood?: string; note?: string | null }>;

    const records: AdherenceRecord[] = [];
    const byDate = new Map<string, { consumed: number; total: number; water: number; mood: number; moodCount: number }>();

    meals.forEach((meal) => {
      const d = meal.date ?? '';
      if (!d) return;
      const entry = byDate.get(d) ?? { consumed: 0, total: 0, water: 0, mood: 0, moodCount: 0 };
      entry.total += 1;
      if (meal.consumed) entry.consumed += 1;
      byDate.set(d, entry);
    });

    hydrations.forEach((h) => {
      const d = h.date ?? (h.loggedAt ? h.loggedAt.slice(0, 10) : '');
      if (!d) return;
      const entry = byDate.get(d) ?? { consumed: 0, total: 0, water: 0, mood: 0, moodCount: 0 };
      entry.water += h.amountMl ?? 0;
      byDate.set(d, entry);
    });

    const moodMap: Record<string, number> = { excellent: 4, good: 3, neutral: 2, bad: 1 };
    const moodNotes: Map<string, string> = new Map();
    moods.forEach((m) => {
      const d = m.date ?? (m.loggedAt ? m.loggedAt.slice(0, 10) : '');
      if (!d) return;
      const entry = byDate.get(d) ?? { consumed: 0, total: 0, water: 0, mood: 0, moodCount: 0 };
      const moodValue = moodMap[m.mood ?? ''] ?? 0;
      if (moodValue > 0) {
        entry.mood += moodValue;
        entry.moodCount += 1;
      }
      if (m.note && !moodNotes.has(d)) {
        moodNotes.set(d, m.note);
      }
      byDate.set(d, entry);
    });

    byDate.forEach((value, date) => {
      records.push({
        id: `adherence-${date}`,
        patientId,
        date,
        mealCompliance: value.consumed,
        waterIntake: value.water,
        mood: value.moodCount > 0 ? value.mood / value.moodCount : 3,
        moodNote: moodNotes.get(date) ?? null,
        medicationsTaken: false,
      });
    });

    return records;
  },

  async getByPatientAndDate(patientId, date) {
    const records = await this.getByPatient(patientId);
    return records.find((r) => r.date === date) ?? null;
  },

  async create(record) {
    const { data } = await axiosClient.post('/v1/adherence/hydration', {
      patientId: record.patientId,
      amountMl: record.waterIntake * 250,
    });
    return {
      id: (data?.data ?? data)?.id ?? crypto.randomUUID(),
      ...record,
    };
  },

  async update(id, updates) {
    if (updates.waterIntake !== undefined) {
      await axiosClient.post('/v1/adherence/hydration', {
        amountMl: updates.waterIntake * 250,
      });
    }
    if (updates.mood !== undefined) {
      await axiosClient.post('/v1/adherence/mood', {
        mood: updates.mood,
      });
    }
    return {
      id,
      patientId: updates.patientId ?? '',
      date: '',
      mealCompliance: updates.mealCompliance ?? 0,
      waterIntake: updates.waterIntake ?? 0,
      mood: updates.mood ?? 3,
      medicationsTaken: updates.medicationsTaken ?? false,
    };
  },
};