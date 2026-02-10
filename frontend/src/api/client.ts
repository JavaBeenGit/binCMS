import axios from 'axios';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { useAuthStore } from '../stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // 현재 경로에 따라 관리자/사용자 토큰 선택
    const isAdminPage = window.location.pathname.startsWith('/admin');
    const token = isAdminPage
      ? useAdminAuthStore.getState().token
      : useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isAdminPage = window.location.pathname.startsWith('/admin');
      if (isAdminPage) {
        useAdminAuthStore.getState().clearAuth();
        window.location.href = '/admin/login';
      } else {
        useAuthStore.getState().clearAuth();
        window.location.href = '/user/login';
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
