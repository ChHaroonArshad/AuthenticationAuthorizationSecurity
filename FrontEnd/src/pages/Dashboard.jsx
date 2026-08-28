import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const user = token ? jwtDecode(token) : {};
  const role = user.role || "buyer";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div style={page}>
      <style>{`
        .dash-action-btn:hover { background: #f0f0f0 !important; }
        .sidebar-btn:hover { background: #f4f1eb !important; }
        .sidebar-btn-active { background: #f4f1eb !important; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={navbar}>
        <div style={logoWrap}>
          <div style={logoIcon}>A</div>
          <span style={{ fontSize: "18px", fontWeight: 800 }}>
            Art<span style={{ color: "#d7ff5f" }}>Space</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button style={navLink} onClick={() => navigate(`/${role}/artworks`)}>
            Artworks
          </button>
          <button style={navLink} onClick={() => navigate(`/${role}/posts`)}>
            Posts
          </button>
          <div style={rolePill}>
            {role === "admin"  && "⚡ Admin"}
            {role === "seller" && "🎨 Seller"}
            {role === "buyer"  && "🛍 Buyer"}
          </div>
          <button style={logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── LAYOUT ── */}
      <div style={role === "admin" ? adminLayout : standardLayout}>

        {/* SIDEBAR — admin only */}
        {role === "admin" && (
          <aside style={sidebar}>
            <p style={sidebarLabel}>NAVIGATION</p>
            {[
              { icon: "📊", label: "Overview",    onClick: () => {} },
              { icon: "👥", label: "Users",        onClick: () => navigate("/admin/permissions") },
              { icon: "🖼", label: "Artworks",     onClick: () => navigate(`/${role}/artworks`) },
              { icon: "📝", label: "Posts",        onClick: () => navigate(`/${role}/posts`) },
              { icon: "📦", label: "Orders",       onClick: () => {} },
              { icon: "💰", label: "Payments",     onClick: () => {} },
              { icon: "⚙",  label: "Settings",    onClick: () => {} },
              { icon: "🔑", label: "Permissions",  onClick: () => navigate("/admin/permissions") },
            ].map((item) => (
              <button
                key={item.label}
                className="sidebar-btn"
                style={sidebarBtn}
                onClick={item.onClick}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={mainStyle}>

          {/* WELCOME ROW */}
          <div style={welcomeRow}>
            <div>
              <p style={eyebrow}>
                {role === "admin"  && "ADMIN DASHBOARD"}
                {role === "seller" && "SELLER DASHBOARD"}
                {role === "buyer"  && "BUYER DASHBOARD"}
              </p>
              <h1 style={heading}>
                {role === "admin"  && "Platform Overview"}
                {role === "seller" && "Your Studio"}
                {role === "buyer"  && "Browse & Collect"}
              </h1>
              <p style={subtext}>
                {role === "admin"  && "Monitor and manage the entire ArtSpace platform."}
                {role === "seller" && "Manage your artwork, track sales, and grow your audience."}
                {role === "buyer"  && "Discover artwork from talented artists around the world."}
              </p>
            </div>
            <div style={datebox}>
              <span style={{ fontSize: "11px", color: "#999" }}>Today</span>
              <strong>
                {new Date().toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </strong>
            </div>
          </div>

          {/* ── STATS ── */}
          {role === "admin" && (
            <div style={{ ...statsGrid, gridTemplateColumns: "repeat(4, 1fr)" }}>
              <StatCard icon="👥" label="Total Users"    value="—"  bg="#e8f4fd" />
              <StatCard icon="🖼" label="Total Artworks" value="—"  bg="#f0fdf4" />
              <StatCard icon="📦" label="Total Orders"   value="—"  bg="#fefce8" />
              <StatCard icon="💰" label="Revenue"        value="$0" bg="#fdf4ff" />
            </div>
          )}

          {role === "seller" && (
            <div style={statsGrid}>
              <StatCard icon="🖼" label="Artworks Listed" value="0"  bg="#f4f1eb" />
              <StatCard icon="💰" label="Total Sales"     value="$0" bg="#f4f1eb" />
              <StatCard icon="👁" label="Profile Views"   value="0"  bg="#f4f1eb" />
            </div>
          )}

          {role === "buyer" && (
            <div style={statsGrid}>
              <StatCard icon="🖼" label="Artworks Available" value="—" bg="#f4f1eb" />
              <StatCard icon="❤️" label="Saved Items"        value="0" bg="#f4f1eb" />
              <StatCard icon="📦" label="Orders"             value="0" bg="#f4f1eb" />
            </div>
          )}

          {/* ── CARDS ── */}
          <div style={cardGrid}>

            {/* LEFT CARD — quick actions */}
            <div style={card}>
              <p style={cardEyebrow}>QUICK ACTIONS</p>
              <h2 style={cardHeading}>
                {role === "admin"  && "Admin controls"}
                {role === "seller" && "Manage your store"}
                {role === "buyer"  && "What would you like to do?"}
              </h2>
              <div style={actionList}>

                {role === "admin" && <>
                  <ActionBtn
                    icon="👥" title="Manage Users"
                    desc="View, edit, or suspend users"
                    onClick={() => navigate("/admin/permissions")}
                  />
                  <ActionBtn
                    icon="🖼" title="Manage Artworks"
                    desc="Review and moderate artwork listings"
                    onClick={() => navigate(`/${role}/artworks`)}
                  />
                  <ActionBtn
                    icon="📝" title="Manage Posts"
                    desc="Review and moderate posts"
                    onClick={() => navigate(`/${role}/posts`)}
                  />
                  <ActionBtn
                    icon="📦" title="Manage Orders"
                    desc="View all platform orders"
                    onClick={() => {}}
                  />
                  <ActionBtn
                    icon="🔑" title="Manage Permissions"
                    desc="Grant or revoke user capabilities"
                    onClick={() => navigate("/admin/permissions")}
                  />
                </>}

                {role === "seller" && <>
                  <ActionBtn
                    icon="🎨" title="Upload Artwork"
                    desc="Add a new artwork to the marketplace"
                    onClick={() => navigate(`/${role}/artworks/upload`)}
                  />
                  <ActionBtn
                    icon="🖼" title="My Artworks"
                    desc="View and manage your uploaded artworks"
                    onClick={() => navigate(`/${role}/artworks`)}
                  />
                  <ActionBtn
                    icon="➕" title="Create a Post"
                    desc="Share something with the community"
                    onClick={() => navigate(`/${role}/posts`)}
                  />
                  <ActionBtn
                    icon="📝" title="My Posts"
                    desc="View and edit your posts"
                    onClick={() => navigate(`/${role}/posts`)}
                  />
                  <ActionBtn
                    icon="📦" title="Orders"
                    desc="View incoming orders"
                    onClick={() => {}}
                  />
                  <ActionBtn
                    icon="📊" title="Analytics"
                    desc="Track your performance"
                    onClick={() => {}}
                  />
                </>}

                {role === "buyer" && <>
                  <ActionBtn
                    icon="🖼" title="Browse Artworks"
                    desc="Discover artwork from talented sellers"
                    onClick={() => navigate(`/${role}/artworks`)}
                  />
                  <ActionBtn
                    icon="📝" title="Browse Posts"
                    desc="See what the community is sharing"
                    onClick={() => navigate(`/${role}/posts`)}
                  />
                  <ActionBtn
                    icon="❤️" title="My Favourites"
                    desc="View saved artworks"
                    onClick={() => {}}
                  />
                  <ActionBtn
                    icon="📦" title="My Orders"
                    desc="Track your purchases"
                    onClick={() => {}}
                  />
                </>}

              </div>
            </div>

            {/* RIGHT CARD — role-specific info */}
            <div style={card}>

              {role === "admin" && <>
                <p style={cardEyebrow}>PLATFORM HEALTH</p>
                <h2 style={cardHeading}>System status</h2>
                <InfoRow label="API Status"    value="✅ Online"    />
                <InfoRow label="Database"      value="✅ Connected" />
                <InfoRow label="Email Service" value="✅ Active"    />
                <InfoRow label="Auth System"   value="✅ Secure"    />
              </>}

              {role === "seller" && <>
                <p style={cardEyebrow}>SELLER STATUS</p>
                <h2 style={cardHeading}>Your store</h2>
                <InfoRow label="Role"           value="Seller" />
                <InfoRow label="Store Status"   value="Active" />
                <InfoRow label="Posts"          value="0"      />
                <InfoRow label="Total Earnings" value="$0.00"  />
                <button
                  style={primaryBtn}
                  onClick={() => navigate(`/${role}/artworks/upload`)}
                >
                  Upload Artwork →
                </button>
              </>}

              {role === "buyer" && <>
                <p style={cardEyebrow}>ACCOUNT</p>
                <h2 style={cardHeading}>Your profile</h2>
                <InfoRow label="Role"         value="Buyer"                    />
                <InfoRow label="Status"       value="Active"                   />
                <InfoRow label="Member since" value={new Date().getFullYear()} />
                <button
                  style={primaryBtn}
                  onClick={() => navigate(`/${role}/artworks`)}
                >
                  Browse Artworks →
                </button>
              </>}

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

// ── SMALL COMPONENTS ─────────────────────────────────────

const StatCard = ({ icon, label, value, bg }) => (
  <div style={{
    background: bg || "white",
    borderRadius: "16px",
    border: "1px solid #ebebeb",
    padding: "24px",
    display: "flex",
    gap: "16px",
    alignItems: "center"
  }}>
    <div style={{
      width: "48px", height: "48px",
      borderRadius: "12px",
      background: "rgba(0,0,0,0.05)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "22px"
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>{value}</h2>
    </div>
  </div>
);

const ActionBtn = ({ icon, title, desc, onClick }) => (
  <button
    className="dash-action-btn"
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "12px 14px",
      border: "1px solid #ebebeb", borderRadius: "10px",
      background: "#fafafa",
      cursor: "pointer", width: "100%", textAlign: "left",
      transition: "0.15s", fontFamily: "inherit"
    }}
  >
    <span style={{ fontSize: "20px" }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <strong style={{ fontSize: "13px", display: "block" }}>{title}</strong>
      <small style={{ color: "#888", fontSize: "11px" }}>{desc}</small>
    </div>
    <span>→</span>
  </button>
);

const InfoRow = ({ label, value }) => (
  <div style={{
    display: "flex", justifyContent: "space-between",
    padding: "10px 0", borderBottom: "1px solid #f0f0f0"
  }}>
    <span style={{ color: "#888", fontSize: "13px" }}>{label}</span>
    <strong style={{ fontSize: "13px" }}>{value}</strong>
  </div>
);

// ── STYLES ───────────────────────────────────────────────

const page         = { minHeight: "100vh", background: "#f4f1eb", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar       = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "64px", background: "white", borderBottom: "1px solid #ebebeb" };
const logoWrap     = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon     = { width: "32px", height: "32px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const navLink      = { background: "none", border: "none", fontSize: "14px", fontWeight: 600, color: "#555", cursor: "pointer", padding: "6px 10px", borderRadius: "6px", transition: "0.15s" };
const rolePill     = { padding: "4px 12px", borderRadius: "20px", background: "#171717", color: "#d7ff5f", fontSize: "11px", fontWeight: 700 };
const logoutBtn    = { padding: "8px 16px", border: "1px solid #e5e5e5", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600 };
const adminLayout  = { display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 64px)" };
const standardLayout = { display: "block" };
const sidebar      = { background: "white", borderRight: "1px solid #ebebeb", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "4px" };
const sidebarLabel = { margin: "0 0 12px 8px", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const sidebarBtn   = { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "none", borderRadius: "8px", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: 500, textAlign: "left", width: "100%", transition: "0.15s" };
const mainStyle    = { padding: "40px", margin: "0 auto" };
const welcomeRow   = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" };
const eyebrow      = { margin: "0 0 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const heading      = { margin: "0 0 8px", fontSize: "36px", fontWeight: 800, letterSpacing: "-1px" };
const subtext      = { margin: 0, color: "#888", fontSize: "14px" };
const datebox      = { padding: "16px 20px", background: "white", borderRadius: "12px", border: "1px solid #ebebeb", display: "flex", flexDirection: "column", gap: "4px", textAlign: "right" };
const statsGrid    = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" };
const cardGrid     = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };
const card         = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", padding: "28px" };
const cardEyebrow  = { margin: "0 0 6px", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const cardHeading  = { margin: "0 0 20px", fontSize: "20px", fontWeight: 700 };
const actionList   = { display: "flex", flexDirection: "column", gap: "8px" };
const primaryBtn   = { marginTop: "20px", width: "100%", height: "44px", border: "none", borderRadius: "10px", background: "#171717", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" };

export default Dashboard;