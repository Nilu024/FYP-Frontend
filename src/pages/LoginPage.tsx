import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.error || "Invalid email or password";

      if (message === "Please verify your email first") {
        toast.error(message);
        navigate("/verify-email", {
          state: { email: form.email },
        });
        return;
      }

      toast.error(message);
    }
  };

  return (
    <div>
      <h2 className="font-display font-bold text-3xl text-foreground mb-1">
        Welcome back
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Sign in to your AADHAR account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Email address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-sm font-semibold text-foreground">
              Password
            </label>
            <a
              href="#"
              className="text-xs text-saffron-600 hover:underline font-medium"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-none flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 p-4 bg-secondary rounded-xl border border-border">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Demo accounts
        </p>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {[
            {
              role: "Admin",
              emoji: "🔑",
              email: "admin@aadhar.org",
              pass: "Admin@123",
            },
            // { role: "Donor", emoji: "❤️", email: "donor@test.com", pass: "donor123" },
            // { role: "Charity", emoji: "🏛", email: "charity@test.com", pass: "charity123" },
          ].map(({ role, emoji, email, pass }) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm({ email, password: pass })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card transition-colors text-left"
            >
              <span>{emoji}</span>
              <span className="font-medium text-foreground">{role}:</span>
              <span>{email}</span>
              <span className="ml-auto text-muted-foreground/60">
                click to fill
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-saffron-600 font-semibold hover:underline"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
