import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, MapPin } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const ROLES = [
  { value: "donor", label: "I want to donate", icon: "❤️", desc: "Find and support causes near me" },
  { value: "charity", label: "I'm a charity", icon: "🏛", desc: "List our needs and receive donations" },
];

export default function RegisterPage() {
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [role, setRole] = useState("donor");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", state: "" });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      await register({ ...form, role, location: { city: form.city, state: form.state, address: form.city } });
      toast.success("Welcome to AADHAR! 🎉");
      navigate(role === "charity" ? "/charity/dashboard" : "/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

const handleGeoLocate = async () => {
  if (!navigator.geolocation) {
    toast.error("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
        const data = await response.json();
        
        const address = data.address || {};
        const city = address.city || address.town || address.village || address.county || "";
        const state = address.state || address.region || "";
        
        setForm(prev => ({ ...prev, city, state }));
        toast.success(`Location filled: ${city || "Unknown"}, ${state || "Unknown"}`);
      } catch (err) {
        toast.error("Could not fetch location details");
      }
    },
    (error) => {
      console.error("Geolocation error:", error);
      toast.error("Could not access location");
    }
  );
};

  return (
    <div>
      <h2 className="font-display font-bold text-3xl text-foreground mb-1">Join AADHAR</h2>
      <p className="text-muted-foreground text-sm mb-6">Create your free account and start making a difference</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role picker */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">I am…</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => setRole(r.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${role === r.value ? "border-saffron-500 bg-saffron-50" : "border-border hover:border-saffron-200"}`}>
                <span className="text-xl block mb-1">{r.icon}</span>
                <span className="text-sm font-bold text-foreground block leading-tight">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
          <input type="text" required placeholder="Priya Sharma" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
          <input type="email" required placeholder="you@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} required placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="block text-sm font-semibold text-foreground">
              Location <span className="font-normal text-muted-foreground">(for nearby causes)</span>
            </label>
            <button type="button" onClick={handleGeoLocate} className="flex items-center gap-1 text-xs text-saffron-600 hover:underline font-medium">
              <MapPin className="w-3 h-3" /> Auto-detect
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="City (e.g. Mumbai)" value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="px-3 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
            />
            <input type="text" placeholder="State (e.g. MH)" value={form.state}
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              className="px-3 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Used by our KNN algorithm to find causes near you</p>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-none flex items-center justify-center gap-2">
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-saffron-600 font-semibold hover:underline">Sign in</Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        By registering you agree to our Terms of Service.
      </p>
    </div>
  );
}
