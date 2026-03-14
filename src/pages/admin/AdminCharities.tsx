import { useEffect, useState } from "react";
import { CheckCircle, XCircle, MapPin, Mail, ExternalLink, Building } from "lucide-react";
import { adminAPI, charityAPI } from "../../services/api";
import { getCategoryIcon } from "../../lib/utils";
import toast from "react-hot-toast";

export default function AdminCharities() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "all">("pending");

  useEffect(() => { loadCharities(); }, [tab]);

  const loadCharities = async () => {
    setLoading(true);
    try {
      const res = tab === "pending"
        ? await adminAPI.getPendingCharities()
        : await charityAPI.getAll({ limit: 50 });
      setCharities(res.data.data || []);
    } catch { setCharities([]); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await charityAPI.verify(id, { isVerified });
      toast.success(isVerified ? "Charity verified ✅" : "Charity rejected ❌");
      setCharities((prev) => prev.filter((c) => c._id !== id));
    } catch { toast.error("Failed to update status"); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">Charity Management</h1>
          <p className="text-muted-foreground mt-1">Review and verify charity registrations</p>
        </div>
        <div className="flex gap-2">
          {(["pending", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${tab === t ? "bg-saffron-500 text-white border-saffron-500" : "bg-card border-border hover:bg-accent"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : charities.length === 0 ? (
        <div className="text-center py-20">
          <Building className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-xl text-foreground mb-1">
            {tab === "pending" ? "No pending charities" : "No charities found"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {tab === "pending" ? "All caught up! No charity is awaiting verification." : "No charities have been registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {charities.map((charity) => (
            <div key={charity._id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-saffron-100 flex items-center justify-center text-xl font-bold text-saffron-700 flex-shrink-0 overflow-hidden">
                      {charity.logo
                        ? <img src={charity.logo} alt={charity.name} className="w-full h-full object-cover rounded-xl" />
                        : charity.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-lg text-foreground">{charity.name}</h3>
                        {charity.isVerified && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        )}
                        {charity.registrationNumber && (
                          <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                            Reg: {charity.registrationNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{charity.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {charity.location?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {charity.location.city}, {charity.location.state}
                      </span>
                    )}
                    {charity.contact?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {charity.contact.email}
                      </span>
                    )}
                    {charity.contact?.website && (
                      <a href={charity.contact.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-saffron-600 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Website
                      </a>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {charity.categories?.map((cat: string) => (
                      <span key={cat} className="text-xs px-2 py-0.5 bg-saffron-50 text-saffron-700 rounded-full border border-saffron-100">
                        {getCategoryIcon(cat)} {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {tab === "pending" && (
                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleVerify(charity._id, true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Verify
                    </button>
                    <button
                      onClick={() => handleVerify(charity._id, false)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold rounded-xl text-sm transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
