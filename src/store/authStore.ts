import { create } from "zustand";
import { authAPI } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "donor" | "charity" | "admin";
  avatar?: string;
  location?: any;
  preferences?: any;
  followedCharities?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const getStoredUser = (): User | null => {
  try {
    const u = localStorage.getItem("aadhar_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem("aadhar_token"),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("aadhar_token"),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem("aadhar_token", data.token);
      localStorage.setItem("aadhar_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register(formData);
      localStorage.setItem("aadhar_token", data.token);
      localStorage.setItem("aadhar_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem("aadhar_token");
    localStorage.removeItem("aadhar_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (data) => {
    const updated = { ...get().user, ...data } as User;
    localStorage.setItem("aadhar_user", JSON.stringify(updated));
    set({ user: updated });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("aadhar_token");
    if (!token) return;
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem("aadhar_user", JSON.stringify(data.data));
      set({ user: data.data, isAuthenticated: true });
    } catch {
      localStorage.removeItem("aadhar_token");
      localStorage.removeItem("aadhar_user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
