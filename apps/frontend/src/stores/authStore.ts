import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MemberResponse } from '../api/endpoints/auth';

interface AuthState {
  token: string | null;
  user: MemberResponse | null;
  setAuth: (token: string, user: MemberResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

/**
 * 인증 상태 관리 Store (localStorage에 저장하여 새로고침 후에도 유지)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'auth-storage', // localStorage key
      // sessionStorage를 사용하려면 다음 주석을 해제하세요:
      // storage: createJSONStorage(() => sessionStorage),
    }
  )
);
