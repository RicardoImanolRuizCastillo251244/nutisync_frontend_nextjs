export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null; // ISO date
  gender?: 'male' | 'female' | 'other' | null;
  createdAt: string;
  nutritionistId?: string | null; // referencia al nutriólogo que lo atiende (nutritionistUserId en backend)
  deletedAt?: string | null; // soft delete
  status?: string | null;
}
