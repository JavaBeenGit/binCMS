import { apiClient } from '../client';
import type { ApiResponse } from '../types';

// ── Types ──

export interface PopupResponse {
  id: number;
  title: string;
  content: string;
  popupWidth: number;
  popupHeight: number;
  positionX: number;
  positionY: number;
  startDt: string;
  endDt: string;
  sortOrder: number;
  useYn: string;
  regDt: string;
  modDt: string;
  regNo: string;
  modNo: string;
}

export interface PopupCreateRequest {
  title: string;
  content?: string;
  popupWidth?: number;
  popupHeight?: number;
  positionX?: number;
  positionY?: number;
  startDt?: string;
  endDt?: string;
  sortOrder?: number;
}

export interface PopupUpdateRequest {
  title: string;
  content?: string;
  popupWidth?: number;
  popupHeight?: number;
  positionX?: number;
  positionY?: number;
  startDt?: string;
  endDt?: string;
  sortOrder?: number;
}

export interface PopupPageResponse {
  content: PopupResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ── Admin API ──

export const popupApi = {
  getAll: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PopupPageResponse>>('/admin/popups', {
      params: { page, size },
    }),

  search: (keyword: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PopupPageResponse>>('/admin/popups/search', {
      params: { keyword, page, size },
    }),

  getById: (id: number) =>
    apiClient.get<ApiResponse<PopupResponse>>(`/admin/popups/${id}`),

  create: (data: PopupCreateRequest) =>
    apiClient.post<ApiResponse<PopupResponse>>('/admin/popups', data),

  update: (id: number, data: PopupUpdateRequest) =>
    apiClient.put<ApiResponse<PopupResponse>>(`/admin/popups/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/admin/popups/${id}`),

  activate: (id: number) =>
    apiClient.patch<ApiResponse<PopupResponse>>(`/admin/popups/${id}/activate`),

  deactivate: (id: number) =>
    apiClient.patch<ApiResponse<PopupResponse>>(`/admin/popups/${id}/deactivate`),
};
