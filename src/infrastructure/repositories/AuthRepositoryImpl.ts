import type { User } from '../../core/entities/User';
import type { AuthRepository } from '../../core/ports/AuthRepository';
import { loadFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from '../storage/localStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'nutriologo@nutrisync.com',
    name: 'Nutriólogo Demo',
    role: 'nutritionist',
    createdAt: new Date().toISOString(),
  },
];

export const authRepository: AuthRepository = {
  async login(email, password) {
    const user = mockUsers.find((u) => u.email === email);
    if (!user || password !== '1234567A') {
      throw new Error('Credenciales inválidas');
    }
    const accessToken = `fake-access-${user.id}-${Date.now()}`;
    const refreshToken = `fake-refresh-${user.id}-${Date.now()}`;
    saveToLocalStorage(STORAGE_KEYS.accessToken, accessToken);
    saveToLocalStorage(STORAGE_KEYS.refreshToken, refreshToken);
    saveToLocalStorage(STORAGE_KEYS.user, user);
    return { user, accessToken, refreshToken };
  },

  async logout() {
    removeFromLocalStorage(STORAGE_KEYS.accessToken);
    removeFromLocalStorage(STORAGE_KEYS.refreshToken);
    removeFromLocalStorage(STORAGE_KEYS.user);
  },

  async refreshToken(refreshToken) {
    const stored = loadFromLocalStorage<string>(STORAGE_KEYS.refreshToken, '');
    if (stored !== refreshToken) throw new Error('Refresh token inválido');
    const user = this.getCurrentUser();
    if (!user) throw new Error('Usuario no encontrado');
    const newAccessToken = `fake-access-${user.id}-${Date.now()}`;
    saveToLocalStorage(STORAGE_KEYS.accessToken, newAccessToken);
    return { accessToken: newAccessToken };
  },

  getCurrentUser(): User | null {
    return loadFromLocalStorage<User | null>(STORAGE_KEYS.user, null);
  },

  getAccessToken(): string | null {
    return loadFromLocalStorage<string | null>(STORAGE_KEYS.accessToken, null);
  },
};