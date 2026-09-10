import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const user = token ? jwtDecode(token) : {};
  const role = user.role || "buyer";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const navTo = (key, path) => {
    setActiveNav(key);
    if (path) navigate(path);
  };

  // ── Sidebar config per role ──────────────────────────
  const sidebarItems = {
    admin: [
      { key: "overview", icon: "▣", label: "Overview", path: null },
      { key: "artworks", icon: "🖼", label: "Artworks", path: "/admin/artworks" },
      { key: "posts", icon: "📝", label: "Posts", path: "/admin/posts" },
      { key: "users", icon: "👥", label: "Users", path: "/admin/permissions" },
      { key: "permissions", icon: "🔑", label: "Permissions", path: "/admin/permissions" },
      { key: "orders", icon: "📦", label: "Orders", path: null },
      { key: "payments", icon: "💳", label: "Payments", path: null },
      { key: "settings", icon: "⚙", label: "Settings", path: null },
      { key: "chat", icon: "💬", label: "Messages", path: "/buyer/chat" },
    ],
    seller: [
      { key: "overview", icon: "▣", label: "Overview", path: null },
      { key: "artworks", icon: "🖼", label: "My Artworks", path: "/seller/artworks" },
      { key: "upload", icon: "➕", label: "Upload Artwork", path: "/seller/artworks/upload" },
      { key: "posts", icon: "📝", label: "My Posts", path: "/seller/posts" },
      { key: "orders", icon: "📦", label: "Orders", path: null },
      { key: "analytics", icon: "📊", label: "Analytics", path: null },
      { key: "chat", icon: "💬", label: "Messages", path: "/seller/chat" },

    ],
    buyer: [
      { key: "overview", icon: "▣", label: "Overview", path: null },
      { key: "artworks", icon: "🖼", label: "Browse Art", path: "/buyer/artworks" },
      { key: "posts", icon: "📝", label: "Community", path: "/buyer/posts" },
      { key: "favourites", icon: "❤️", label: "Favourites", path: null },
      { key: "orders", icon: "📦", label: "My Orders", path: null },
      { key: "chat", icon: "💬", label: "Messages", path: "/buyer/chat" },
    ],
  };

  const items = sidebarItems[role] || sidebarItems.buyer;

  // ── Role colours ─────────────────────────────────────
  const roleConfig = {
    admin: { accent: "#d7ff5f", label: "⚡ Admin", bg: "#171717" },
    seller: { accent: "#a78bfa", label: "🎨 Seller", bg: "#2d1b69" },
    buyer: { accent: "#34d399", label: "🛍 Buyer", bg: "#064e3b" },
  };
  const rc = roleConfig[role];

  return (
    <div style={shell}>
      <style>{`
        * { box-sizing: border-box; }
        .nav-item { transition: all 0.15s ease; }
        .nav-item:hover { background: rgba(255,255,255,0.08) !important; }
        .nav-item.active { background: rgba(255,255,255,0.12) !important; }
        .action-card { transition: all 0.2s ease; cursor: pointer; }
        .action-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
        .stat-card { transition: all 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); }
        .top-btn { transition: all 0.15s; }
        .top-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .logout-btn:hover { background: #fee2e2 !important; color: #dc2626 !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
      `}</style>

      {/* ══════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════ */}
      <aside style={{
        ...sidebar,
        width: sidebarOpen ? "240px" : "64px",
        transition: "width 0.25s ease"
      }}>

        {/* Logo */}
        <div style={sidebarLogo}>
          <div style={{ ...logoMark, background: rc.accent }}>
            <span style={{ color: "#171717", fontWeight: 900, fontSize: "16px" }}>A</span>
          </div>
          {sidebarOpen && (
            <span style={{ color: "white", fontWeight: 800, fontSize: "17px", letterSpacing: "-0.5px" }}>
              Art<span style={{ color: rc.accent }}>Space</span>
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={collapseBtn}
            className="top-btn"
          >
            {sidebarOpen ? "‹" : "›"}
          </button>
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div style={{ ...roleBadge, background: rc.bg, borderColor: rc.accent + "40" }}>
            <div style={{ ...roleDot, background: rc.accent }} className="pulse" />
            <span style={{ color: rc.accent, fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>
              {rc.label}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {sidebarOpen && (
            <p style={navSection}>NAVIGATION</p>
          )}
          {items.map(item => (
            <button
              key={item.key}
              className={`nav-item ${activeNav === item.key ? "active" : ""}`}
              onClick={() => navTo(item.key, item.path)}
              style={{
                ...navItem,
                justifyContent: sidebarOpen ? "flex-start" : "center",
                background: activeNav === item.key ? "rgba(255,255,255,0.12)" : "transparent",
                borderLeft: activeNav === item.key ? `3px solid ${rc.accent}` : "3px solid transparent",
              }}
              title={!sidebarOpen ? item.label : ""}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{
                  fontSize: "13px",
                  fontWeight: activeNav === item.key ? 700 : 500,
                  color: activeNav === item.key ? "white" : "rgba(255,255,255,0.65)"
                }}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div style={sidebarFooter}>
          <button
            onClick={handleLogout}
            className="logout-btn"
            style={logoutItem}
          >
            <span style={{ fontSize: "16px" }}>⏻</span>
            {sidebarOpen && (
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════════ */}
      <div style={mainArea}>

        {/* TOP BAR */}
        <header style={topBar}>
          <div>
            <p style={topEyebrow}>
              {role === "admin" && "ADMIN DASHBOARD"}
              {role === "seller" && "SELLER DASHBOARD"}
              {role === "buyer" && "BUYER DASHBOARD"}
            </p>
            <h1 style={topTitle}>
              {role === "admin" && "Platform Overview"}
              {role === "seller" && "Your Studio"}
              {role === "buyer" && "Browse & Collect"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Quick nav pills */}
            <button
              className="top-btn"
              style={topPill}
              onClick={() => navigate(`/${role}/artworks`)}
            >
              🖼 Artworks
            </button>
            <button
              className="top-btn"
              style={topPill}
              onClick={() => navigate(`/${role}/posts`)}
            >
              📝 Posts
            </button>

            {/* Date */}
            <div style={dateChip}>
              <span style={{ fontSize: "11px", color: "#999" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <strong style={{ fontSize: "13px" }}>
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </strong>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main style={content} className="fade-in">

          {/* ── STATS GRID ── */}
          {role === "admin" && (
            <div style={{ ...statsGrid, gridTemplateColumns: "repeat(4, 1fr)" }}>
              <StatCard icon="👥" label="Total Users" value="—" trend="+12%" trendUp accent="#3b82f6" />
              <StatCard icon="🖼" label="Total Artworks" value="—" trend="+8%" trendUp accent="#8b5cf6" />
              <StatCard icon="📦" label="Total Orders" value="—" trend="+23%" trendUp accent="#f59e0b" />
              <StatCard icon="💰" label="Revenue" value="$0" trend="—" trendUp={false} accent="#10b981" />
            </div>
          )}

          {role === "seller" && (
            <div style={statsGrid}>
              <StatCard icon="🖼" label="Artworks Listed" value="0" trend="Start uploading" trendUp accent="#8b5cf6" />
              <StatCard icon="💰" label="Total Sales" value="$0" trend="—" trendUp={false} accent="#10b981" />
              <StatCard icon="👁" label="Profile Views" value="0" trend="Share your store" trendUp accent="#f59e0b" />
            </div>
          )}

          {role === "buyer" && (
            <div style={statsGrid}>
              <StatCard icon="🖼" label="Available Art" value="—" trend="Browse now" trendUp accent="#3b82f6" />
              <StatCard icon="❤️" label="Saved Items" value="0" trend="Save your favourites" trendUp={false} accent="#ef4444" />
              <StatCard icon="📦" label="My Orders" value="0" trend="—" trendUp={false} accent="#10b981" />
            </div>
          )}

          {/* ── MAIN CONTENT GRID ── */}
          <div style={contentGrid}>

            {/* QUICK ACTIONS */}
            <div style={panelCard}>
              <div style={panelHeader}>
                <div>
                  <p style={panelEyebrow}>QUICK ACTIONS</p>
                  <h2 style={panelTitle}>
                    {role === "admin" && "Admin Controls"}
                    {role === "seller" && "Manage Your Store"}
                    {role === "buyer" && "What's next?"}
                  </h2>
                </div>
                <div style={{ ...accentDot, background: rc.accent }} />
              </div>

              <div style={actionGrid}>
                {role === "admin" && <>
                  <ActionCard icon="👥" label="Manage Users" desc="View & control accounts" accent="#3b82f6" onClick={() => navigate("/admin/permissions")} />
                  <ActionCard icon="🖼" label="Artworks" desc="Moderate listings" accent="#8b5cf6" onClick={() => navigate("/admin/artworks")} />
                  <ActionCard icon="📝" label="Posts" desc="Review community posts" accent="#f59e0b" onClick={() => navigate("/admin/posts")} />
                  <ActionCard icon="🔑" label="Permissions" desc="Grant user capabilities" accent="#10b981" onClick={() => navigate("/admin/permissions")} />
                  <ActionCard icon="📦" label="Orders" desc="Platform order history" accent="#ef4444" onClick={() => { }} />
                  <ActionCard icon="📢" label="Announcements" desc="Post platform notices" accent="#06b6d4" onClick={() => { }} />


                </>}

                {role === "seller" && <>
                  <ActionCard icon="➕" label="Upload Artwork" desc="Add to marketplace" accent="#8b5cf6" onClick={() => navigate("/seller/artworks/upload")} />
                  <ActionCard icon="🖼" label="My Artworks" desc="Manage your listings" accent="#3b82f6" onClick={() => navigate("/seller/artworks")} />
                  <ActionCard icon="📝" label="Create Post" desc="Share with community" accent="#f59e0b" onClick={() => navigate("/seller/posts")} />
                  <ActionCard icon="📦" label="Orders" desc="Incoming orders" accent="#10b981" onClick={() => { }} />
                  <ActionCard icon="📊" label="Analytics" desc="Track performance" accent="#ef4444" onClick={() => { }} />
                  <ActionCard icon="💬" label="Messages" desc="Chat with buyers" accent="#06b6d4" onClick={() => navigate(`/${role}/chat`)} />
                </>}

                {role === "buyer" && <>
                  <ActionCard icon="🖼" label="Browse Art" desc="Discover artworks" accent="#3b82f6" onClick={() => navigate("/buyer/artworks")} />
                  <ActionCard icon="📝" label="Community" desc="Browse posts" accent="#8b5cf6" onClick={() => navigate("/buyer/posts")} />
                  <ActionCard icon="❤️" label="Favourites" desc="Your saved items" accent="#ef4444" onClick={() => { }} />
                  <ActionCard icon="📦" label="My Orders" desc="Track purchases" accent="#10b981" onClick={() => { }} />
                  <ActionCard icon="💬" label="Messages" desc="Chat with sellers" accent="#06b6d4" onClick={() => navigate(`/${role}/chat`)} />
                </>}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Status card */}
              <div style={panelCard}>
                <div style={panelHeader}>
                  <div>
                    <p style={panelEyebrow}>
                      {role === "admin" && "SYSTEM HEALTH"}
                      {role === "seller" && "STORE STATUS"}
                      {role === "buyer" && "ACCOUNT"}
                    </p>
                    <h2 style={panelTitle}>
                      {role === "admin" && "Platform Status"}
                      {role === "seller" && "Your Store"}
                      {role === "buyer" && "Your Profile"}
                    </h2>
                  </div>
                </div>

                {role === "admin" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <StatusRow label="API" value="Online" ok />
                    <StatusRow label="Database" value="Connected" ok />
                    <StatusRow label="Email" value="Active" ok />
                    <StatusRow label="Redis" value="Caching" ok />
                    <StatusRow label="Auth" value="Secure" ok />
                  </div>
                )}

                {role === "seller" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <StatusRow label="Role" value="Seller" ok />
                    <StatusRow label="Status" value="Active" ok />
                    <StatusRow label="Artworks" value="0 listed" ok={false} />
                    <StatusRow label="Earnings" value="$0.00" ok={false} />
                  </div>
                )}

                {role === "buyer" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <StatusRow label="Role" value="Buyer" ok />
                    <StatusRow label="Status" value="Active" ok />
                    <StatusRow label="Member since" value={new Date().getFullYear()} ok />
                  </div>
                )}

                {role === "seller" && (
                  <button
                    style={{ ...ctaBtn, background: rc.accent, color: "#171717", marginTop: "16px" }}
                    onClick={() => navigate("/seller/artworks/upload")}
                  >
                    Upload Artwork →
                  </button>
                )}
                {role === "buyer" && (
                  <button
                    style={{ ...ctaBtn, background: "#171717", color: "white", marginTop: "16px" }}
                    onClick={() => navigate("/buyer/artworks")}
                  >
                    Browse Artworks →
                  </button>
                )}
              </div>

              {/* Activity card */}
              <div style={{ ...panelCard, flex: 1 }}>
                <p style={panelEyebrow}>RECENT ACTIVITY</p>
                <h2 style={{ ...panelTitle, marginBottom: "16px" }}>Timeline</h2>
                <div style={emptyTimeline}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                    Activity will appear here
                  </p>
                </div>
              </div>

            </div>
          </div>
          {/* Chat promo banner */}
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            borderRadius: "16px",
            padding: "20px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
            flexWrap: "wrap"
          }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#60a5fa" }}>
                💬 LIVE CHAT
              </p>
              <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 800, color: "white" }}>
                {role === "buyer"
                  ? "Talk directly with artists before you buy."
                  : role === "seller"
                    ? "Connect with buyers and answer their questions."
                    : "Monitor platform conversations."}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                Real-time messaging — no email, no waiting.
              </p>
            </div>
            <button
              style={{ height: "40px", padding: "0 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
              onClick={() => navigate(`/${role}/chat`)}
            >
              Open Messages →
            </button>
          </div>
          {/* ── BOTTOM BANNER ── */}
          <div style={{ ...banner, background: `linear-gradient(135deg, ${rc.bg} 0%, #171717 100%)` }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: rc.accent }}>
                ARTSPACE PLATFORM
              </p>
              <h3 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 800, color: "white" }}>
                {role === "admin" && "Full platform control at your fingertips."}
                {role === "seller" && "Ready to showcase your artwork to the world?"}
                {role === "buyer" && "Discover unique artwork from talented sellers."}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                {role === "admin" && "Monitor users, artworks, orders and permissions from one place."}
                {role === "seller" && "Upload your first artwork and start reaching collectors today."}
                {role === "buyer" && "Browse thousands of original artworks across every style and medium."}
              </p>
            </div>
            <button
              style={{ ...ctaBtn, background: rc.accent, color: "#171717", flexShrink: 0 }}
              onClick={() => navigate(`/${role}/artworks`)}
            >
              {role === "admin" && "View Artworks →"}
              {role === "seller" && "Upload Now →"}
              {role === "buyer" && "Browse Now →"}
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

// ── SUB COMPONENTS ────────────────────────────────────────

const StatCard = ({ icon, label, value, trend, trendUp, accent }) => (
  <div className="stat-card" style={{
    background: "white", borderRadius: "16px",
    border: "1px solid #ebebeb", padding: "20px 24px",
    display: "flex", flexDirection: "column", gap: "12px"
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px",
        background: accent + "15",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px"
      }}>
        {icon}
      </div>
      {trend && (
        <span style={{
          fontSize: "11px", fontWeight: 700, padding: "2px 8px",
          borderRadius: "20px",
          background: trendUp ? "#f0fdf4" : "#fff7ed",
          color: trendUp ? "#16a34a" : "#ea580c"
        }}>
          {trendUp ? "↑ " : ""}{trend}
        </span>
      )}
    </div>
    <div>
      <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#888", fontWeight: 600 }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#171717", letterSpacing: "-1px" }}>
        {value}
      </h2>
    </div>
    <div style={{ height: "3px", borderRadius: "2px", background: accent + "20", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "40%", borderRadius: "2px", background: accent }} />
    </div>
  </div>
);

const ActionCard = ({ icon, label, desc, accent, onClick }) => (
  <div className="action-card" style={{
    background: "#fafaf9", borderRadius: "12px",
    border: "1px solid #ebebeb", padding: "16px",
    display: "flex", flexDirection: "column", gap: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
  }} onClick={onClick}>
    <div style={{
      width: "36px", height: "36px", borderRadius: "8px",
      background: accent + "15",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "16px"
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "#171717" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{desc}</p>
    </div>
    <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
      <span style={{ fontSize: "12px", color: accent, fontWeight: 700 }}>→</span>
    </div>
  </div>
);

const StatusRow = ({ label, value, ok }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 12px", borderRadius: "8px",
    background: ok ? "#f0fdf4" : "#fafaf9",
    marginBottom: "4px"
  }}>
    <span style={{ fontSize: "13px", color: "#555", fontWeight: 500 }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: ok ? "#16a34a" : "#d1d5db"
      }} />
      <span style={{ fontSize: "12px", fontWeight: 700, color: ok ? "#16a34a" : "#888" }}>
        {value}
      </span>
    </div>
  </div>
);

// ── STYLES ────────────────────────────────────────────────

const shell = { display: "flex", minHeight: "100vh", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const sidebar = { background: "#111111", display: "flex", flexDirection: "column", minHeight: "100vh", position: "sticky", top: 0, flexShrink: 0, overflow: "hidden" };
const sidebarLogo = { display: "flex", alignItems: "center", gap: "10px", padding: "20px 14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "relative" };
const logoMark = { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const collapseBtn = { position: "absolute", right: "8px", background: "rgba(255,255,255,0.08)", border: "none", color: "white", width: "22px", height: "22px", borderRadius: "4px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto" };
const roleBadge = { margin: "12px", padding: "8px 12px", borderRadius: "8px", border: "1px solid", display: "flex", alignItems: "center", gap: "8px" };
const roleDot = { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 };
const navSection = { margin: "8px 14px 4px", fontSize: "9px", fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.3)" };
const navItem = { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", border: "none", borderRadius: "0", background: "transparent", cursor: "pointer", width: "100%", textAlign: "left", color: "white" };
const sidebarFooter = { borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px" };
const logoutItem = { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer", width: "100%", textAlign: "left", color: "rgba(255,255,255,0.6)", transition: "all 0.15s" };
const mainArea = { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 };
const topBar = { background: "white", borderBottom: "1px solid #ebebeb", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", position: "sticky", top: 0, zIndex: 40 };
const topEyebrow = { margin: "0 0 2px", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const topTitle = { margin: 0, fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" };
const topPill = { padding: "6px 14px", border: "1px solid #e5e5e5", borderRadius: "20px", background: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#555", fontFamily: "inherit" };
const dateChip = { display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 14px", background: "#f5f5f3", borderRadius: "10px", border: "1px solid #ebebeb" };
const content = { padding: "28px 32px 48px", flex: 1 };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" };
const contentGrid = { display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px", marginBottom: "20px" };
const panelCard = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", padding: "24px" };
const panelHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" };
const panelEyebrow = { margin: "0 0 4px", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const panelTitle = { margin: 0, fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px" };
const accentDot = { width: "8px", height: "8px", borderRadius: "50%" };
const actionGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" };
const emptyTimeline = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", color: "#888", textAlign: "center" };
const banner = { borderRadius: "16px", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", flexWrap: "wrap" };
const ctaBtn = { height: "42px", padding: "0 20px", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" };

export default Dashboard;