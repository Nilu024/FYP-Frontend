import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Sparkles, ShieldCheck, Bell, Search, ChevronRight, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { needsAPI, charityAPI } from "../services/api";
import NeedCard from "../components/charity/NeedCard";
import CharityCard from "../components/charity/CharityCard";
import { getCategoryIcon } from "../lib/utils";
import { useAuthStore } from "../store/authStore";

const CATEGORIES = [
  "Education","Healthcare","Poverty","Environment","Animal Welfare",
  "Disaster Relief","Women Empowerment","Child Welfare","Elderly Care",
  "Disability Support","Water & Sanitation","Food Security",
];

const HOW_IT_WORKS = [
  { step: "1", icon: "📍", title: "Set Your Location", desc: "Tell us where you are so we can find causes in your neighbourhood." },
  { step: "2", icon: "🧠", title: "AI Matches for You", desc: "Our KNN algorithm finds the most relevant needs based on your location and interests." },
  { step: "3", icon: "🔔", title: "Get Notified", desc: "Receive instant email and push alerts when urgent causes appear near you." },
  { step: "4", icon: "💛", title: "Donate & Impact", desc: "Give directly to verified causes. Track progress and see your impact in real time." },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25,0.46,0.45,0.94] } } },
};

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [urgentNeeds, setUrgentNeeds] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      needsAPI.getAll({ urgency: "critical", limit: 6 }),
      charityAPI.getAll({ limit: 4 }),
    ]).then(([n, c]) => {
      setUrgentNeeds(n.data.data || []);
      setCharities(c.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-in">
      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-saffron-50/60 to-background pt-14 pb-20">
        {/* Soft blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-saffron-200/25 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Pill */}
              <div className="inline-flex items-center gap-2 bg-saffron-100 text-saffron-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-saffron-200/80">
                <MapPin className="w-3.5 h-3.5" /> KNN-powered local cause discovery
              </div>

              <h1 className="font-display font-extrabold text-5xl sm:text-6xl text-foreground leading-[1.08] tracking-tight mb-5">
                Give where it<br />
                <span className="text-saffron-500">matters most.</span>
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto">
                AADHAR connects you to verified charities right in your neighbourhood — matched by AI to your location and interests, with real-time alerts.
              </p>

              {/* Search */}
              <div className="flex gap-2 max-w-lg mx-auto mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text" placeholder="Search causes, charities…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && search && (window.location.href = `/needs?search=${search}`)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
                  />
                </div>
                <Link to={search ? `/needs?search=${encodeURIComponent(search)}` : "/needs"}
                  className="px-5 py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold rounded-xl transition-colors shadow-btn-primary hover:shadow-none flex items-center gap-2 shrink-0">
                  Browse <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {!isAuthenticated && (
                <div className="flex items-center justify-center gap-3">
                  <Link to="/register" className="px-6 py-2.5 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-colors text-sm">
                    Join Free
                  </Link>
                  <Link to="/login" className="px-6 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition-colors text-sm">
                    Sign In
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────── */}
      <section className="border-y border-border bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            {[
              { icon: ShieldCheck, text: "Verified charities only" },
              { icon: MapPin, text: "KNN location matching" },
              { icon: Bell, text: "Real-time email & push alerts" },
              { icon: Sparkles, text: "AI-personalised feed" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-saffron-500" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────── */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground">Browse by Cause</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Find what matters most to you</p>
          </div>
          <Link to="/needs" className="text-sm text-saffron-600 font-semibold hover:underline flex items-center gap-1">
            All causes <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Link key={cat} to={`/needs?category=${encodeURIComponent(cat)}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-full text-sm text-muted-foreground hover:border-saffron-300 hover:text-saffron-700 hover:bg-saffron-50 transition-all duration-200 shadow-card hover:shadow-card-hover">
              <span>{getCategoryIcon(cat)}</span> {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* ── URGENT NEEDS ───────────────────────────────── */}
      <section className="container mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              Urgent Needs
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">Critical causes that need help right now</p>
          </div>
          <Link to="/needs?urgency=critical" className="text-sm text-saffron-600 font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 skeleton" />)}
          </div>
        ) : urgentNeeds.length > 0 ? (
          <motion.div variants={stagger.container} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentNeeds.map((need, i) => (
              <motion.div key={need._id} variants={stagger.item}>
                <NeedCard need={need} index={i} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
            No urgent needs right now — check back soon.
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="bg-saffron-50/50 border-y border-saffron-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-foreground">How AADHAR works</h2>
            <p className="text-muted-foreground mt-2 text-base">Simple, transparent, and impactful — in 4 steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-card text-center relative">
                <div className="w-12 h-12 rounded-2xl bg-saffron-100 flex items-center justify-center text-2xl mx-auto mb-4">
                  {icon}
                </div>
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-saffron-500/10 flex items-center justify-center text-xs font-bold text-saffron-600">
                  {step}
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP CHARITIES ──────────────────────────────── */}
      {charities.length > 0 && (
        <section className="container mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-foreground">Top Charities</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Verified organisations making real change</p>
            </div>
            <Link to="/charities" className="text-sm text-saffron-600 font-semibold hover:underline flex items-center gap-1">
              All charities <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {charities.map((c, i) => <CharityCard key={c._id} charity={c} index={i} />)}
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-14">
        <div className="bg-gradient-to-br from-saffron-500 to-saffron-600 rounded-3xl p-10 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-white rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <Heart className="w-10 h-10 fill-white/40 text-white/40 mx-auto mb-4 animate-float" />
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3">Ready to make a difference?</h2>
            <p className="text-white/80 text-base mb-8 max-w-md mx-auto">
              Join thousands of donors who use AADHAR to find and support causes in their own communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={isAuthenticated ? "/dashboard" : "/register"}
                className="px-8 py-3 bg-white text-saffron-600 font-bold rounded-xl hover:bg-white/90 transition-colors shadow-md">
                {isAuthenticated ? "Go to Dashboard" : "Start Giving Today"}
              </Link>
              <Link to="/needs" className="px-8 py-3 border-2 border-white/50 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                Browse All Causes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
