import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MemberResponse } from '../api/endpoints/auth';

interface AdminAuthState {
  token: string | null;
  user: MemberResponse | null;
  setAuth: (token: string, user: MemberResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

/**
 * 관리자 인증 상태 관리 Store
 * - localStorage key: 'admin-auth-storage'
 * - 사용자 authStore와 완전 분리
 */
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => {
        set({ token, user });
      },

      clearAuth: () => {
        set({ token: null, user: null });
      },

      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
