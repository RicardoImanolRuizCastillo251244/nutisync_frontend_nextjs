export interface MealLog {
  id: string;
  patientId: string;
  planId: string;
  mealName: string;
  date: string;
  consumed: boolean;
  consumedAt?: string;
  substituteNote?: string;
  voiceNoteUrl?: string;
  voiceNoteDurationSec?: number;
  createdAt: string;
  updatedAt: string;
}
