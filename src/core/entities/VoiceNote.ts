export interface VoiceNote {
  id: string;
  patientId: string;
  mealLogId: string;
  audioData: string; // base64 o URL (simulado)
  duration?: number; // segundos
  createdAt: string;
}