import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl mb-3">
              <div className="w-8 h-8 rounded-xl bg-saffron-500 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-white text-white" />
              </div>
              AADHAR
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's smartest charity platform. KNN-powered AI connects donors with verified causes in their neighbourhood — in real time.
            </p>
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Email alerts + push notifications active
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[["Browse Causes", "/needs"], ["Charities", "/charities"], ["Dashboard", "/dashboard"], ["Donate", "/needs"]].map(([l, t]) => (
                <li key={l}><Link to={t} className="hover:text-foreground transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3">Info</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["How It Works", "KNN Algorithm", "Privacy Policy", "Terms of Service", "Contact"].map(i => (
                <li key={i}><a href="#" className="hover:text-foreground transition-colors">{i}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2024 AADHAR Charity Platform. Built with ❤️ for India.</p>
          <p className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">MERN</span> ·
            <span className="font-medium text-foreground">KNN</span> ·
            <span className="font-medium text-foreground">React</span> ·
            <span className="font-medium text-saffron-500">Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
