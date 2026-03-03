// stores/userStore.ts
import { LOCAL_STORAGE_KEYS } from '@/constants/local-storage.const';
import { IAuthTokens, IUser, IUserSession } from '@/types/user.types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer'; // optional but nice

interface IUserStore {
  // State
  user: IUser | null;
  tokens: IAuthTokens | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  login: (session: IUserSession) => void;
  logout: () => void;
  updateUser: (patch: Partial<IUser>) => void;
  updateUserInfor: (user: any) => void;
  updateTokens: (tokens: IAuthTokens) => void;
  setHasHydrated: (value: boolean) => void;

  // Computed helpers
  // isTokenExpired: () => boolean;
}

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  _hasHydrated: false,
};

export const useUserStore = create<IUserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (session) =>
        set({
          user: session.user,
          tokens: session.tokens,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          ...initialState,
          _hasHydrated: true, // giữ lại hydrated sau khi logout
        }),

      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),

      updateUserInfor: (user) => set({ user }),

      updateTokens: (tokens) => set({ tokens }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      // isTokenExpired: () => {
      //   // const { tokens } = get();
      //   // if (!tokens?.) return false;
      //   // return Date.now() >= tokens.expiresAt;
      //   return false;
      // },
    }),
    {
      name: LOCAL_STORAGE_KEYS.ZUST_ACCOUNT,
      storage: createJSONStorage(() => localStorage),

      // Chỉ persist những field cần thiết, bỏ qua _hasHydrated
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ─── Selectors (tránh re-render không cần thiết) ───────────────────────────

export const useCurrentUser = () => useUserStore((s) => s.user);
export const useAuthTokens = () => useUserStore((s) => s.tokens);
export const useIsAuthenticated = () => useUserStore((s) => s.isAuthenticated);
export const useHasHydrated = () => useUserStore((s) => s._hasHydrated);

// Selector kết hợp - chỉ re-render khi cả 2 thay đổi
export const useAuthState = () =>
  useUserStore((s) => ({
    user: s.user,
    isAuthenticated: s.isAuthenticated,
  }));
