import type { User } from '../entities/User';

export interface AuthRepository {
  login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;
  getCurrentUser(): User | null;
  getAccessToken(): string | null;
}