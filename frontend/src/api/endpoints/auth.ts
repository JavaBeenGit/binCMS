import { apiClient } from '../client';

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MemberResponse {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
  regDt: string;
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
