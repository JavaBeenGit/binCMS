import { apiClient } from '../client';

export interface EmailSendRequest {
  email: string;
}

export interface EmailVerifyRequest {
  email: string;
  code: string;
}

export interface EmailSendResponse {
  email: string;
}

export interface EmailVerifyResponse {
  email: string;
  verified: boolean;
}

/**
 * 인증 코드 발송
 */
export const sendVerificationCode = async (data: EmailSendRequest) => {
  const response = await apiClient.post<{
    success: boolean;
    data: EmailSendResponse;
    message: string;
  }>('/public/email/send-code', data);
  return response.data;
};

/**
 * 인증 코드 검증
 */
export const verifyEmailCode = async (data: EmailVerifyRequest) => {
  const response = await apiClient.post<{
    success: boolean;
    data: EmailVerifyResponse;
    message: string;
  }>('/public/email/verify-code', data);
  return response.data;
};
