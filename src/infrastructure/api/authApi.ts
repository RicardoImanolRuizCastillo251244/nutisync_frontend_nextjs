import type { User } from '@/src/core/entities/User';
import { STORAGE_KEYS } from '@/src/infrastructure/storage/storageKeys';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'nutriologo@nutrisync.com',
    name: 'Nutriólogo Demo',
    role: 'nutritionist',
    createdAt: new Date().toISOString(),
  },
];

const getUserFromToken = (token: string): User | null => {
  const match = token.match(/^fake-access-(.+)-\d+$/);
  if (!match) return null;
  const userId = match[1];
  return mockUsers.find((u) => u.id === userId) ?? null;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const user = mockUsers.find((u) => u.email === email);
    if (!user || password !== '1234567A') {
      throw new Error('Credenciales inválidas');
    }
    const accessToken = `fake-access-${user.id}-${Date.now()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
      localStorage.removeItem(STORAGE_KEYS.user);
    }
    return { user, accessToken };
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    if (!token) return null;
    return getUserFromToken(token);
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
  },
};