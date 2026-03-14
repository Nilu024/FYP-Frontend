import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { needsAPI, charityAPI } from "../../services/api";
import { getCategoryIcon } from "../../lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = ["Education","Healthcare","Poverty","Environment","Animal Welfare","Disaster Relief","Women Empowerment","Child Welfare","Elderly Care","Disability Support","Arts & Culture","Sports","Water & Sanitation","Food Security","Rural Development"];
const URGENCIES = [
  { value: "low", label: "Low", desc: "No immediate deadline" },
  { value: "medium", label: "Medium", desc: "Needed within a few months" },
  { value: "high", label: "High", desc: "Needed within weeks" },
  { value: "critical", label: "Critical 🚨", desc: "Immediate action required — sends push alerts" },
];

const emptyForm = {
  title: "", description: "", category: "", urgency: "medium",
  targetAmount: "", beneficiaryCount: "", beneficiaryDescription: "",
  deadline: "", tags: "",
};

export default function CreateNeedPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [charity, setCharity] = useState<any>(null);

  useEffect(() => {
    charityAPI.getMy().then(r => setCharity(r.data.data)).catch(() => {});
    if (isEdit) {
      needsAPI.getOne(id!).then(r => {
        const n = r.data.data;
        setForm({
          title: n.title || "", description: n.description || "",
          category: n.category || "", urgency: n.urgency || "medium",
          targetAmount: n.targetAmount?.toString() || "",
          beneficiaryCount: n.beneficiaryCount?.toString() || "",
          beneficiaryDescription: n.beneficiaryDescription || "",
          deadline: n.deadline ? n.deadline.split("T")[0] : "",
          tags: n.tags?.join(", ") || "",
        });
        setFetching(false);
      }).catch(() => { toast.error("Failed to load need"); navigate("/charity/needs"); });
    }
  }, [id]);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) return toast.error("Please select a category");
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!form.targetAmount || Number(form.targetAmount) < 100) return toast.error("Target amount must be at least ₹100");

    setLoading(true);
    const payload = {
      ...form,
      targetAmount: Number(form.targetAmount),
      beneficiaryCount: form.beneficiaryCount ? Number(form.beneficiaryCount) : undefined,
      deadline: form.deadline || undefined,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };

    try {
      if (isEdit) {
        await needsAPI.update(id!, payload);
        toast.success("Need updated! Pending admin review.");
      } else {
        await needsAPI.create(payload);
        toast.success("Need submitted for admin review 🎉");
      }
      navigate("/charity/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save need");
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="container mx-auto px-4 py-20 text-center"><div className="w-8 h-8 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  if (charity && !charity.isVerified) return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center">
      <div className="text-5xl mb-4">⏳</div>
      <h2 className="font-display font-bold text-2xl mb-2">Awaiting Verification</h2>
      <p className="text-muted-foreground">Your charity must be verified by an admin before you can list needs.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground">
          {isEdit ? "Edit Need" : "List a New Need"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEdit ? "Update your need details — it will be re-reviewed by admin." : "Describe what your charity needs. It will go live after admin approval."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => set("category", cat)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-all ${form.category === cat ? "bg-saffron-500 text-white border-saffron-500" : "bg-card border-border hover:border-saffron-200 text-muted-foreground"}`}>
                <span className="text-lg">{getCategoryIcon(cat)}</span>
                <span className="text-center leading-tight">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Need Title <span className="text-red-500">*</span>
          </label>
          <input type="text" required maxLength={120} value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Funds for 50 underprivileged students' school fees"
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
          />
          <p className="text-xs text-muted-foreground mt-1">{form.title.length}/120 characters</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea rows={5} required value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the need in detail — why is it needed, who will benefit, how funds will be used..."
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Urgency Level</label>
          <div className="grid grid-cols-2 gap-2">
            {URGENCIES.map(({ value, label, desc }) => (
              <button key={value} type="button" onClick={() => set("urgency", value)}
                className={`p-3 rounded-xl border text-left transition-all ${form.urgency === value ? "bg-saffron-50 border-saffron-400" : "bg-card border-border hover:border-saffron-200"}`}>
                <span className="text-sm font-semibold text-foreground block">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>
          {form.urgency === "critical" && (
            <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <Info className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Critical needs will trigger push notifications to nearby donors when approved.
              </p>
            </div>
          )}
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Target Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input type="number" required min="100" value={form.targetAmount}
              onChange={(e) => set("targetAmount", e.target.value)}
              placeholder="50000"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">No. of Beneficiaries</label>
            <input type="number" min="1" value={form.beneficiaryCount}
              onChange={(e) => set("beneficiaryCount", e.target.value)}
              placeholder="50"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Beneficiary description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Who will benefit?</label>
          <input type="text" value={form.beneficiaryDescription}
            onChange={(e) => set("beneficiaryDescription", e.target.value)}
            placeholder="e.g. 50 students from tribal villages in Pune district"
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
          />
        </div>

        {/* Deadline & Tags */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Deadline</label>
            <input type="date" value={form.deadline} min={new Date().toISOString().split("T")[0]}
              onChange={(e) => set("deadline", e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tags</label>
            <input type="text" value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="hunger, children, rural"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors flex items-center justify-center gap-2">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {isEdit ? "Updating..." : "Submitting..."}</>
          ) : (
            isEdit ? "Update Need" : "Submit for Review"
          )}
        </button>
        <p className="text-xs text-center text-muted-foreground">
          After submission, an admin will review and approve your listing before it goes live.
        </p>
      </form>
    </div>
  );
}
