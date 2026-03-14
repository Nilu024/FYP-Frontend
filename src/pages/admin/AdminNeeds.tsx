import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, ListChecks } from "lucide-react";
import { adminAPI, needsAPI } from "../../services/api";
import { formatCurrency, getCategoryIcon, getUrgencyColor } from "../../lib/utils";
import toast from "react-hot-toast";

export default function AdminNeeds() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { loadNeeds(); }, []);

  const loadNeeds = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingNeeds();
      setNeeds(res.data.data || []);
    } catch { setNeeds([]); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id: string, status: string, rejectionReason?: string) => {
    try {
      await needsAPI.updateStatus(id, { status, rejectionReason });
      toast.success(status === "approved" ? "Need approved ✅" : "Need rejected ❌");
      setNeeds((prev) => prev.filter((n) => n._id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch { toast.error("Failed to update status"); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground">Needs Moderation</h1>
        <p className="text-muted-foreground mt-1">Review and approve charity needs before they go live</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : needs.length === 0 ? (
        <div className="text-center py-20">
          <ListChecks className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-xl text-foreground mb-1">No pending needs</h3>
          <p className="text-muted-foreground text-sm">All charity needs have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {needs.map((need) => (
            <div key={need._id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                <div className="flex-1 space-y-3">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl">{getCategoryIcon(need.category)}</span>
                    <span className="text-xs text-muted-foreground font-medium">{need.category}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(need.urgency)}`}>
                      {need.urgency}
                    </span>
                    {need.urgency === "critical" && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Critical — will broadcast push notification if approved
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-lg text-foreground">{need.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{need.description}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>🏛 {need.charity?.name || "Unknown Charity"}</span>
                    <span>🎯 Target: {formatCurrency(need.targetAmount)}</span>
                    {need.deadline && (
                      <span>📅 Deadline: {new Date(need.deadline).toLocaleDateString("en-IN")}</span>
                    )}
                    {need.beneficiaryCount > 0 && (
                      <span>👥 {need.beneficiaryCount} beneficiaries</span>
                    )}
                  </div>

                  {/* Tags */}
                  {need.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {need.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleStatus(need._id, "approved")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  {rejectingId === need._id ? (
                    <div className="space-y-2 min-w-[200px]">
                      <textarea
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-background border border-red-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatus(need._id, "rejected", rejectReason)}
                          disabled={!rejectReason.trim()}
                          className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(""); }}
                          className="px-3 py-2 bg-card border border-border rounded-lg text-xs hover:bg-accent transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRejectingId(need._id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold rounded-xl text-sm transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
