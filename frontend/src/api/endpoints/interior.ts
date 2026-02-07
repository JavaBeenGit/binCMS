import client from '../client';
import { ApiResponse, PageResponse } from '../types';

export type InteriorCategory = 'ONSITE' | 'SELF_TIP' | 'STORY';

export interface InteriorCreateRequest {
  category: InteriorCategory;
  title: string;
  content: string;
  thumbnailUrl?: string;
  sortOrder?: number;
}

export interface InteriorUpdateRequest {
  title: string;
  content: string;
  thumbnailUrl?: string;
  sortOrder?: number;
}

export interface InteriorResponse {
  id: number;
  category: InteriorCategory;
  categoryName: string;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  viewCount: number;
  sortOrder: number;
  useYn: string;
  regDt: string;
  modDt: string;
  regNo: string;
}

export const interiorApi = {
  create: async (data: InteriorCreateRequest): Promise<ApiResponse<InteriorResponse>> => {
    const response = await client.post('/admin/interiors', data);
    return response.data;
  },

  getAll: async (page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<InteriorResponse>>> => {
    const response = await client.get('/admin/interiors', {
      params: { page, size },
    });
    return response.data;
  },

  getByCategory: async (
    category: InteriorCategory,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PageResponse<InteriorResponse>>> => {
    const response = await client.get(`/admin/interiors/category/${category}`, {
      params: { page, size },
    });
    return response.data;
  },

  search: async (
    keyword: string,
    category?: InteriorCategory,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PageResponse<InteriorResponse>>> => {
    const response = await client.get('/admin/interiors/search', {
      params: { keyword, category, page, size },
    });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<InteriorResponse>> => {
    const response = await client.get(`/admin/interiors/${id}`);
    return response.data;
  },

  update: async (id: number, data: InteriorUpdateRequest): Promise<ApiResponse<InteriorResponse>> => {
    const response = await client.put(`/admin/interiors/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.delete(`/admin/interiors/${id}`);
    return response.data;
  },
};
