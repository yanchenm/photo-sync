import { signInFailed, signInSuccessful } from './auth/authSlice';

import axios from 'axios';
import { refreshAuth } from './auth/authHandler';
import { store } from './store';

const apiUrl = process.env.NODE_ENV === 'production' ? 'https://api.photos.runny.cloud' : 'http://localhost:8080';

axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 5000,
});

export const apiWithAuth = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
});

apiWithAuth.interceptors.request.use(
  (config) => {
    if (config.data == null || !config.data._retry) {
      const state = store.getState();
      const accessToken = state.auth.accessToken;

      config.headers = {
        Authorization: `Bearer ${accessToken}`,
      };
    }
    return config;
  },
  (err) => {
    Promise.reject(err);
  },
);

apiWithAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (err) => {
    const originalRequest = err.config;

    // If not authorized error and we haven't tried refreshing yet
    if (err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const response = await refreshAuth();
      if (response == null) {
        store.dispatch(signInFailed());
        return Promise.reject(err);
      }

      const accessToken = response.token;
      const user = response.user;

      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

      store.dispatch(signInSuccessful({ user, accessToken }));
      return apiWithAuth(originalRequest);
    }

    // Otherwise, error
    store.dispatch(signInFailed());
    return Promise.reject(err);
  },
);
