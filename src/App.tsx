import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";

// Layout
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NeedsPage from "./pages/NeedsPage";
import NeedDetailPage from "./pages/NeedDetailPage";
import CharitiesPage from "./pages/CharitiesPage";
import CharityDetailPage from "./pages/CharityDetailPage";
import DonationPage from "./pages/DonationPage";
import ProfilePage from "./pages/ProfilePage";
import MyDonationsPage from "./pages/MyDonationsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCharities from "./pages/admin/AdminCharities";
import AdminNeeds from "./pages/admin/AdminNeeds";
import AdminUsers from "./pages/admin/AdminUsers";
import CharityDashboard from "./pages/charity/CharityDashboard";
import CharityNeedsPage from "./pages/charity/CharityNeedsPage";
import CreateNeedPage from "./pages/charity/CreateNeedPage";
import CreateCharityPage from "./pages/charity/CreateCharityPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
            fontFamily: "'DM Sans', sans-serif",
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="needs" element={<NeedsPage />} />
          <Route path="needs/:id" element={<NeedDetailPage />} />
          <Route path="charities" element={<CharitiesPage />} />
          <Route path="charities/:id" element={<CharityDetailPage />} />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Donor protected routes */}
        <Route element={<ProtectedRoute roles={["donor", "charity", "admin"]} />}>
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="donate/:needId" element={<DonationPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="my-donations" element={<MyDonationsPage />} />
          </Route>
        </Route>

        {/* Charity protected routes */}
        <Route element={<ProtectedRoute roles={["charity"]} />}>
          <Route path="/" element={<MainLayout />}>
            <Route path="charity/dashboard" element={<CharityDashboard />} />
            <Route path="charity/needs" element={<CharityNeedsPage />} />
            <Route path="charity/needs/create" element={<CreateNeedPage />} />
            <Route path="charity/needs/edit/:id" element={<CreateNeedPage />} />
            <Route path="charity/create" element={<CreateCharityPage />} />
          </Route>
        </Route>

        {/* Admin protected routes */}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<MainLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="charities" element={<AdminCharities />} />
            <Route path="needs" element={<AdminNeeds />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
