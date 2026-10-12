import client from '../client';
import type { ApiResponse } from '../types';

export interface RoleResponse {
  id: number;
  roleCode: string;
  roleName: string;
  description?: string;
  sortOrder: number;
  useYn: string;
  permissions?: string[];
  regDt?: string;
  modDt?: string;
}

export interface PermissionResponse {
  id: number;
  permCode: string;
  permName: string;
  permGroup: string;
  description?: string;
  sortOrder: number;
  useYn: string;
}

export interface AdminMemberCreateRequest {
  loginId: string;
  email?: string;
  password: string;
  name: string;
  phoneNumber?: string;
  roleCode: string;
}

export interface AdminMemberUpdateRequest {
  name: string;
  email?: string;
  phoneNumber?: string;
  roleCode: string;
}

export interface AdminPasswordResetRequest {
  newPassword: string;
}

export interface AdminMemberResponse {
  id: number;
  loginId: string;
  email?: string;
  name: string;
  phoneNumber?: string;
  roleCode: string;
  roleName: string;
  active: boolean;
  regDt: string;
}

export interface AdminMemberPageResponse {
  content: AdminMemberResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export const adminMemberApi = {
  /** 관리자 회원 목록 조회 */
  getAdminMembers: async (
    page: number = 0,
    size: number = 10,
    keyword?: string
  ): Promise<ApiResponse<AdminMemberPageResponse>> => {
    const response = await client.get('/admin/members', {
      params: { page, size, keyword }
    });
    return response.data;
  },

  /** 관리자 회원 상세 조회 */
  getAdminMember: async (id: number): Promise<ApiResponse<AdminMemberResponse>> => {
    const response = await client.get(`/admin/members/${id}`);
    return response.data;
  },

  /** 관리자 회원 생성 */
  createAdminMember: async (data: AdminMemberCreateRequest): Promise<ApiResponse<AdminMemberResponse>> => {
    const response = await client.post('/admin/members', data);
    return response.data;
  },

  /** 관리자 회원 수정 */
  updateAdminMember: async (id: number, data: AdminMemberUpdateRequest): Promise<ApiResponse<AdminMemberResponse>> => {
    const response = await client.put(`/admin/members/${id}`, data);
    return response.data;
  },

  /** 비밀번호 초기화 */
  resetPassword: async (id: number, data: AdminPasswordResetRequest): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/members/${id}/password`, data);
    return response.data;
  },

  /** 관리자 회원 비활성화 */
  deactivateAdminMember: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/members/${id}/deactivate`);
    return response.data;
  },

  /** 관리자 회원 활성화 */
  activateAdminMember: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/members/${id}/activate`);
    return response.data;
  }
};

/**
 * 역할/권한 관리 API
 */
export const roleApi = {
  /** 전체 역할 목록 조회 */
  getAllRoles: async (): Promise<ApiResponse<RoleResponse[]>> => {
    const response = await client.get('/admin/roles');
    return response.data;
  },

  /** 관리자 역할 목록 조회 (USER 제외) */
  getAdminRoles: async (): Promise<ApiResponse<RoleResponse[]>> => {
    const response = await client.get('/admin/roles/admin');
    return response.data;
  },

  /** 역할 상세 조회 */
  getRole: async (id: number): Promise<ApiResponse<RoleResponse>> => {
    const response = await client.get(`/admin/roles/${id}`);
    return response.data;
  },

  /** 역할 생성 */
  createRole: async (data: {
    roleCode: string;
    roleName: string;
    description?: string;
    sortOrder?: number;
    permissionCodes?: string[];
  }): Promise<ApiResponse<RoleResponse>> => {
    const response = await client.post('/admin/roles', data);
    return response.data;
  },

  /** 역할 수정 */
  updateRole: async (id: number, data: {
    roleName: string;
    description?: string;
    sortOrder?: number;
    permissionCodes?: string[];
  }): Promise<ApiResponse<RoleResponse>> => {
    const response = await client.put(`/admin/roles/${id}`, data);
    return response.data;
  },

  /** 역할 삭제 */
  deleteRole: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.delete(`/admin/roles/${id}`);
    return response.data;
  },

  /** 역할 활성화 */
  activateRole: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/roles/${id}/activate`);
    return response.data;
  },

  /** 역할 비활성화 */
  deactivateRole: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/roles/${id}/deactivate`);
    return response.data;
  },

  /** 전체 권한 목록 조회 */
  getPermissions: async (): Promise<ApiResponse<PermissionResponse[]>> => {
    const response = await client.get('/admin/roles/permissions');
    return response.data;
  },
};
