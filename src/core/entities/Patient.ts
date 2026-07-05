export interface Patient {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string; // ISO date
  gender: 'male' | 'female' | 'other';
  createdAt: string;
  nutritionistId: string; // referencia al nutriólogo que lo atiende
  deletedAt?: string | null; // soft delete
}