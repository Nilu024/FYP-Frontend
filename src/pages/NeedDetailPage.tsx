import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, Users, Share2, ArrowLeft, AlertTriangle, CheckCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { needsAPI, recommendAPI } from "../services/api";
import { formatCurrency, formatDate, getCategoryIcon, getUrgencyColor } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function NeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [need, setNeed] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    needsAPI.getOne(id!).then(r => {
      setNeed(r.data.data);
      if (isAuthenticated) {
        recommendAPI.trackInteraction({ category: r.data.data.category, charityId: r.data.data.charity?._id, action: "view" }).catch(() => {});
      }
    }).catch(() => { toast.error("Need not found"); navigate("/needs"); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="h-6 w-20 skeleton mb-6" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 skeleton" /><div className="h-32 skeleton" />
        </div>
        <div className="h-48 skeleton" />
      </div>
    </div>
  );
  if (!need) return null;

  const progress = need.targetAmount > 0 ? Math.min((need.raisedAmount / need.targetAmount) * 100, 100) : 0;
  const isCritical = need.urgency === "critical";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl page-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group transition-colors">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to causes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Urgency alert */}
          {isCritical && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700">🚨 CRITICAL — This need requires immediate support</p>
            </div>
          )}

          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                {getCategoryIcon(need.category)} {need.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getUrgencyColor(need.urgency)}`}>
                {need.urgency}
              </span>
              {need.status === "completed" && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3 h-3" /> Fulfilled
                </span>
              )}
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground leading-tight">{need.title}</h1>

            {need.charity && (
              <Link to={`/charities/${need.charity._id}`} className="inline-flex items-center gap-2 mt-3 group">
                <div className="w-7 h-7 rounded-lg bg-saffron-100 flex items-center justify-center text-sm font-bold text-saffron-700 overflow-hidden">
                  {need.charity.logo ? <img src={need.charity.logo} className="w-full h-full object-cover" /> : need.charity.name?.charAt(0)}
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-saffron-600 transition-colors">{need.charity.name}</span>
                {need.charity.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
              </Link>
            )}
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">About this need</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-[15px]">{need.description}</p>
          </div>

          {/* Beneficiaries */}
          {need.beneficiaryDescription && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-900 text-sm mb-1.5 flex items-center gap-2">
                <Users className="w-4 h-4" /> Who benefits?
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">{need.beneficiaryDescription}</p>
              {need.beneficiaryCount > 0 && (
                <p className="text-sm font-bold text-blue-700 mt-1.5">{need.beneficiaryCount} people will benefit</p>
              )}
            </div>
          )}

          {/* Tags */}
          {need.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {need.tags.map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 bg-secondary text-muted-foreground text-xs rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
            {need.charity?.location?.city && (
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {need.charity.location.city}</span>
            )}
            {need.deadline && (
              <span className={`flex items-center gap-1.5 ${need.daysRemaining <= 3 ? "text-red-500 font-semibold" : ""}`}>
                <Clock className="w-4 h-4" />
                {need.daysRemaining === 0 ? "Ends today" : `${need.daysRemaining} days left`}
              </span>
            )}
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {need.donorCount || 0} donors</span>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors ml-auto">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="font-display font-bold text-2xl text-foreground">{formatCurrency(need.raisedAmount)}</span>
                  <span className="text-muted-foreground text-sm ml-1.5">raised</span>
                </div>
                <span className="text-sm text-muted-foreground">of {formatCurrency(need.targetAmount)}</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div className="progress-bar-fill h-full" initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                <span>{Math.round(progress)}% funded</span>
                <span>{need.donorCount || 0} donors</span>
              </div>
            </div>

            {/* Donate button */}
            {need.status === "approved" ? (
              isAuthenticated ? (
                <Link to={`/donate/${need._id}`}
                  onClick={() => recommendAPI.trackInteraction({ category: need.category, charityId: need.charity?._id, action: "click" }).catch(() => {})}
                  className="block w-full py-3.5 bg-saffron-500 hover:bg-saffron-600 text-white font-bold rounded-xl text-center transition-all shadow-btn-primary hover:shadow-none text-base">
                  Donate Now
                </Link>
              ) : (
                <Link to="/login" state={{ from: { pathname: `/needs/${id}` } }}
                  className="block w-full py-3.5 bg-saffron-500 hover:bg-saffron-600 text-white font-bold rounded-xl text-center transition-all shadow-btn-primary text-base">
                  Sign in to Donate
                </Link>
              )
            ) : (
              <div className="w-full py-3.5 bg-secondary text-muted-foreground font-bold rounded-xl text-center capitalize">
                {need.status === "completed" ? "✅ Need Fulfilled" : need.status}
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground mt-3">🔒 Secure · Verified · 80G eligible</p>

            {/* Quick amounts */}
            {need.status === "approved" && isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Quick donate:</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[100, 500, 1000].map(amt => (
                    <Link key={amt} to={`/donate/${need._id}?amount=${amt}`}
                      className="py-2 text-center text-xs font-semibold bg-secondary hover:bg-saffron-50 hover:text-saffron-700 rounded-lg border border-border hover:border-saffron-200 transition-all">
                      ₹{amt}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {need.charity && (
              <Link to={`/charities/${need.charity._id}`}
                className="block text-center text-xs text-saffron-600 hover:underline mt-3">
                View {need.charity.name} profile →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
