import client from '../client';
import { ApiResponse, PageResponse } from '../types';

/**
 * 견적문의 관리자 API
 */

export interface InquiryResponse {
  id: number;
  name: string;
  phone: string;
  email: string;
  inquiryType: string;
  budget: string;
  address: string;
  content: string;
  status: string;
  adminMemo: string;
  regDt: string;
  modDt: string;
}

export const inquiryApi = {
  /** 견적문의 목록 조회 */
  getAll: async (
    page: number = 0,
    size: number = 20,
    status?: string
  ): Promise<ApiResponse<PageResponse<InquiryResponse>>> => {
    const params: Record<string, unknown> = { page, size };
    if (status) params.status = status;
    const response = await client.get('/inquiries', { params });
    return response.data;
  },

  /** 견적문의 상세 조회 */
  getById: async (id: number): Promise<ApiResponse<InquiryResponse>> => {
    const response = await client.get(`/inquiries/${id}`);
    return response.data;
  },

  /** 상태 변경 */
  updateStatus: async (
    id: number,
    status: string
  ): Promise<ApiResponse<InquiryResponse>> => {
    const response = await client.patch(`/inquiries/${id}/status`, { status });
    return response.data;
  },

  /** 관리자 메모 수정 */
  updateMemo: async (
    id: number,
    memo: string
  ): Promise<ApiResponse<InquiryResponse>> => {
    const response = await client.patch(`/inquiries/${id}/memo`, { memo });
    return response.data;
  },
};
