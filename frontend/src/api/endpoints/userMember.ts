import client from '../client';
import type { ApiResponse } from '../types';

export interface UserMemberResponse {
  id: number;
  loginId: string;
  email?: string;
  name: string;
  phoneNumber?: string;
  roleCode: string;
  roleName: string;
  provider: string;
  emailVerified: boolean;
  active: boolean;
  regDt: string;
}

export interface UserMemberPageResponse {
  content: UserMemberResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UserMemberUpdateRequest {
  name: string;
  email?: string;
  phoneNumber?: string;
  active?: boolean;
}

export interface UserPasswordResetRequest {
  newPassword: string;
}

export const userMemberApi = {
  /** 사용자 회원 목록 조회 */
  getUserMembers: async (
    page: number = 0,
    size: number = 10,
    keyword?: string,
    provider?: string,
    active?: boolean
  ): Promise<ApiResponse<UserMemberPageResponse>> => {
    const response = await client.get('/admin/users', {
      params: { page, size, keyword, provider, active }
    });
    return response.data;
  },

  /** 사용자 회원 상세 조회 */
  getUserMember: async (id: number): Promise<ApiResponse<UserMemberResponse>> => {
    const response = await client.get(`/admin/users/${id}`);
    return response.data;
  },

  /** 사용자 회원 수정 */
  updateUserMember: async (id: number, data: UserMemberUpdateRequest): Promise<ApiResponse<UserMemberResponse>> => {
    const response = await client.put(`/admin/users/${id}`, data);
    return response.data;
  },

  /** 비밀번호 초기화 */
  resetPassword: async (id: number, data: UserPasswordResetRequest): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/users/${id}/password`, data);
    return response.data;
  },

  /** 사용자 비활성화 */
  deactivateUser: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/users/${id}/deactivate`);
    return response.data;
  },

  /** 사용자 활성화 */
  activateUser: async (id: number): Promise<ApiResponse<void>> => {
    const response = await client.patch(`/admin/users/${id}/activate`);
    return response.data;
  },
};
