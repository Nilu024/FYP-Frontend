import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Smartphone, Building, Wallet, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { needsAPI, donationsAPI, recommendAPI } from "../services/api";
import { formatCurrency, getCategoryIcon } from "../lib/utils";
import toast from "react-hot-toast";

const AMOUNTS = [100, 250, 500, 1000, 2500, 5000];
const PAYMENT_METHODS = [
  { value: "upi", label: "UPI", icon: Smartphone, desc: "PhonePe, GPay, Paytm" },
  { value: "card", label: "Debit / Credit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { value: "netbanking", label: "Net Banking", icon: Building, desc: "All major banks" },
  { value: "wallet", label: "Wallet", icon: Wallet, desc: "Amazon Pay, etc." },
];

export default function DonationPage() {
  const { needId } = useParams<{ needId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [need, setNeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const defaultAmt = parseInt(searchParams.get("amount") || "500");
  const [selectedAmt, setSelectedAmt] = useState(AMOUNTS.includes(defaultAmt) ? defaultAmt : 500);
  const [customAmt, setCustomAmt] = useState(AMOUNTS.includes(defaultAmt) ? "" : String(defaultAmt));
  const [payMethod, setPayMethod] = useState("upi");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    needsAPI.getOne(needId!).then(r => setNeed(r.data.data))
      .catch(() => navigate("/needs"))
      .finally(() => setLoading(false));
  }, [needId]);

  const finalAmt = customAmt ? parseInt(customAmt) || 0 : selectedAmt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmt < 10) return toast.error("Minimum donation is ₹10");
    setSubmitting(true);
    try {
      await donationsAPI.create({
        need: needId, charity: need.charity?._id,
        amount: finalAmt, paymentMethod: payMethod, message, isAnonymous: anonymous,
        status: "completed", transactionId: `TXN-${Date.now()}`,
      });
      await recommendAPI.trackInteraction({ category: need.category, charityId: need.charity?._id, action: "donate" }).catch(() => {});
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Donation failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (success) return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center page-in">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180 }}>
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display font-extrabold text-3xl text-foreground mb-2">Thank you! 🎉</h2>
        <p className="text-muted-foreground mb-1">Your donation of</p>
        <p className="font-display font-bold text-3xl text-saffron-600 mb-2">{formatCurrency(finalAmt)}</p>
        <p className="text-muted-foreground text-sm mb-1">to</p>
        <p className="font-semibold text-foreground mb-6">"{need?.title}"</p>
        <p className="text-sm text-muted-foreground mb-2">A receipt has been sent to your email. You're making a real difference! ❤️</p>
        <div className="flex flex-col gap-3 mt-8">
          <Link to="/dashboard" className="py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-bold rounded-xl transition-colors shadow-btn-primary">Go to Dashboard</Link>
          <Link to="/needs" className="py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition-colors">Explore More Causes</Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl page-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group transition-colors">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      <div className="grid sm:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="sm:col-span-3 space-y-5">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Make a Donation</h1>
            <p className="text-sm text-muted-foreground mt-0.5">100% goes directly to the cause</p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Choose amount</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {AMOUNTS.map(a => (
                <button key={a} type="button"
                  onClick={() => { setSelectedAmt(a); setCustomAmt(""); }}
                  className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedAmt === a && !customAmt ? "bg-saffron-500 text-white border-saffron-500 shadow-btn-primary" : "bg-card border-border hover:border-saffron-300 text-foreground"}`}>
                  {formatCurrency(a)}
                </button>
              ))}
            </div>
            <input type="number" min="10" placeholder="Enter a custom amount (₹)"
              value={customAmt} onChange={e => { setCustomAmt(e.target.value); setSelectedAmt(0); }}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Payment method</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon, desc }) => (
                <button key={value} type="button" onClick={() => setPayMethod(value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${payMethod === value ? "bg-saffron-50 border-saffron-400" : "bg-card border-border hover:border-saffron-200"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${payMethod === value ? "bg-saffron-100" : "bg-secondary"}`}>
                    <Icon className={`w-4.5 h-4.5 ${payMethod === value ? "text-saffron-600" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {payMethod === value && <CheckCircle className="w-4 h-4 text-saffron-500 ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Leave a message <span className="font-normal text-muted-foreground">(optional)</span></label>
            <textarea rows={2} placeholder="Encouraging note to the charity…"
              value={message} onChange={e => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all resize-none"
            />
          </div>

          {/* Anonymous */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${anonymous ? "bg-saffron-500 border-saffron-500" : "border-border group-hover:border-saffron-300"}`}
              onClick={() => setAnonymous(v => !v)}>
              {anonymous && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-muted-foreground">Donate anonymously</span>
          </label>

          <button type="submit" disabled={submitting || finalAmt < 10}
            className="w-full py-4 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-all shadow-btn-primary hover:shadow-none flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : `Donate ${formatCurrency(finalAmt)}`}
          </button>
          <p className="text-xs text-center text-muted-foreground">🔒 Secure payment · Receipt sent to email · 80G eligible</p>
        </form>

        {/* Summary */}
        <div className="sm:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24 shadow-card">
            <h3 className="font-semibold text-sm text-foreground mb-4">Donation Summary</h3>
            <div className="flex items-start gap-2.5 mb-4 pb-4 border-b border-border">
              <span className="text-2xl">{getCategoryIcon(need?.category)}</span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{need?.charity?.name}</p>
                <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{need?.title}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your donation</span>
                <span className="font-semibold">{formatCurrency(finalAmt || 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Platform fee</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-saffron-600">{formatCurrency(finalAmt || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
