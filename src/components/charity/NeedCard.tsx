import { Link } from "react-router-dom";
import { MapPin, Clock, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatDistance, getCategoryIcon, truncate } from "../../lib/utils";

interface Props {
  need: any;
  distanceKm?: number;
  score?: number;
  index?: number;
}

const URGENCY_CONFIG: Record<string, { label: string; badge: string; banner: string }> = {
  critical: { label: "Critical", badge: "bg-red-100 text-red-700 border border-red-200", banner: "bg-red-500 text-white" },
  high:     { label: "High Priority", badge: "bg-orange-100 text-orange-700 border border-orange-200", banner: "bg-orange-100 text-orange-800 border-b border-orange-200" },
  medium:   { label: "Medium", badge: "bg-amber-100 text-amber-700 border border-amber-200", banner: "" },
  low:      { label: "Low", badge: "bg-blue-100 text-blue-700 border border-blue-200", banner: "" },
};

export default function NeedCard({ need, distanceKm, score, index = 0 }: Props) {
  const progress = need.targetAmount > 0 ? Math.min((need.raisedAmount / need.targetAmount) * 100, 100) : 0;
  const urgency = URGENCY_CONFIG[need.urgency] || URGENCY_CONFIG.medium;
  const isCritical = need.urgency === "critical";
  const isHigh = need.urgency === "high";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={`/needs/${need._id}`} className="block group">
        <div className={`bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-250 border border-border group-hover:-translate-y-0.5 ${isCritical ? "ring-2 ring-red-400/50" : ""}`}>

          {/* Urgency Banner — only for critical/high */}
          {(isCritical || isHigh) && (
            <div className={`px-4 py-2 flex items-center gap-2 text-xs font-semibold ${urgency.banner}`}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {isCritical ? "🚨 Urgent — Immediate Help Needed" : "⚡ High Priority"}
            </div>
          )}

          <div className="p-5">
            {/* Top row */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-saffron-50 flex items-center justify-center text-xl shrink-0">
                {getCategoryIcon(need.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">{need.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${urgency.badge}`}>
                    {urgency.label}
                  </span>
                </div>
                {need.charity?.name && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{need.charity.name}</p>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-foreground text-[15px] leading-snug mb-1.5 group-hover:text-saffron-600 transition-colors">
              {truncate(need.title, 72)}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
              {need.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-foreground">{formatCurrency(need.raisedAmount)}</span>
                <span className="text-muted-foreground">of {formatCurrency(need.targetAmount)}</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="progress-bar-fill h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, delay: index * 0.04 + 0.15, ease: "easeOut" }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{Math.round(progress)}% funded</p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {distanceKm !== undefined && (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <MapPin className="w-3 h-3" /> {formatDistance(distanceKm)}
                </span>
              )}
              {need.daysRemaining !== null && need.daysRemaining !== undefined && (
                <span className={`flex items-center gap-1 ${need.daysRemaining <= 3 ? "text-red-500 font-semibold" : ""}`}>
                  <Clock className="w-3 h-3" />
                  {need.daysRemaining === 0 ? "Ends today" : `${need.daysRemaining}d left`}
                </span>
              )}
              {need.donorCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {need.donorCount} donors
                </span>
              )}
              {score !== undefined && (
                <span className="flex items-center gap-1 text-saffron-500 font-semibold ml-auto">
                  <TrendingUp className="w-3 h-3" /> {Math.round(score * 100)}% match
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
