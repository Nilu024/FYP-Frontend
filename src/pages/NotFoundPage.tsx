import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="font-display font-bold text-[10rem] leading-none text-muted/30 select-none">404</div>
        <h1 className="font-display font-bold text-3xl text-foreground -mt-4 mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Looks like this cause has already been fulfilled — or never existed. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
          <Link to="/" className="flex items-center gap-2 px-5 py-3 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
