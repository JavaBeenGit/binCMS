import { apiClient } from '../client';
import type { LoginResponse } from './auth';

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  authUrl: string;
}

/**
 * 카카오 OAuth 설정 조회
 */
export const getKakaoConfig = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: OAuthConfig;
  }>('/public/oauth/kakao/config');
  return response.data;
};

/**
 * 카카오 인가 코드로 로그인
 */
export const kakaoLogin = async (code: string) => {
  const response = await apiClient.post<{
    success: boolean;
    data: LoginResponse;
    message: string;
  }>('/public/oauth/kakao', { code });
  return response.data;
};

/**
 * 카카오 인가 URL 생성
 */
export const buildKakaoAuthUrl = (config: OAuthConfig) => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
  });
  return `${config.authUrl}?${params.toString()}`;
};
