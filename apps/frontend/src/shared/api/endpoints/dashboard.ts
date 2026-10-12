import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';

/** 관리자 대시보드 요약 숫자 (GET /api/v1/admin/dashboard/summary) */
export interface DashboardSummary {
  members: number;
  posts: number;
  interiors: number;
  pendingInquiries: number;
}

export const adminDashboardApi = {
  summary: async () => {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>('/admin/dashboard/summary');
    return response.data;
  },
};
