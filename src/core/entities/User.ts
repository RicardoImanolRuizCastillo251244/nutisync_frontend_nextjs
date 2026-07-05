export interface User {
  id: string;
  email: string;
  name: string;
  role: 'nutritionist' | 'patient';
  nutritionistId?: string; // solo si el usuario es paciente
  createdAt: string;
}