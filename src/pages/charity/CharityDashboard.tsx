import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, Heart, Users, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { charityAPI, needsAPI } from "../../services/api";
import { formatCurrency, getCategoryIcon, getUrgencyColor } from "../../lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  paused: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_ICON: Record<string, any> = {
  pending: Clock, approved: CheckCircle, rejected: AlertCircle,
  completed: CheckCircle, paused: Clock,
};

export default function CharityDashboard() {
  const [charity, setCharity] = useState<any>(null);
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [charRes] = await Promise.all([charityAPI.getMy()]);
      setCharity(charRes.data.data);

      const needsRes = await needsAPI.getByCharity(charRes.data.data._id);
      // Also fetch pending ones
      setNeeds(needsRes.data.data || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No charity yet - redirect to create
      }
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  if (!charity) return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <div className="text-5xl mb-4">🏛</div>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Set up your charity profile</h2>
      <p className="text-muted-foreground mb-6">Register your organisation to start listing needs and receiving donations.</p>
      <Link to="/charity/create" className="px-6 py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold rounded-xl transition-colors">
        Register Your Charity
      </Link>
    </div>
  );

  const totalRaised = needs.reduce((sum, n) => sum + (n.raisedAmount || 0), 0);
  const approvedCount = needs.filter(n => n.status === "approved").length;
  const pendingCount = needs.filter(n => n.status === "pending").length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-saffron-100 flex items-center justify-center text-2xl font-bold text-saffron-700 overflow-hidden">
            {charity.logo ? <img src={charity.logo} className="w-full h-full object-cover" /> : charity.name?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl text-foreground">{charity.name}</h1>
              {charity.isVerified
                ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                : <span className="flex items-center gap-1 text-xs text-orange-500 font-semibold"><Clock className="w-3.5 h-3.5" /> Pending verification</span>
              }
            </div>
            <p className="text-sm text-muted-foreground">{charity.location?.city}</p>
          </div>
        </div>
        <Link to="/charity/needs/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> List a Need
        </Link>
      </div>

      {/* Verification warning */}
      {!charity.isVerified && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800 text-sm">Awaiting Admin Verification</p>
            <p className="text-sm text-orange-700 mt-0.5">
              Your charity is under review. Once verified, your listed needs will be visible to donors and push notifications will be sent.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: "Total Raised", value: formatCurrency(totalRaised), color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Heart, label: "Active Needs", value: approvedCount, color: "text-saffron-500", bg: "bg-saffron-50" },
          { icon: Clock, label: "Pending Review", value: pendingCount, color: "text-orange-500", bg: "bg-orange-50" },
          { icon: Users, label: "Followers", value: charity.followerCount || 0, color: "text-blue-500", bg: "bg-blue-50" },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="font-display font-bold text-xl text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Needs list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">Your Listed Needs</h2>
          <Link to="/charity/needs" className="text-sm text-saffron-600 hover:underline">View all</Link>
        </div>
        {needs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-semibold text-foreground mb-1">No needs listed yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start by listing what your charity needs — food, funds, volunteers, or more.</p>
            <Link to="/charity/needs/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-500 text-white font-semibold rounded-xl text-sm">
              <Plus className="w-4 h-4" /> List Your First Need
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {needs.map((need) => {
              const progress = need.targetAmount > 0 ? Math.min((need.raisedAmount / need.targetAmount) * 100, 100) : 0;
              const StatusIcon = STATUS_ICON[need.status] || Clock;
              return (
                <div key={need._id} className="px-6 py-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                  <span className="text-xl flex-shrink-0">{getCategoryIcon(need.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{need.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                        <div className="h-full bg-saffron-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{formatCurrency(need.raisedAmount)} / {formatCurrency(need.targetAmount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[need.status]}`}>
                      <StatusIcon className="w-3 h-3" /> {need.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getUrgencyColor(need.urgency)}`}>
                      {need.urgency}
                    </span>
                    <Link to={`/charity/needs/edit/${need._id}`}
                      className="text-xs text-saffron-600 hover:underline">Edit</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
