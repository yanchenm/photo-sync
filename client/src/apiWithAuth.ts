import { signInFailed, tryRefresh } from './auth/authSlice';

import axios from 'axios';
import { store } from './store';

export const apiWithAuth = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
});

apiWithAuth.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;
    config.headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

apiWithAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If not authorized error and we haven't tried refreshing yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      store.dispatch(tryRefresh());
      return apiWithAuth(originalRequest);
    }

    // Otherwise, error
    store.dispatch(signInFailed());
    return Promise.reject(error);
  },
);
