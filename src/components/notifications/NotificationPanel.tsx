import { useEffect } from "react";
import { Bell, CheckCheck, Trash2, X, ExternalLink, Check } from "lucide-react";
import { useNotifStore } from "../../store/notifStore";
import { formatDate } from "../../lib/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_ICON: Record<string, string> = {
  new_need: "📣", urgent_need: "🚨", donation_confirmed: "✅",
  need_completed: "🎉", charity_update: "📢", system: "🔔",
};
const TYPE_BG: Record<string, string> = {
  new_need: "bg-blue-100", urgent_need: "bg-red-100", donation_confirmed: "bg-emerald-100",
  need_completed: "bg-purple-100", charity_update: "bg-amber-100", system: "bg-secondary",
};

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, isLoading, fetchNotifications, markRead, deleteNotification } = useNotifStore();

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-saffron-500" />
          <span className="font-semibold text-sm text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button onClick={() => markRead([], true)} title="Mark all read"
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-5 h-5 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/25 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Enable alerts to get notified about causes near you</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map(n => (
              <motion.div key={n._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`flex gap-3 p-3.5 border-b border-border/60 hover:bg-secondary/40 transition-colors group ${!n.isRead ? "bg-saffron-50/40" : ""}`}>
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${TYPE_BG[n.type] || TYPE_BG.system}`}>
                  {TYPE_ICON[n.type] || "🔔"}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-snug ${!n.isRead ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">{formatDate(n.createdAt)}</p>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!n.isRead && (
                    <button onClick={() => markRead([n._id])} className="p-1 rounded-lg hover:bg-emerald-100 transition-colors" title="Mark read">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </button>
                  )}
                  {n.data?.url && (
                    <Link to={n.data.url} onClick={onClose} className="p-1 rounded-lg hover:bg-blue-100 transition-colors">
                      <ExternalLink className="w-3 h-3 text-blue-600" />
                    </Link>
                  )}
                  <button onClick={() => deleteNotification(n._id)} className="p-1 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
                {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-saffron-500 shrink-0 mt-2" />}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
