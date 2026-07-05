export interface Medication {
  id: string;
  patientId: string;
  nutritionistId: string;
  name: string;
  dosage: string;
  frequency: string; // ej. 'Cada 8 horas'
  notes?: string;
  startDate: string;
  endDate?: string | null;
  active: boolean;
  createdAt: string;
}