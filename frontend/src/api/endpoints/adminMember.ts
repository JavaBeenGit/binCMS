import client from '../client';
import type { ApiResponse } from '../types';

export enum MemberRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface AdminMemberCreateRequest {
  loginId: string;
  email?: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role: MemberRole;
}

export interface AdminMemberUpdateRequest {
  name: string;
  email?: string;
  phoneNumber?: string;
  role: MemberRole;
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
  role: MemberRole;
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
