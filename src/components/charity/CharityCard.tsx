import { Link } from "react-router-dom";
import { MapPin, Users, Star, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { truncate, getCategoryIcon } from "../../lib/utils";

export default function CharityCard({ charity, index = 0 }: { charity: any; index?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}>
      <Link to={`/charities/${charity._id}`} className="block group">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-250 group-hover:-translate-y-0.5">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-br from-saffron-50 to-emerald-50 relative overflow-hidden">
            {charity.banner
              ? <img src={charity.banner} className="w-full h-full object-cover" />
              : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-15">{getCategoryIcon(charity.categories?.[0])}</div>
            }
            {charity.isVerified && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                <CheckCircle className="w-2.5 h-2.5" /> Verified
              </div>
            )}
            {/* Logo */}
            <div className="absolute -bottom-4 left-4 w-10 h-10 rounded-xl bg-card border-2 border-border shadow-sm flex items-center justify-center text-base font-bold text-saffron-600 overflow-hidden">
              {charity.logo ? <img src={charity.logo} className="w-full h-full object-cover" /> : charity.name?.charAt(0)}
            </div>
          </div>

          <div className="px-4 pt-7 pb-4">
            <h3 className="font-display font-bold text-foreground text-sm leading-snug group-hover:text-saffron-600 transition-colors truncate">
              {charity.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {truncate(charity.description || "", 80)}
            </p>
            {/* Category chips */}
            <div className="flex flex-wrap gap-1 mt-2.5">
              {charity.categories?.slice(0, 2).map((cat: string) => (
                <span key={cat} className="text-[10px] px-2 py-0.5 bg-saffron-50 text-saffron-700 rounded-full border border-saffron-100 font-medium">
                  {getCategoryIcon(cat)} {cat}
                </span>
              ))}
            </div>
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              {charity.location?.city && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {charity.location.city}</span>
              )}
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {charity.followerCount || 0}</span>
              {charity.rating > 0 && (
                <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-400" /> {charity.rating.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
