import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { charityAPI } from "../services/api";
import CharityCard from "../components/charity/CharityCard";
import { getCategoryIcon } from "../lib/utils";

const CATEGORIES = ["Education","Healthcare","Poverty","Environment","Animal Welfare","Disaster Relief","Women Empowerment","Child Welfare","Elderly Care","Disability Support","Water & Sanitation","Food Security"];

export default function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { loadCharities(); }, [category, page]);

  const loadCharities = async () => {
    setLoading(true);
    try {
      const res = await charityAPI.getAll({ category, search, page, limit: 12 });
      setCharities(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { setCharities([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground">Charities</h1>
        <p className="text-muted-foreground mt-1">{total} verified organisations</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search charities..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadCharities()}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => { setCategory(""); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs border transition-all ${!category ? "bg-saffron-500 text-white border-saffron-500" : "bg-card border-border hover:border-saffron-300"}`}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => { setCategory(cat === category ? "" : cat); setPage(1); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${category === cat ? "bg-saffron-500 text-white border-saffron-500" : "bg-card border-border hover:border-saffron-300"}`}>
            {getCategoryIcon(cat)} {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : charities.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏛</div>
          <h3 className="font-display font-semibold text-xl mb-2">No charities found</h3>
          <button onClick={() => { setCategory(""); setSearch(""); }} className="text-saffron-600 hover:underline text-sm">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {charities.map((c, i) => <CharityCard key={c._id} charity={c} index={i} />)}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors">Previous</button>
            <span className="px-4 py-2 text-sm text-muted-foreground">Page {page}</span>
            <button disabled={charities.length < 12} onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-40 hover:bg-accent transition-colors">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
