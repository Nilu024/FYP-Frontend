import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import { MapPin, Save, Loader2, Bell, BellOff, Mail, AlertCircle } from "lucide-react";
import { getCategoryIcon } from "../lib/utils";
import toast from "react-hot-toast";
import { registerPushNotifications, unregisterPushNotifications } from "../services/pushNotifications";

const CATEGORIES = ["Education","Healthcare","Poverty","Environment","Animal Welfare","Disaster Relief","Women Empowerment","Child Welfare","Elderly Care","Disability Support","Water & Sanitation","Food Security"];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    city: user?.location?.city || "",
    state: user?.location?.state || "",
    categories: user?.preferences?.categories || [] as string[],
    maxDistanceKm: user?.preferences?.maxDistanceKm || 50,
  });
  const [saving, setSaving] = useState(false);
  const [pushOn, setPushOn] = useState(false);

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: form.name,
        phone: form.phone,
        location: { city: form.city, state: form.state, address: form.city },
        preferences: { categories: form.categories, maxDistanceKm: form.maxDistanceKm },
      });
      updateUser(res.data.data);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handlePushToggle = async () => {
    if (pushOn) {
      await unregisterPushNotifications();
      setPushOn(false);
      toast.success("Push notifications disabled");
    } else {
      const ok = await registerPushNotifications();
      if (ok) { setPushOn(true); toast.success("Push notifications enabled!"); }
      else toast.error("Could not enable. Check browser permissions.");
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="font-display font-bold text-3xl text-foreground mb-8">Profile Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input value={user?.email || ""} disabled
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-muted-foreground cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Email Verification Alert */}
        {user && !user?.isVerified && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 flex items-start gap-4">
            <div className="flex-shrink-0 pt-0.5">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">Email Verification Required</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
                Please verify your email address to unlock all features and ensure you receive important notifications.
              </p>
              <button
                type="button"
                onClick={() => navigate('/verify-email', { state: { email: user.email, isFromLogin: true } })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Verify Email Now
              </button>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex justify-between mb-1.5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-saffron-500" /> Location
            </h2>
            <button type="button" onClick={handleGeoLocate} className="flex items-center gap-1 text-xs text-saffron-600 hover:underline font-medium">
              <MapPin className="w-3 h-3" /> Auto-detect
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Used by KNN to show nearby causes</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Mumbai"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">State</label>
              <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                placeholder="Maharashtra"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Max Distance for Recommendations: <span className="text-saffron-600">{form.maxDistanceKm}km</span>
            </label>
            <input type="range" min="5" max="100" step="5" value={form.maxDistanceKm}
              onChange={e => setForm(f => ({ ...f, maxDistanceKm: Number(e.target.value) }))}
              className="w-full accent-saffron-500" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5km</span><span>100km</span>
            </div>
          </div>
        </div>

        {/* Category preferences */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Cause Preferences</h2>
          <p className="text-xs text-muted-foreground">Select categories you care about — used by KNN to personalise your feed</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border transition-all ${form.categories.includes(cat) ? "bg-saffron-500 text-white border-saffron-500" : "bg-background border-border hover:border-saffron-200"}`}>
                {getCategoryIcon(cat)} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Push Notifications</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Receive alerts for urgent causes near you</p>
            </div>
            <button type="button" onClick={handlePushToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${pushOn ? "bg-red-50 border-red-200 text-red-600" : "bg-saffron-50 border-saffron-200 text-saffron-700"}`}>
              {pushOn ? <><BellOff className="w-4 h-4" /> Disable</> : <><Bell className="w-4 h-4" /> Enable</>}
            </button>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3.5 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
