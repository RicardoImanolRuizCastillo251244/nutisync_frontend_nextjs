import type { DietDay } from './DietDay';

export interface DietPlan {
  id: string;
  name: string;
  nutritionistId: string;
  createdAt: string;
  deletedAt?: string | null; // soft delete
  days: DietDay[];
}