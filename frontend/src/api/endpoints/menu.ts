import client from '../client';
import { ApiResponse } from '../types';

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

  activateMenu: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/menus/${id}/activate`);
    return response.data;
  }
};
