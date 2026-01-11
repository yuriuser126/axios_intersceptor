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
