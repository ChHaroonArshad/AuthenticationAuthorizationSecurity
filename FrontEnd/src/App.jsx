import { BrowserRouter, Routes, Route } from "react-router-dom";

import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import OAuthCallback from "./pages/OAuthCallback";
import SelectRole from "./pages/SelectRole";
import Posts from "./pages/Posts";
import AdminPermissions from "./pages/AdminPermissions";
import BuyerArtworks from "./pages/BuyerArtworks";
import SellerArtworks from "./pages/SellerArtworks";
import AdminArtworks from "./pages/AdminArtworks";
import UploadArtwork from "./pages/UploadArtwork";

import ProtectedRoutes from "./components/ProtectedRoutes";
import PublicRoutes from "./components/PublicRoutes";
import RoleBasedRoute from "./components/RoleBasedRoute";

import Chat from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>


        <Route element={<ProtectedRoutes />}>
          <Route path="/buyer/chat" element={<Chat />} />
          <Route path="/seller/chat" element={<Chat />} />
          <Route path="/admin/chat" element={<Chat />} />
        </Route>
        {/* ── LANDING ─────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── PUBLIC (logged-in users redirected away) */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* ── OPEN (anyone) ───────────────────────── */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* ── HOME redirect hub ───────────────────── */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* ── DASHBOARDS ──────────────────────────── */}
        <Route element={<RoleBasedRoute allowedRoles={["buyer", "seller", "admin"]} />}>
          <Route path="/buyer/dashboard" element={<Dashboard />} />
          <Route path="/seller/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Route>

        {/* ── POSTS ───────────────────────────────── */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/buyer/posts" element={<Posts />} />
          <Route path="/seller/posts" element={<Posts />} />
          <Route path="/admin/posts" element={<Posts />} />
        </Route>

        {/* ── ARTWORKS — browse (all logged-in) ───── */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/buyer/artworks" element={<BuyerArtworks />} />
        </Route>

        {/* ── ARTWORKS — seller manages own ───────── */}
        <Route element={<RoleBasedRoute allowedRoles={["seller"]} />}>
          <Route path="/seller/artworks" element={<SellerArtworks />} />
          <Route path="/seller/artworks/upload" element={<UploadArtwork />} />
          <Route path="/seller/artworks/edit/:id" element={<UploadArtwork />} />
        </Route>

        {/* ── ARTWORKS — admin manages all ────────── */}
        <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/artworks" element={<AdminArtworks />} />
          <Route path="/admin/artworks/upload" element={<UploadArtwork />} />
          <Route path="/admin/artworks/edit/:id" element={<UploadArtwork />} />
          <Route path="/admin/permissions" element={<AdminPermissions />} />
        </Route>

        {/* ── UNAUTHORIZED ─────────────────────────── */}
        <Route path="/unauthorized" element={
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0d0d0d", color: "white", fontFamily: "Inter, sans-serif", gap: "16px" }}>
            <h1 style={{ fontSize: "64px", margin: 0, color: "#d7ff5f" }}>403</h1>
            <p style={{ color: "#888", margin: 0 }}>You don't have permission to access this page.</p>
            <button
              onClick={() => window.location.href = "/home"}
              style={{ marginTop: "8px", padding: "12px 24px", background: "#d7ff5f", color: "#171717", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
            >
              Go back home
            </button>
          </div>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;