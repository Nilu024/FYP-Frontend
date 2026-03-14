import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Globe, Phone, Mail, Users, Star, CheckCircle, Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { charityAPI } from "../services/api";
import NeedCard from "../components/charity/NeedCard";
import { formatCurrency, getCategoryIcon } from "../lib/utils";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { recommendAPI } from "../services/api";

export default function CharityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [charity, setCharity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => { loadCharity(); }, [id]);

  const loadCharity = async () => {
    try {
      const res = await charityAPI.getOne(id!);
      setCharity(res.data.data);
      setFollowerCount(res.data.data.followerCount || 0);
    } catch { navigate("/charities"); }
    finally { setLoading(false); }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) return navigate("/login");
    try {
      const res = await charityAPI.toggleFollow(id!);
      setFollowing(res.data.isFollowing);
      setFollowerCount(res.data.followerCount);
      await recommendAPI.trackInteraction({ category: charity.categories?.[0], charityId: id, action: "follow" }).catch(() => {});
      toast.success(res.data.isFollowing ? "Following! You'll get alerts for new needs." : "Unfollowed");
    } catch { toast.error("Failed to update follow status"); }
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center"><div className="w-8 h-8 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  if (!charity) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      {/* Hero banner */}
      <div className="relative h-48 bg-gradient-to-br from-saffron-100 to-emerald-100 rounded-2xl overflow-hidden mb-6">
        {charity.banner && <img src={charity.banner} className="w-full h-full object-cover" />}
        {charity.isVerified && (
          <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Verified Charity
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border shadow flex items-center justify-center text-2xl font-bold text-saffron-600 overflow-hidden flex-shrink-0">
              {charity.logo ? <img src={charity.logo} className="w-full h-full object-cover" /> : charity.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl text-foreground">{charity.name}</h1>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {charity.categories?.map((cat: string) => (
                  <span key={cat} className="text-xs px-2.5 py-1 bg-saffron-50 text-saffron-700 rounded-full border border-saffron-100">
                    {getCategoryIcon(cat)} {cat}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={handleFollow}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all ${following ? "bg-red-50 border-red-200 text-red-600" : "bg-saffron-50 border-saffron-200 text-saffron-700 hover:bg-saffron-100"}`}>
              <Heart className={`w-4 h-4 ${following ? "fill-red-500 text-red-500" : ""}`} />
              {following ? "Unfollow" : "Follow"}
            </button>
          </div>

          <p className="text-muted-foreground leading-relaxed">{charity.description}</p>

          {/* Active needs */}
          {charity.needs?.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-4">Active Needs</h2>
              <div className="space-y-4">
                {charity.needs.filter((n: any) => n.status === "approved").slice(0, 4).map((need: any, i: number) => (
                  <NeedCard key={need._id} need={{ ...need, charity }} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-sm text-foreground mb-4">Charity Info</h3>
            <div className="space-y-3 text-sm">
              {charity.location?.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{[charity.location.city, charity.location.state].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {charity.contact?.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href={`mailto:${charity.contact.email}`} className="hover:text-saffron-600 truncate">{charity.contact.email}</a>
                </div>
              )}
              {charity.contact?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{charity.contact.phone}</span>
                </div>
              )}
              {charity.contact?.website && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <a href={charity.contact.website} target="_blank" className="hover:text-saffron-600 truncate">{charity.contact.website}</a>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-sm text-foreground mb-4">Impact</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: "Followers", value: followerCount },
                { icon: Heart, label: "Total Raised", value: formatCurrency(charity.totalRaised || 0) },
                { icon: Star, label: "Rating", value: charity.rating?.toFixed(1) || "N/A" },
                { icon: CheckCircle, label: "Donors", value: charity.totalDonors || 0 },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-accent/50 rounded-xl p-3 text-center">
                  <Icon className="w-4 h-4 text-saffron-500 mx-auto mb-1" />
                  <div className="font-bold text-foreground text-sm">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
