import axios from 'axios';
import { authApi } from './authApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor to attach access token
axiosClient.interceptors.request.use((config) => {
  const token = authApi.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to refresh token on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = authApi.getRefreshToken();
      if (refreshToken) {
        try {
          const { accessToken } = await authApi.refreshToken(refreshToken);
          authApi.setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosClient(originalRequest);
        } catch {
          // Refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;