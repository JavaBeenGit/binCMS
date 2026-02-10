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

/**
 * 네이버 OAuth 설정 조회
 */
export const getNaverConfig = async () => {
  const response = await apiClient.get<{
    success: boolean;
    data: OAuthConfig;
  }>('/public/oauth/naver/config');
  return response.data;
};

/**
 * 네이버 인가 코드로 로그인
 */
export const naverLogin = async (code: string, state: string) => {
  const response = await apiClient.post<{
    success: boolean;
    data: LoginResponse;
    message: string;
  }>('/public/oauth/naver', { code, state });
  return response.data;
};

/**
 * 네이버 인가 URL 생성
 * 네이버는 CSRF 방지를 위해 state 파라미터가 필수
 */
export const buildNaverAuthUrl = (config: OAuthConfig) => {
  const state = generateRandomState();
  sessionStorage.setItem('naver_oauth_state', state);

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    state,
  });
  return `${config.authUrl}?${params.toString()}`;
};

/**
 * CSRF 방지용 랜덤 state 생성
 */
const generateRandomState = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};
