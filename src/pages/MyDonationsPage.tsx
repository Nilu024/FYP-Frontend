import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Receipt, ExternalLink } from "lucide-react";
import { donationsAPI } from "../services/api";
import { formatCurrency, formatDate, getCategoryIcon } from "../lib/utils";

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    donationsAPI.getMyDonations({ limit: 50 })
      .then(r => {
        const data = r.data.data || [];
        setDonations(data);
        setTotal(data.reduce((s: number, d: any) => s + (d.amount || 0), 0));
      })
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">My Donations</h1>
          <p className="text-muted-foreground mt-1">
            {donations.length} donations · Total: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-20">
          <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-xl mb-2">No donations yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">Start making a difference today</p>
          <Link to="/needs" className="px-6 py-3 bg-saffron-500 text-white font-semibold rounded-xl hover:bg-saffron-600 transition-colors">
            Browse Needs
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {donations.map((don) => (
              <div key={don._id} className="px-6 py-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-saffron-50 flex items-center justify-center text-xl flex-shrink-0">
                  {getCategoryIcon(don.need?.category || "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {don.need?.title || don.charity?.name || "Donation"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(don.createdAt)}</p>
                  {don.receiptNumber && (
                    <p className="text-xs text-muted-foreground/60">{don.receiptNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatCurrency(don.amount)}</p>
                    <p className={`text-xs capitalize ${don.status === "completed" ? "text-emerald-600" : "text-yellow-600"}`}>
                      {don.status}
                    </p>
                  </div>
                  {don.need?._id && (
                    <Link to={`/needs/${don.need._id}`} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
