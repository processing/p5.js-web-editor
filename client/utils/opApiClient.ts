import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getConfig } from './getConfig';
import { clearStoredToken, getStoredToken, isTokenOverride } from './opAuth';

function createOpClientInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: getConfig('API_URL')
  });

  // Attach the user's OP bearer token from localStorage on every request.
  // When no token is present (guest), the request goes out unauthenticated;
  // OP returns 401 for protected endpoints and serves public data otherwise.
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  // OP uses 401 only for missing/invalid authentication. Authorization failures
  // such as private-resource denials should come back as 403.
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Don't clear the override token on 401 — it's env-provided, not a
      // per-user localStorage token, and clearing it wouldn't re-auth anyway.
      if (
        error?.response?.status === 401 &&
        !isTokenOverride() &&
        getStoredToken()
      ) {
        clearStoredToken();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const opApiClient = createOpClientInstance();
