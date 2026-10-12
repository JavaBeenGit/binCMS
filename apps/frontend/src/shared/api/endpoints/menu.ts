import client from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';

export enum MenuType {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface MenuCreateRequest {
  menuType: MenuType;
  menuName: string;
  menuUrl?: string;
  parentId?: number;
  depth?: number;
  sortOrder?: number;
  icon?: string;
  description?: string;
}

export interface MenuUpdateRequest {
  menuName: string;
  menuUrl?: string;
  sortOrder?: number;
  icon?: string;
  description?: string;
}

export interface MenuResponse {
  id: number;
  menuType: MenuType;
  menuName: string;
  menuUrl?: string;
  parentId?: number;
  depth: number;
  sortOrder: number;
  icon?: string;
  description?: string;
  useYn: string;
  regDt: string;
  modDt: string;
  regNo?: string;
  children?: MenuResponse[];
}

export const menuApi = {
  createMenu: async (data: MenuCreateRequest): Promise<ApiResponse<MenuResponse>> => {
    const response = await client.post('/admin/menus', data);
    return response.data;
  },

  getMenusByType: async (menuType: MenuType, includeInactive: boolean = false): Promise<ApiResponse<MenuResponse[]>> => {
    const response = await client.get(`/admin/menus/type/${menuType}`, {
      params: { includeInactive }
    });
    return response.data;
  },

  getAllMenus: async (): Promise<ApiResponse<MenuResponse[]>> => {
    const response = await client.get('/admin/menus');
    return response.data;
  },

  getMenuById: async (id: number): Promise<ApiResponse<MenuResponse>> => {
    const response = await client.get(`/admin/menus/${id}`);
    return response.data;
  },

  updateMenu: async (id: number, data: MenuUpdateRequest): Promise<ApiResponse<MenuResponse>> => {
    const response = await client.put(`/admin/menus/${id}`, data);
    return response.data;
  },

  deleteMenu: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.delete(`/admin/menus/${id}`);
    return response.data;
  },

  /** 홈페이지 헤더용 — 켜진 사용자 메뉴 트리 (비로그인 허용) */
  getPublicMenus: async (): Promise<ApiResponse<MenuResponse[]>> => {
    const response = await client.get('/public/menus');
    return response.data;
  },

  /** 끄기 — 홈페이지·사이드메뉴에서 숨긴다 (삭제 대신) */
  deactivateMenu: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/menus/${id}/deactivate`);
    return response.data;
  },

  /** 순서 이동 — 같은 부모 아래 형제와 교환 */
  moveMenu: async (id: number, direction: 'up' | 'down'): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/menus/${id}/move`, { direction });
    return response.data;
  },

  activateMenu: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/menus/${id}/activate`);
    return response.data;
  }
};
