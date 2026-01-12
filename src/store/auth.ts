/**
 * ============================================================================
 * 레이어: 전역 상태 관리 (Global State Layer)
 * ============================================================================
 * 
 * 📦 사용 라이브러리: Zustand
 * 
 * 역할:
 * - Access Token과 Refresh Token을 전역으로 관리
 * - axios 인터셉터에서 토큰을 참조하여 Authorization 헤더에 추가
 * - UI 컴포넌트에서 토큰을 읽고 수정 가능
 * 
 * 사용 위치:
 * - src/lib/axios.ts: 요청 인터셉터에서 토큰 참조
 * - src/app/page.tsx: 토큰 입력/조회 UI
 * 
 * 특징:
 * - 가벼운 상태 관리 라이브러리 (Redux 대안)
 * - Provider 없이 사용 가능
 * - TypeScript 지원
 */

import { create } from "zustand";

export type AuthTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

type AuthState = AuthTokens & {
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: (tokens) => set(tokens),
  clearTokens: () => set({ accessToken: null, refreshToken: null })
}));
