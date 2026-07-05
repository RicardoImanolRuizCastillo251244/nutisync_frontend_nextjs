import axios from 'axios';
import { authApi } from './authApi';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para añadir token
axiosClient.interceptors.request.use((config) => {
  const token = authApi.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar token en caso de 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Simulación temporal de renovación usando solo token de sesión.
      const currentToken = authApi.getAccessToken();
      if (currentToken) {
        const userId = currentToken.match(/^fake-access-(.+)-\d+$/)?.[1] ?? '1';
        const newAccessToken = `fake-access-${userId}-${Date.now()}`;
        authApi.setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;