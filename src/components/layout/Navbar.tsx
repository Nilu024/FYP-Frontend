import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Bell, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, ListChecks, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useNotifStore } from "../../store/notifStore";
import NotificationPanel from "../notifications/NotificationPanel";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotifStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const getDashLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "charity") return "/charity/dashboard";
    return "/dashboard";
  };

  const roleLinks = user?.role === "admin"
    ? [{ to: "/admin/charities", label: "Charities", icon: Building2 }, { to: "/admin/needs", label: "Needs", icon: ListChecks }]
    : user?.role === "charity"
    ? [{ to: "/charity/needs", label: "My Needs", icon: ListChecks }]
    : [];

  const navLinks = [
    { to: "/needs", label: "Browse Causes" },
    { to: "/charities", label: "Charities" },
  ];

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-card/95 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border))]" : "bg-card/80 backdrop-blur-md"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center shadow-sm group-hover:shadow-glow transition-all duration-300">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="text-foreground tracking-tight">AADHAR</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? "bg-saffron-50 text-saffron-600 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to={getDashLink()}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(getDashLink())
                    ? "bg-saffron-50 text-saffron-600 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button onClick={() => { setNotifOpen(v => !v); setUserOpen(false); }}
                    className="relative w-9 h-9 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center">
                    <Bell className="w-4.5 h-4.5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-[380px] z-50 shadow-xl">
                        <NotificationPanel onClose={() => setNotifOpen(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User menu */}
                <div className="relative">
                  <button onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-secondary transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[90px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                        {/* Profile header */}
                        <div className="px-4 py-3 border-b border-border bg-secondary/50">
                          <p className="font-semibold text-sm text-foreground truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                          <span className="mt-1.5 inline-block px-2 py-0.5 bg-saffron-100 text-saffron-700 text-xs rounded-full capitalize font-semibold">
                            {user?.role}
                          </span>
                        </div>
                        {/* Links */}
                        <div className="p-1.5 space-y-0.5">
                          <Link to={getDashLink()} onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition-colors text-foreground">
                            <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
                          </Link>
                          {roleLinks.map(({ to, label, icon: Icon }) => (
                            <Link key={to} to={to} onClick={() => setUserOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition-colors text-foreground">
                              <Icon className="w-4 h-4 text-muted-foreground" /> {label}
                            </Link>
                          ))}
                          <Link to="/profile" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-secondary transition-colors text-foreground">
                            <User className="w-4 h-4 text-muted-foreground" /> Profile
                          </Link>
                          <div className="border-t border-border my-1" />
                          <button onClick={() => { logout(); navigate("/"); setUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-semibold rounded-xl transition-all shadow-btn-primary hover:shadow-none">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center ml-1">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border">
              <div className="py-3 space-y-1">
                {navLinks.map(({ to, label }) => (
                  <Link key={to} to={to}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(to) ? "bg-saffron-50 text-saffron-600" : "hover:bg-secondary text-foreground"}`}>
                    {label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link to={getDashLink()}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary text-foreground transition-colors">
                    Dashboard
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary text-foreground transition-colors">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click-away overlay */}
      {(notifOpen || userOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setNotifOpen(false); setUserOpen(false); }} />
      )}
    </header>
  );
}
