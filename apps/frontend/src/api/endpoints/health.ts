import apiClient from '../client';

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
