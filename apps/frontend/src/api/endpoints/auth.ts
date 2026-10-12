import { apiClient } from '../client';

export interface SignupRequest {
  loginId: string;
  email?: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface MemberResponse {
  id: number;
  loginId: string;
  email?: string;
  name: string;
  phoneNumber?: string;
  provider?: string;
  roleCode: string;
  roleName: string;
  permissions?: string[];
  active: boolean;
  regDt: string;
}

export interface WithdrawRequest {
  password?: string;
  reason?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  member: MemberResponse;
}

/**
 * 회원가입
 */
export const signup = async (data: SignupRequest) => {
  const response = await apiClient.post<{
    success: boolean;
    data: MemberResponse;
    message: string;
  }>('/auth/signup', data);
  return response.data;
};

/**
 * 로그인
 */
export const login = async (data: LoginRequest) => {
  const response = await apiClient.post<{
    success: boolean;
    data: LoginResponse;
    message: string;
  }>('/auth/login', data);
  return response.data;
};

/**
 * 회원탈퇴
 */
export const withdrawMember = async (data: WithdrawRequest) => {
  const response = await apiClient.post<{
    success: boolean;
    data: null;
    message: string;
  }>('/auth/withdraw', data);
  return response.data;
};
