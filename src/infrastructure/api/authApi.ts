import type { User } from '@/src/core/entities/User';
import { STORAGE_KEYS } from '@/src/infrastructure/storage/storageKeys';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'nutritionist' | 'patient';
      patientProfileId?: string;
    };
  };
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Credenciales inválidas');
    }

    const { data } = (await res.json()) as LoginResponse;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        patientProfileId: data.user.patientProfileId,
      } as User & { patientProfileId?: string },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  logout: async () => {
    const refreshToken = authApi.getRefreshToken();

    if (refreshToken) {
      try {
        await fetch(`${API_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Silently ignore logout errors
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
    }
  },

  refreshToken: async (refreshToken: string) => {
    const res = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Token refresh failed');
    }

    const { data } = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
    }
    return { accessToken: data.accessToken };
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    if (!token) return null;

    try {
      // Decode JWT payload without verifying signature
      const payload = JSON.parse(atob(token.split('.')[1]!));
      return {
        id: payload.sub,
        email: payload.email || '',
        name: payload.name || '',
        role: payload.role,
        createdAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  },

  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.accessToken, token);
  },
};