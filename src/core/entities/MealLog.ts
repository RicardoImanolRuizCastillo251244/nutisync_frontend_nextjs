export interface MealLog {
  id: string;
  patientId: string;
  planId: string; // referencia al plan activo en ese momento
  mealName: string; // 'Desayuno', 'Comida', etc.
  date: string; // YYYY-MM-DD
  consumed: boolean;
  consumedAt?: string; // timestamp
  voiceNoteId?: string; // referencia a VoiceNote (si envió nota)
  createdAt: string;
  updatedAt: string;
}