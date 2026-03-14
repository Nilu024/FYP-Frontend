import { create } from "zustand";
import { notificationsAPI } from "../services/api";

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (ids?: string[], markAll?: boolean) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notif: Notification) => void;
}

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await notificationsAPI.getAll({ limit: 30 });
      set({
        notifications: data.data,
        unreadCount: data.unreadCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (ids, markAll) => {
    await notificationsAPI.markRead({ ids, markAll });
    set((state) => ({
      notifications: state.notifications.map((n) =>
        markAll || ids?.includes(n._id) ? { ...n, isRead: true } : n
      ),
      unreadCount: markAll ? 0 : Math.max(0, state.unreadCount - (ids?.length || 0)),
    }));
  },

  deleteNotification: async (id) => {
    await notificationsAPI.delete(id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
      unreadCount: state.notifications.find((n) => n._id === id && !n.isRead)
        ? state.unreadCount - 1
        : state.unreadCount,
    }));
  },

  addNotification: (notif) => {
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
