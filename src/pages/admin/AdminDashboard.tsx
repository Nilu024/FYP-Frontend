import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Building, ListChecks, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { adminAPI } from "../../services/api";
import { formatCurrency } from "../../lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => { setStats(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  // stats shape: { totalUsers, totalCharities, pendingCharities, totalNeeds, pendingNeeds, criticalNeeds, totalDonations, donationCount }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and pending actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Total Users", value: stats?.totalUsers || 0, color: "text-blue-500", bg: "bg-blue-50" },
          { icon: Building, label: "Charities", value: stats?.totalCharities || 0, sub: `${stats?.pendingCharities || 0} pending`, color: "text-saffron-500", bg: "bg-saffron-50" },
          { icon: ListChecks, label: "Total Needs", value: stats?.totalNeeds || 0, sub: `${stats?.pendingNeeds || 0} pending`, color: "text-purple-500", bg: "bg-purple-50" },
          { icon: TrendingUp, label: "Total Raised", value: formatCurrency(stats?.totalDonations || 0), color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="font-display font-bold text-xl text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
            {sub && <div className="text-xs text-orange-500 font-medium mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/admin/charities" className="bg-card border border-orange-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-orange-600 transition-colors">
                Pending Charities
              </p>
              <p className="text-2xl font-bold text-orange-500">{stats?.pendingCharities || 0}</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/needs" className="bg-card border border-blue-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                Pending Needs
              </p>
              <p className="text-2xl font-bold text-blue-500">{stats?.pendingNeeds || 0}</p>
            </div>
          </div>
        </Link>
        <div className="bg-card border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Critical Needs Live</p>
              <p className="text-2xl font-bold text-emerald-500">{stats?.criticalNeeds || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {stats?.categoryBreakdown?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display font-semibold text-foreground mb-4">Needs by Category</h2>
          <div className="space-y-3">
            {stats.categoryBreakdown.slice(0, 8).map((cat: any) => {
              const pct = stats.categoryBreakdown[0]?.count > 0
                ? Math.round((cat.count / stats.categoryBreakdown[0].count) * 100) : 0;
              return (
                <div key={cat._id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{cat._id}</span>
                    <span className="text-muted-foreground">{cat.count} needs</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-saffron-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
