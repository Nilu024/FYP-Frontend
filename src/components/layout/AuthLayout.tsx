import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Heart } from "lucide-react";

const QUOTES = [
  { text: "No act of kindness, no matter how small, is ever wasted.", author: "Aesop" },
  { text: "We make a living by what we get, but we make a life by what we give.", author: "Winston Churchill" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
];
const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-saffron-500 via-saffron-500 to-saffron-600 text-white relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />

        <Link to="/" className="relative flex items-center gap-2.5 font-display font-bold text-2xl">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          AADHAR
        </Link>

        <div className="relative space-y-8">
          <div>
            <h1 className="font-display font-extrabold text-5xl leading-[1.1] mb-4">
              Connect.<br />Care.<br />Change.
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-xs">
              India's smartest charity platform — powered by AI to match you with causes that matter most, right in your neighbourhood.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[["30+", "Categories"], ["KNN", "Smart Match"], ["Real-time", "Alerts"]].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="font-display font-bold text-xl">{v}</div>
                <div className="text-white/65 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="border-l-2 border-white/30 pl-4">
            <p className="text-white/80 text-sm italic leading-relaxed">"{quote.text}"</p>
            <p className="text-white/50 text-xs mt-1.5">— {quote.author}</p>
          </div>
        </div>

        <p className="relative text-white/40 text-xs">© 2024 AADHAR. Built for India.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <div className="lg:hidden mb-8 flex items-center gap-2 font-display font-bold text-2xl">
          <div className="w-9 h-9 rounded-xl bg-saffron-500 flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 fill-white text-white" />
          </div>
          <span className="text-saffron-600">AADHAR</span>
        </div>
        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
