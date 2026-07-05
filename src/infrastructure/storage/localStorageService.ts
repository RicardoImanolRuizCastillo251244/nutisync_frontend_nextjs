import { STORAGE_KEYS } from './storageKeys';

const ALLOWED_LOCALSTORAGE_KEYS = new Set([STORAGE_KEYS.accessToken]);
const inMemoryStorage = new Map<string, string>();

export const loadFromLocalStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  if (!ALLOWED_LOCALSTORAGE_KEYS.has(key)) {
    localStorage.removeItem(key);
    const memoryValue = inMemoryStorage.get(key);
    if (!memoryValue) return fallback;
    try {
      return JSON.parse(memoryValue) as T;
    } catch {
      return fallback;
    }
  }
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
};

export const saveToLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  if (!ALLOWED_LOCALSTORAGE_KEYS.has(key)) {
    inMemoryStorage.set(key, JSON.stringify(value));
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeFromLocalStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  inMemoryStorage.delete(key);
  localStorage.removeItem(key);
};