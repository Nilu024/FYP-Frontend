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

interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<RegisterResponse>;
  verifyEmail: (email: string, otp: string) => Promise<User>;
  resendVerification: (email: string) => Promise<void>;
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

const getStoredToken = (): string | null => {
  const token = localStorage.getItem("aadhar_token");
  if (!token || token === "undefined" || token === "null") return null;
  return token;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: false,
  isAuthenticated: !!getStoredToken(),

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
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  verifyEmail: async (email, otp) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.verifyEmail({ email, otp });
      localStorage.setItem("aadhar_token", data.token);
      localStorage.setItem("aadhar_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  resendVerification: async (email) => {
    const { data } = await authAPI.resendVerification({ email });
    if (!data.success) {
      throw new Error(data.error || "Could not resend verification email");
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
    const token = getStoredToken();
    if (!token) return;

    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem("aadhar_user", JSON.stringify(data.data));
      set({ user: data.data, token, isAuthenticated: true });
    } catch {
      localStorage.removeItem("aadhar_token");
      localStorage.removeItem("aadhar_user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
