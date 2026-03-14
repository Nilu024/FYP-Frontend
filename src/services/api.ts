import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aadhar_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("aadhar_token");
      localStorage.removeItem("aadhar_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data: any) => api.put("/auth/profile", data),
  updatePassword: (data: any) => api.put("/auth/password", data),
};

// ── CHARITIES ──────────────────────────────────────
export const charityAPI = {
  getAll: (params?: any) => api.get("/charities", { params }),
  getOne: (id: string) => api.get(`/charities/${id}`),
  getMy: () => api.get("/charities/my"),
  create: (data: any) => api.post("/charities", data),
  update: (id: string, data: any) => api.put(`/charities/${id}`, data),
  toggleFollow: (id: string) => api.post(`/charities/${id}/follow`),
  verify: (id: string, data: any) => api.patch(`/charities/${id}/verify`, data),
};

// ── NEEDS ──────────────────────────────────────────
export const needsAPI = {
  getAll: (params?: any) => api.get("/needs", { params }),
  getOne: (id: string) => api.get(`/needs/${id}`),
  getByCharity: (charityId: string) => api.get(`/needs/charity/${charityId}`),
  create: (data: any) => api.post("/needs", data),
  update: (id: string, data: any) => api.put(`/needs/${id}`, data),
  updateStatus: (id: string, data: any) => api.patch(`/needs/${id}/status`, data),
};

// ── DONATIONS ─────────────────────────────────────
export const donationsAPI = {
  create: (data: any) => api.post("/donations", data),
  getMyDonations: (params?: any) => api.get("/donations/my", { params }),
  getOne: (id: string) => api.get(`/donations/${id}`),
};

// ── RECOMMENDATIONS ───────────────────────────────
export const recommendAPI = {
  getRecommendations: (params?: any) => api.get("/recommendations", { params }),
  getNearby: (params?: any) => api.get("/recommendations/nearby", { params }),
  getForYou: (params?: any) => api.get("/recommendations/for-you", { params }),
  trackInteraction: (data: any) => api.post("/recommendations/track", data),
};

// ── NOTIFICATIONS ─────────────────────────────────
export const notificationsAPI = {
  getVapidKey: () => api.get("/notifications/vapid-key"),
  subscribe: (subscription: any) => api.post("/notifications/subscribe", { subscription }),
  unsubscribe: (endpoint: string) => api.delete("/notifications/subscribe", { data: { endpoint } }),
  getAll: (params?: any) => api.get("/notifications", { params }),
  markRead: (data: any) => api.patch("/notifications/read", data),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ── ADMIN ─────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getPendingCharities: () => api.get("/admin/charities/pending"),
  getPendingNeeds: () => api.get("/admin/needs/pending"),
  getUsers: (params?: any) => api.get("/admin/users", { params }),
  getAnalytics: () => api.get("/admin/analytics"),
};

export default api;
