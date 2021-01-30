import axios from 'axios';
import { refreshAuth } from './auth/authHandler';

axios.defaults.withCredentials = true;

export const setToken = (token: string): void => {
  apiWithAuth.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
});

export const apiWithAuth = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
});

apiWithAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If not authorized error and we haven't tried refreshing yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const response = await refreshAuth();
      if (response == null) {
        return Promise.reject(error);
      }

      setToken(response.token);
      return apiWithAuth(originalRequest);
    }

    return Promise.reject(error);
  },
);
