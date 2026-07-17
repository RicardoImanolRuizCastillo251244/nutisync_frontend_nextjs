export interface AdherenceRecord {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  mealCompliance: number; // número de comidas cumplidas (0-5)
  waterIntake: number; // vasos de agua
  mood: number; // 1-4
  moodNote?: string | null;
  medicationsTaken: boolean;
}
