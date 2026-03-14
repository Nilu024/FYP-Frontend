import { useEffect, useState, useRef } from "react";
import { MapPin, ChevronLeft, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import { recommendAPI } from "../../services/api";
import NeedCard from "../charity/NeedCard";
import { motion } from "framer-motion";

interface Props {
  title?: string;
  subtitle?: string;
  type?: "nearby" | "for-you" | "recommendations";
  maxDistanceKm?: number;
  k?: number;
}

export default function RecommendationCarousel({
  title = "Causes Near You",
  subtitle = "Powered by KNN location intelligence",
  type = "nearby",
  maxDistanceKm = 25,
  k = 8,
}: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [topCategory, setTopCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (type === "nearby") {
        res = await recommendAPI.getNearby({ maxDistanceKm, limit: k });
        setItems(res.data.data || []);
      } else if (type === "for-you") {
        res = await recommendAPI.getForYou({ k });
        setIsPersonalized(res.data.isPersonalized);
        setTopCategory(res.data.topCategory);
        setItems(res.data.data || []);
      } else {
        res = await recommendAPI.getRecommendations({ k, maxDistanceKm });
        setItems(res.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [type]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  const Icon = type === "nearby" ? MapPin : Sparkles;

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-saffron-100 animate-pulse" />
          <div>
            <div className="h-5 w-48 bg-muted rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[280px] h-64 bg-muted rounded-2xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
          <p className="text-orange-700 text-sm mb-3">{error}</p>
          <button onClick={fetchData} className="text-sm text-orange-600 hover:underline flex items-center gap-1 mx-auto">
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="py-8">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-display font-semibold text-foreground mb-1">
            {type === "for-you" && !isPersonalized
              ? "Start exploring to get personalized picks"
              : "No results nearby"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {type === "for-you"
              ? "Click on needs and donate to train your preference feed."
              : `No active causes found within ${maxDistanceKm}km. Try increasing the distance.`}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron-100 to-emerald-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-saffron-600" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
              {title}
              {type === "for-you" && topCategory && (
                <span className="text-xs font-normal bg-saffron-100 text-saffron-700 px-2 py-0.5 rounded-full">
                  Top: {topCategory}
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2 rounded-lg hover:bg-accent transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => scroll("left")} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => scroll("right")} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item: any, i: number) => {
          const need = item.need || item;
          const distanceKm = item.distanceKm;
          const score = item.score;
          return (
            <div key={need._id || i} className="min-w-[280px] max-w-[280px] flex-shrink-0">
              <NeedCard need={need} distanceKm={distanceKm} score={score} index={i} />
            </div>
          );
        })}
      </div>

      {/* KNN info badge */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        KNN algorithm · {items.length} results
        {type === "nearby" && ` · within ${maxDistanceKm}km`}
        {type === "for-you" && isPersonalized && " · personalised for you"}
      </div>
    </section>
  );
}
