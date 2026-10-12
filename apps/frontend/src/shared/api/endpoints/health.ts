import apiClient from '@/shared/api/client';

export interface HealthResponse {
  success: boolean;
  data: {
    status: string;
    timestamp: string;
    message: string;
  };
}

export const healthApi = {
  check: () => apiClient.get<any, HealthResponse>('/health'),
};
