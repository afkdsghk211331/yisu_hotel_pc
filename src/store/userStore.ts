import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: "merchant" | "admin" | "user";
  avatar?: string;
}

interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  setToken: (token: string | null) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  clearAuth: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,

      setToken: (token) => set({ token }),
      setUserInfo: (userInfo) => set({ userInfo }),

      clearAuth: () => set({ token: null, userInfo: null }),
    }),
    {
      name: "yisu_auth", // localStorage key（一个就够了）
      partialize: (state) => ({ token: state.token, userInfo: state.userInfo }),
    },
  ),
);
