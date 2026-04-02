import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Sparkles, Bell, ChevronRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import EmailVerificationDialog from "../components/EmailVerificationDialog";
import RecommendationCarousel from "../components/donor/RecommendationCarousel";
import { donationsAPI } from "../services/api";
import { formatCurrency, formatDate, getCategoryIcon } from "../lib/utils";
import { registerPushNotifications, isPushSubscribed } from "../services/pushNotifications";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, unverifiedEmail, setUnverifiedEmail } = useAuthStore();
  const [donations, setDonations] = useState<any[]>([]);
  const [totalGiven, setTotalGiven] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [dialogDismissed, setDialogDismissed] = useState(false);

  useEffect(() => {
    donationsAPI.getMyDonations({ limit: 5 }).then(r => {
      const data = r.data.data || [];
      setDonations(data);
      setTotalGiven(data.reduce((s: number, d: any) => s + (d.amount || 0), 0));
    }).catch(() => {});
    isPushSubscribed().then(setPushEnabled);
  }, []);

  // Show email verification dialog if email is not verified and user hasn't dismissed it
  useEffect(() => {
    if (user && !user.emailVerified && !dialogDismissed && !unverifiedEmail) {
      setUnverifiedEmail(user.email);
    }
  }, [user?.emailVerified, user?.email, dialogDismissed, unverifiedEmail, setUnverifiedEmail]);

  const handleDialogClose = () => {
    setUnverifiedEmail(undefined);
    setDialogDismissed(true);
  };

  const handleEnablePush = async () => {
    setPushLoading(true);
    const ok = await registerPushNotifications();
    setPushEnabled(ok);
    if (ok) toast.success("Push notifications enabled! 🔔");
    else toast.error("Could not enable — check browser permissions.");
    setPushLoading(false);
  };

  const topCategories = Object.entries(
    (user?.preferences?.categoryWeights as Record<string, number>) || {}
  ).sort(([, a], [, b]) => b - a).slice(0, 4);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="container mx-auto px-4 py-8 page-in">

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">
            Hello, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here are causes near you and personalised picks just for you.
          </p>
        </div>
        {!pushEnabled && (
          <button onClick={handleEnablePush} disabled={pushLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-700 border border-saffron-200 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 shrink-0">
            <Bell className="w-4 h-4" />
            {pushLoading ? "Setting up…" : "Enable Alerts"}
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Heart, label: "Total Given", value: formatCurrency(totalGiven), color: "text-red-500", bg: "bg-red-50" },
          { icon: TrendingUp, label: "Donations", value: donations.length, color: "text-saffron-500", bg: "bg-saffron-50" },
          { icon: MapPin, label: "Your City", value: user?.location?.city || "Not set", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Sparkles, label: "Top Interest", value: topCategories[0]?.[0] || "None yet", color: "text-purple-500", bg: "bg-purple-50" },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div className="font-display font-bold text-lg text-foreground truncate">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Notification banner */}
      {!pushEnabled && (
        <div className="bg-gradient-to-r from-saffron-50 to-orange-50 border border-saffron-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-saffron-100 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-saffron-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">Get notified about urgent causes near you</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enable push notifications and email alerts to never miss a cause that needs your help.
            </p>
          </div>
          <button onClick={handleEnablePush} disabled={pushLoading}
            className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60 shrink-0 shadow-btn-primary">
            {pushLoading ? "Enabling…" : "Enable Now"}
          </button>
        </div>
      )}

      {/* KNN: Nearby */}
      <RecommendationCarousel
        title="Causes Near You"
        subtitle={`Nearest active needs${user?.location?.city ? ` · ${user.location.city}` : ""} · KNN location engine`}
        type="nearby"
        maxDistanceKm={25}
        k={8}
      />

      {/* KNN: For You */}
      <RecommendationCarousel
        title="For You"
        subtitle="Personalised picks based on your interests and activity"
        type="for-you"
        k={8}
      />

      {/* Interest profile */}
      {topCategories.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-saffron-500" /> Your Interest Profile
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Based on your browsing and donations — this shapes your personalised feed.
          </p>
          <div className="space-y-3">
            {topCategories.map(([cat, weight]) => {
              const max = topCategories[0][1] as number;
              const pct = Math.round(((weight as number) / max) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-foreground">{getCategoryIcon(cat)} {cat}</span>
                    <span className="text-muted-foreground">{weight as number} interactions</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div className="progress-bar-fill h-full" initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent donations */}
      {donations.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" /> Recent Donations
            </h3>
            <Link to="/my-donations" className="text-xs text-saffron-600 font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {donations.map(d => (
              <div key={d._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-saffron-50 flex items-center justify-center text-lg shrink-0">
                  {getCategoryIcon(d.need?.category || "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{d.need?.title || d.charity?.name || "Donation"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(d.amount)}</p>
                  <p className={`text-xs capitalize ${d.status === "completed" ? "text-emerald-600" : "text-amber-500"}`}>
                    {d.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Verification Dialog */}
      <EmailVerificationDialog
        email={unverifiedEmail}
        isOpen={!!unverifiedEmail && !!user && !user.emailVerified && !dialogDismissed}
        onClose={handleDialogClose}
      />
    </div>
  );
}
