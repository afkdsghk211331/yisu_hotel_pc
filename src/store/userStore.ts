import { create } from "zustand";

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
  setToken: (token: string) => void;
  setUserInfo: (userInfo: UserInfo) => void;
  clearAuth: () => void;
}

const TOKEN_KEY = "yisu_token";

// 从 localStorage 初始化 token
const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const useUserStore = create<UserState>((set) => ({
  token: getInitialToken(),
  userInfo: null,

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token });
  },

  setUserInfo: (userInfo: UserInfo) => {
    set({ userInfo });
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, userInfo: null });
  },
}));
