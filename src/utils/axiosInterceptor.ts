/**
 * FIX S-02, S-04: Global Axios Interceptor
 * - Detect 401 expired token
 * - Attempt silent refresh via /api/auth/refresh
 * - On refresh failure, force logout and redirect to /login
 * - Never show user a blank page
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/authStore';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

export const setupAxiosInterceptors = () => {
  // Response interceptor to catch 401s
  axios.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // If 401 and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            // Attempt silent refresh
            await axios.post('/api/auth/refresh', {}, { withCredentials: true });
            processQueue(null);
            // Retry original request
            return axios(originalRequest);
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            // Refresh failed — force logout
            const authStore = useAuthStore.getState();
            authStore.logout();
            window.location.href = '/login';
            return Promise.reject(refreshErr);
          }
        } else {
          // Already refreshing — queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => axios(originalRequest))
            .catch(err => Promise.reject(err));
        }
      }

      return Promise.reject(error);
    }
  );

  // Always include credentials with API calls
  axios.defaults.withCredentials = true;
};
