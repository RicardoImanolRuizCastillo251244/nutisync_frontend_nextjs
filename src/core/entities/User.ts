export interface User {
  id: string;
  email: string;
  name: string;
  role: 'nutritionist' | 'patient';
  nutritionistId?: string;
  patientProfileId?: string;
  createdAt: string;
}
