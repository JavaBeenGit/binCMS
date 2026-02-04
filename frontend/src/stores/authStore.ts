import { create } from 'zustand';
import type { MemberResponse } from '../api/endpoints/auth';

interface AuthState {
  token: string | null;
  user: MemberResponse | null;
  setAuth: (token: string, user: MemberResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

/**
 * 인증 상태 관리 Store (세션 방식 - 새로고침 시 로그아웃)
 */
export const useAuthStore = create<AuthState>()((set, get) => ({
  token: null,
  user: null,
  
  setAuth: (token, user) => {
    set({ token, user });
    // axios 헤더에 토큰 설정은 interceptor에서 자동 처리
  },
  
  clearAuth: () => {
    set({ token: null, user: null });
  },
  
  isAuthenticated: () => {
    return !!get().token;
  },
}));
