import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { needsAPI } from "../services/api";
import NeedCard from "../components/charity/NeedCard";
import { getCategoryIcon } from "../lib/utils";

const CATEGORIES = ["Education","Healthcare","Poverty","Environment","Animal Welfare","Disaster Relief","Women Empowerment","Child Welfare","Elderly Care","Disability Support","Water & Sanitation","Food Security","Rural Development"];
const URGENCIES = [
  { value: "critical", label: "🚨 Critical", color: "border-red-300 text-red-700 bg-red-50" },
  { value: "high",     label: "⚡ High",     color: "border-orange-300 text-orange-700 bg-orange-50" },
  { value: "medium",   label: "Medium",      color: "" },
  { value: "low",      label: "Low",         color: "" },
];

export default function NeedsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const category = searchParams.get("category") || "";
  const urgency  = searchParams.get("urgency")  || "";
  const search   = searchParams.get("search")   || "";
  const totalPages = Math.max(1, Math.ceil(total / 12));

  useEffect(() => { loadNeeds(); }, [category, urgency, search, page]);

  const loadNeeds = async () => {
    setLoading(true);
    try {
      const r = await needsAPI.getAll({ category, urgency, search, page, limit: 12 });
      setNeeds(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { setNeeds([]); }
    finally { setLoading(false); }
  };

  const setFilter = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    setSearchParams(p);
    setPage(1);
  };

  const clearAll = () => { setSearchParams({}); setSearchInput(""); setPage(1); };
  const hasFilters = category || urgency || search;

  const submitSearch = () => {
    const p = new URLSearchParams(searchParams);
    if (searchInput) p.set("search", searchInput); else p.delete("search");
    setSearchParams(p);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 page-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground">Browse Causes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {loading ? "Loading…" : `${total} active causes looking for support`}
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search needs, keywords…"
            value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitSearch()}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
          />
        </div>
        <button onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${showFilters || hasFilters ? "bg-saffron-50 border-saffron-300 text-saffron-700" : "bg-card border-border hover:bg-secondary"}`}>
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-2 h-2 bg-saffron-500 rounded-full" />}
        </button>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors bg-card">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-5 shadow-card">
          <div className="mb-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilter("category", category === cat ? "" : cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border font-medium transition-all ${category === cat ? "bg-saffron-500 text-white border-saffron-500" : "bg-background border-border hover:border-saffron-300 text-muted-foreground hover:text-foreground"}`}>
                  {getCategoryIcon(cat)} {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Urgency</p>
            <div className="flex flex-wrap gap-2">
              {URGENCIES.map(u => (
                <button key={u.value} onClick={() => setFilter("urgency", urgency === u.value ? "" : u.value)}
                  className={`px-4 py-1.5 rounded-full text-xs border font-semibold transition-all ${urgency === u.value ? "bg-saffron-500 text-white border-saffron-500" : `bg-background border-border hover:border-saffron-300 ${u.color || "text-muted-foreground"}`}`}>
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {category && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-saffron-100 text-saffron-700 text-xs rounded-full font-semibold">
              {getCategoryIcon(category)} {category}
              <button onClick={() => setFilter("category", "")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {urgency && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold capitalize">
              ⚡ {urgency}
              <button onClick={() => setFilter("urgency", "")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {search && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground text-xs rounded-full font-semibold">
              🔍 "{search}"
              <button onClick={() => { setFilter("search", ""); setSearchInput(""); }}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <div key={i} className="h-64 skeleton" />)}
        </div>
      ) : needs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display font-semibold text-xl text-foreground mb-2">No causes found</h3>
          <p className="text-muted-foreground text-sm mb-4">Try different keywords or remove filters</p>
          <button onClick={clearAll} className="text-saffron-600 text-sm font-semibold hover:underline">Clear all filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {needs.map((n, i) => <NeedCard key={n._id} need={n} index={i} />)}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-secondary transition-colors">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${pg === page ? "bg-saffron-500 text-white" : "hover:bg-secondary text-muted-foreground"}`}>
                      {pg}
                    </button>
                  );
                })}
              </div>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-secondary transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
