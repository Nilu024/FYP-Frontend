import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerification, isLoading } = useAuthStore();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return toast.error("Email is required");
    if (otp.length !== 6) return toast.error("Enter the 6-digit code");

    try {
      const user = await verifyEmail(email, otp);
      toast.success("Email verified successfully");
      navigate(user.role === "charity" ? "/charity/dashboard" : "/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Verification failed");
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error("Enter your email first");

    try {
      setIsResending(true);
      await resendVerification(email);
      toast.success("A new verification code has been sent");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Could not resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <h2 className="font-display font-bold text-3xl text-foreground mb-1">Verify Your Email</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Enter the 6-digit code sent to your email address
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Verification code</label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-center tracking-[0.5em] text-lg font-bold"
            placeholder="123456"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-3 border border-border bg-background hover:bg-secondary disabled:opacity-60 text-foreground font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Resending...
            </>
          ) : (
            "Resend Code"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link to="/register" className="text-saffron-600 font-semibold hover:underline">
          Register again
        </Link>
      </p>
    </div>
  );
}
