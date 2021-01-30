import { refreshAuth, tryRefresh } from './auth/authHandler';

import axios from 'axios';
import { signInFailed } from './auth/authSlice';
import { store } from './store';

const apiUrl = process.env.REACT_APP_STAGE === 'prod' ? 'https://api.photos.runny.cloud' : 'http://localhost:8080';

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
