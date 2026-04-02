import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email;
  const isFromLogin = (location.state as any)?.isFromLogin;
  const isFromRegistration = (location.state as any)?.isFromRegistration;
  const { verifyEmail, resendVerification, isLoading } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-4">Please register or login first.</p>
          <button
            onClick={() => navigate("/register")}
            className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      await verifyEmail(email, otp);
      toast.success("Email verified successfully!");
      
      if (isFromLogin) {
        navigate("/dashboard", { replace: true });
      } else if (isFromRegistration) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Verification failed";
      toast.error(message);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification(email);
      toast.success("Verification code resent to your email!");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to resend code";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-saffron-600 hover:text-saffron-700 font-medium mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>

        <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-saffron-100 dark:bg-saffron-900/20 p-4 rounded-full">
              <Mail className="w-8 h-8 text-saffron-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            Verify Your Email
          </h1>

          {/* Description */}
          <p className="text-center text-muted-foreground text-sm mb-6">
            We've sent a verification code to <strong>{email}</strong>
          </p>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-background border border-border rounded-xl text-foreground focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-400 transition-all font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-btn-primary hover:shadow-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-saffron-600 font-semibold hover:underline disabled:opacity-60"
              >
                {isResending ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
