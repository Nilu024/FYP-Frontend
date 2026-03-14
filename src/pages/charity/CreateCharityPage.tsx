import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, Building } from "lucide-react";
import { charityAPI } from "../../services/api";
import { getCategoryIcon } from "../../lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Education","Healthcare","Poverty","Environment","Animal Welfare",
  "Disaster Relief","Women Empowerment","Child Welfare","Elderly Care",
  "Disability Support","Arts & Culture","Sports","Water & Sanitation",
  "Food Security","Rural Development",
];

export default function CreateCharityPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", categories: [] as string[],
    address: "", city: "", state: "", pincode: "",
    email: "", phone: "", website: "",
    registrationNumber: "",
    lat: "", lng: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const toggleCat = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleGeoLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        toast.success("Location captured!");
      },
      () => toast.error("Could not access location")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.categories.length === 0) return toast.error("Select at least one category");
    if (!form.city) return toast.error("City is required");

    setLoading(true);
    try {
      await charityAPI.create({
        name: form.name,
        description: form.description,
        categories: form.categories,
        location: {
          coordinates: [
            parseFloat(form.lng) || 0,
            parseFloat(form.lat) || 0,
          ],
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        contact: {
          email: form.email,
          phone: form.phone,
          website: form.website,
        },
        registrationNumber: form.registrationNumber,
      });
      toast.success("Charity profile submitted for admin review 🎉");
      navigate("/charity/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create charity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-saffron-100 flex items-center justify-center">
          <Building className="w-6 h-6 text-saffron-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">Register Your Charity</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Submit your organisation details for admin verification
          </p>
        </div>
      </div>

      <div className="bg-saffron-50 border border-saffron-200 rounded-2xl p-4 mb-6">
        <p className="text-sm text-saffron-800">
          <strong>How it works:</strong> Submit your charity profile → Admin reviews and verifies →
          You can then list needs that appear in the donor feed and trigger push notifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Organisation Details</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Organisation Name <span className="text-red-500">*</span>
            </label>
            <input required value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="e.g. Shiksha Foundation"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea required rows={4} value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Describe your organisation's mission, who you help, and what you do..."
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Registration Number <span className="text-muted-foreground font-normal">(80G / 12A / FCRA)</span>
            </label>
            <input value={form.registrationNumber} onChange={e => set("registrationNumber", e.target.value)}
              placeholder="e.g. MH/2020/0012345"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-1">
            Cause Categories <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Select all that apply</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => toggleCat(cat)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-all ${
                  form.categories.includes(cat)
                    ? "bg-saffron-500 text-white border-saffron-500"
                    : "bg-background border-border hover:border-saffron-200 text-muted-foreground"
                }`}>
                <span className="text-base">{getCategoryIcon(cat)}</span>
                <span className="text-center leading-tight">{cat}</span>
              </button>
            ))}
          </div>
          {form.categories.length > 0 && (
            <p className="text-xs text-saffron-600 mt-3 font-medium">
              Selected: {form.categories.join(", ")}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Location</h2>
            <button type="button" onClick={handleGeoLocate}
              className="flex items-center gap-1.5 text-xs text-saffron-600 hover:underline">
              <MapPin className="w-3.5 h-3.5" /> Auto-detect
            </button>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Used by KNN to show your needs to donors in the area
          </p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Street Address</label>
            <input value={form.address} onChange={e => set("address", e.target.value)}
              placeholder="e.g. 101 Dharavi Road, Near Station"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input required value={form.city} onChange={e => set("city", e.target.value)}
                placeholder="Mumbai"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">State</label>
              <input value={form.state} onChange={e => set("state", e.target.value)}
                placeholder="Maharashtra"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pincode</label>
              <input value={form.pincode} onChange={e => set("pincode", e.target.value)}
                placeholder="400017"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Latitude</label>
              <input value={form.lat} onChange={e => set("lat", e.target.value)}
                placeholder="19.0760"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Longitude</label>
              <input value={form.lng} onChange={e => set("lng", e.target.value)}
                placeholder="72.8777"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Contact Information</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="info@yourcharity.org"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
              <input value={form.website} onChange={e => set("website", e.target.value)}
                placeholder="https://yourcharity.org"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            : "Submit for Verification"
          }
        </button>
        <p className="text-xs text-center text-muted-foreground">
          After submission, an admin will review and verify your charity — usually within 24 hours.
        </p>
      </form>
    </div>
  );
}
