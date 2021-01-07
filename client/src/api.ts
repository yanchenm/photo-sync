import axios, { AxiosRequestConfig } from 'axios';

axios.defaults.withCredentials = true;

export const getAuthorizationHeader = (accessToken: string): AxiosRequestConfig => {
  return {
    headers: { Authorization: `Bearer ${accessToken}` },
  };
};

export default axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
});
