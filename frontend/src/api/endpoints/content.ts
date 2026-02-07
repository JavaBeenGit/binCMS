import { apiClient } from '../client';
import type { ApiResponse } from '../types';

// ── Types ──

export interface ContentResponse {
  id: number;
  contentKey: string;
  title: string;
  content: string;
  category: string;
  description: string;
  viewCount: number;
  useYn: string;
  sortOrder: number;
  regDt: string;
  modDt: string;
  regNo: string;
  modNo: string;
}

export interface ContentCreateRequest {
  contentKey: string;
  title: string;
  content?: string;
  category?: string;
  description?: string;
  sortOrder?: number;
}

export interface ContentUpdateRequest {
  title: string;
  content?: string;
  category?: string;
  description?: string;
  sortOrder?: number;
}

export interface ContentPageResponse {
  content: ContentResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ── Public API (인증 불필요) ──

export const publicContentApi = {
  /** 컨텐츠 키로 단건 조회 */
  getByKey: (contentKey: string) =>
    apiClient.get<ApiResponse<ContentResponse>>(`/contents/key/${contentKey}`),

  /** 활성 컨텐츠 목록 조회 */
  getActiveList: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<ContentPageResponse>>('/contents', {
      params: { page, size },
    }),
};

// ── Admin API ──

export const contentApi = {
  /** 컨텐츠 목록 조회 (관리자) */
  getAll: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<ContentPageResponse>>('/admin/contents', {
      params: { page, size },
    }),

  /** 컨텐츠 검색 */
  search: (keyword: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<ContentPageResponse>>('/admin/contents/search', {
      params: { keyword, page, size },
    }),

  /** 컨텐츠 단건 조회 */
  getById: (id: number) =>
    apiClient.get<ApiResponse<ContentResponse>>(`/admin/contents/${id}`),

  /** 컨텐츠 생성 */
  create: (data: ContentCreateRequest) =>
    apiClient.post<ApiResponse<ContentResponse>>('/admin/contents', data),

  /** 컨텐츠 수정 */
  update: (id: number, data: ContentUpdateRequest) =>
    apiClient.put<ApiResponse<ContentResponse>>(`/admin/contents/${id}`, data),

  /** 컨텐츠 삭제 */
  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/contents/${id}`),

  /** 컨텐츠 활성화 */
  activate: (id: number) =>
    apiClient.patch<ApiResponse<ContentResponse>>(`/admin/contents/${id}/activate`),

  /** 컨텐츠 비활성화 */
  deactivate: (id: number) =>
    apiClient.patch<ApiResponse<ContentResponse>>(`/admin/contents/${id}/deactivate`),
};
