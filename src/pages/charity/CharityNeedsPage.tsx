import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye } from "lucide-react";
import { charityAPI, needsAPI } from "../../services/api";
import { formatCurrency, getCategoryIcon, getUrgencyColor } from "../../lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  paused: "bg-gray-100 text-gray-600",
};

export default function CharityNeedsPage() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charityAPI.getMy()
      .then(r => needsAPI.getByCharity(r.data.data._id))
      .then(r => setNeeds(r.data.data || []))
      .catch(() => setNeeds([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">My Listed Needs</h1>
          <p className="text-muted-foreground mt-1">{needs.length} needs total</p>
        </div>
        <Link to="/charity/needs/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Need
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : needs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-display font-semibold text-xl mb-2">No needs yet</h3>
          <Link to="/charity/needs/create" className="text-saffron-600 hover:underline text-sm">
            List your first need →
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {needs.map((need) => {
              const progress = need.targetAmount > 0 ? Math.min((need.raisedAmount / need.targetAmount) * 100, 100) : 0;
              return (
                <div key={need._id} className="px-6 py-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                  <span className="text-xl">{getCategoryIcon(need.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{need.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[160px]">
                        <div className="h-full bg-saffron-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(need.raisedAmount)} / {formatCurrency(need.targetAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[need.status]}`}>
                      {need.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getUrgencyColor(need.urgency)}`}>
                      {need.urgency}
                    </span>
                    <Link to={`/needs/${need._id}`} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="View">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <Link to={`/charity/needs/edit/${need._id}`} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Edit">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Link>
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
