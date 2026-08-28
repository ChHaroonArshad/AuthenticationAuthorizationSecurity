import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:3000";

// Available permissions in ArtSpace
// Add more here as you build new features
const AVAILABLE_PERMISSIONS = [
    { key: "feature:early_access", label: "Early Access Drops",  desc: "See upcoming artwork drops before public release" },
    { key: "feature:premium_art",  label: "Premium Artworks",    desc: "Access premium/exclusive artworks in the marketplace" },
    { key: "run:auction",          label: "Run Auctions",        desc: "Start and manage live auction sessions" },
    { key: "feature:live_stream",  label: "Live Streaming",      desc: "Host live art creation sessions" },
    { key: "manage:featured",      label: "Manage Featured",     desc: "Control which artworks appear on homepage" },
];

const AdminPermissions = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const currentUser = token ? jwtDecode(token) : null;

    // Redirect non-admins
    if (!currentUser || currentUser.role !== "admin") {
        navigate("/unauthorized");
        return null;
    }

    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState("");
    const [feedback, setFeedback]     = useState(null); // { type: "success"|"error", message }
    const [actionLoading, setActionLoading] = useState(null); // "userId-permKey"

    // ── Test panel state ──────────────────────────────────
    const [testLoading, setTestLoading]   = useState(false);
    const [testResult, setTestResult]     = useState(null);

    // ── Fetch all users ───────────────────────────────────
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data.data || []);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ── Grant permission ──────────────────────────────────
    const grant = async (userId, permission) => {
        const key = `${userId}-${permission}`;
        setActionLoading(key);
        setFeedback(null);
        try {
            const res = await fetch(`${API}/user/admin/grant-permission`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId, permission })
            });
            const data = await res.json();
            if (!res.ok) {
                setFeedback({ type: "error", message: data.message });
                return;
            }
            setFeedback({ type: "success", message: `"${permission}" granted successfully` });
            // Update user in state without refetch
            setUsers(prev => prev.map(u =>
                u._id === userId
                    ? { ...u, permissions: data.data.permissions }
                    : u
            ));
        } catch {
            setFeedback({ type: "error", message: "Unable to connect to server" });
        } finally {
            setActionLoading(null);
        }
    };

    // ── Revoke permission ─────────────────────────────────
    const revoke = async (userId, permission) => {
        const key = `${userId}-${permission}`;
        setActionLoading(key);
        setFeedback(null);
        try {
            const res = await fetch(`${API}/user/admin/revoke-permission`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId, permission })
            });
            const data = await res.json();
            if (!res.ok) {
                setFeedback({ type: "error", message: data.message });
                return;
            }
            setFeedback({ type: "success", message: `"${permission}" revoked successfully` });
            setUsers(prev => prev.map(u =>
                u._id === userId
                    ? { ...u, permissions: data.data.permissions }
                    : u
            ));
        } catch {
            setFeedback({ type: "error", message: "Unable to connect to server" });
        } finally {
            setActionLoading(null);
        }
    };

    // ── Test the early access route ───────────────────────
    const testEarlyAccess = async () => {
        setTestLoading(true);
        setTestResult(null);
        try {
            const res = await fetch(`${API}/drops/early`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setTestResult({ status: res.status, ok: res.ok, data });
        } catch {
            setTestResult({ status: 0, ok: false, data: { message: "Connection failed" } });
        } finally {
            setTestLoading(false);
        }
    };

    // ── Filter users ──────────────────────────────────────
    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={page}>
            <style>{css}</style>

            {/* NAVBAR */}
            <nav style={navbar}>
                <div style={logoWrap}>
                    <div style={logoIcon}>A</div>
                    <span style={{ fontSize: "18px", fontWeight: 800 }}>
                        Art<span style={{ color: "#d7ff5f" }}>Space</span>
                    </span>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={adminPill}>⚡ Admin</div>
                    <button style={ghostBtn} onClick={() => navigate("/admin/dashboard")}>
                        ← Dashboard
                    </button>
                </div>
            </nav>

            <div style={container}>

                {/* HEADER */}
                <div style={pageHeader}>
                    <div>
                        <p style={eyebrow}>ADMIN PANEL</p>
                        <h1 style={heading}>Permission Manager</h1>
                        <p style={subtext}>Grant or revoke specific capabilities for individual users.</p>
                    </div>
                </div>

                {/* FEEDBACK */}
                {feedback && (
                    <div style={feedback.type === "success" ? successBox : errorBox}>
                        {feedback.type === "success" ? "✓" : "!"} {feedback.message}
                    </div>
                )}

                {/* TEST PANEL */}
                <div style={testPanel}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div>
                            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "15px" }}>
                                Test route: <code style={code}>GET /drops/early</code>
                            </p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
                                Requires <code style={code}>feature:early_access</code> permission. Admin always passes.
                            </p>
                        </div>
                        <button style={primaryBtn} onClick={testEarlyAccess} disabled={testLoading}>
                            {testLoading ? "Testing..." : "Run test →"}
                        </button>
                    </div>

                    {testResult && (
                        <div style={{
                            background: testResult.ok ? "#f0fdf4" : "#fff2f1",
                            border: `1px solid ${testResult.ok ? "#bbf7d0" : "#ffd0cc"}`,
                            borderRadius: "10px", padding: "16px"
                        }}>
                            <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: "13px", color: testResult.ok ? "#287a45" : "#c62828" }}>
                                {testResult.ok ? `✓ ${testResult.status} OK` : `✗ ${testResult.status} Failed`}
                            </p>
                            <pre style={{ margin: 0, fontSize: "12px", color: "#555", overflowX: "auto" }}>
                                {JSON.stringify(testResult.data, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* SEARCH */}
                <div style={{ marginBottom: "20px" }}>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={searchInput}
                        className="perm-input"
                    />
                </div>

                {/* USER TABLE */}
                {loading ? (
                    <div style={centred}>
                        <div className="perm-spinner" />
                        <p style={{ color: "#888", marginTop: "16px" }}>Loading users...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={centred}>
                        <p style={{ color: "#888" }}>No users found.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {filtered.map(user => (
                            <div key={user._id} style={userCard} className="perm-card">

                                {/* User info */}
                                <div style={userInfo}>
                                    <div style={avatar}>
                                        {user.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <div>
                                        <p style={userName}>{user.name}</p>
                                        <p style={userEmail}>{user.email}</p>
                                        <span style={{
                                            ...roleBadge,
                                            background: user.role === "admin" ? "#171717" : user.role === "seller" ? "#f0fdf4" : "#f0f4ff",
                                            color: user.role === "admin" ? "#d7ff5f" : user.role === "seller" ? "#287a45" : "#185FA5"
                                        }}>
                                            {user.role === "admin" && "⚡ Admin"}
                                            {user.role === "seller" && "🎨 Seller"}
                                            {user.role === "buyer" && "🛍 Buyer"}
                                        </span>
                                    </div>
                                </div>

                                {/* Permission toggles */}
                                <div style={permGrid}>
                                    {AVAILABLE_PERMISSIONS.map(perm => {
                                        const has = (user.permissions || []).includes(perm.key);
                                        const loading = actionLoading === `${user._id}-${perm.key}`;
                                        return (
                                            <div key={perm.key} style={{
                                                ...permItem,
                                                borderColor: has ? "#bbf7d0" : "#ebebeb",
                                                background: has ? "#f0fdf4" : "#fafafa"
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600 }}>
                                                        {perm.label}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>
                                                        <code style={code}>{perm.key}</code>
                                                    </p>
                                                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#aaa" }}>
                                                        {perm.desc}
                                                    </p>
                                                </div>
                                                <button
                                                    style={{
                                                        ...toggleBtn,
                                                        background: has ? "#c62828" : "#287a45",
                                                        opacity: loading || user.role === "admin" ? 0.5 : 1,
                                                        cursor: user.role === "admin" ? "not-allowed" : "pointer"
                                                    }}
                                                    onClick={() => has
                                                        ? revoke(user._id, perm.key)
                                                        : grant(user._id, perm.key)
                                                    }
                                                    disabled={loading || user.role === "admin"}
                                                    title={user.role === "admin" ? "Admins have all permissions automatically" : ""}
                                                >
                                                    {loading ? "..." : has ? "Revoke" : "Grant"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Styles ──────────────────────────────────────────────
const page       = { minHeight: "100vh", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar     = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "64px", background: "white", borderBottom: "1px solid #ebebeb", position: "sticky", top: 0, zIndex: 50 };
const logoWrap   = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon   = { width: "32px", height: "32px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const adminPill  = { padding: "4px 12px", borderRadius: "20px", background: "#171717", color: "#d7ff5f", fontSize: "11px", fontWeight: 700 };
const container  = { maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 80px" };
const pageHeader = { marginBottom: "32px" };
const eyebrow    = { margin: "0 0 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const heading    = { margin: "0 0 8px", fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" };
const subtext    = { margin: 0, color: "#888", fontSize: "14px" };
const testPanel  = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", padding: "24px", marginBottom: "24px" };
const searchInput = { width: "100%", height: "44px", padding: "0 16px", border: "1px solid #dedede", borderRadius: "10px", fontSize: "14px", outline: "none", background: "white", boxSizing: "border-box" };
const userCard   = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", padding: "24px" };
const userInfo   = { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" };
const avatar     = { width: "44px", height: "44px", borderRadius: "50%", background: "#171717", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "16px", flexShrink: 0 };
const userName   = { margin: "0 0 2px", fontWeight: 700, fontSize: "14px" };
const userEmail  = { margin: "0 0 6px", fontSize: "12px", color: "#888" };
const roleBadge  = { display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 };
const permGrid   = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" };
const permItem   = { display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px", border: "1px solid", borderRadius: "10px", transition: "all 0.15s" };
const toggleBtn  = { flexShrink: 0, padding: "6px 14px", border: "none", borderRadius: "6px", color: "white", fontSize: "12px", fontWeight: 700, transition: "0.15s" };
const primaryBtn = { height: "40px", padding: "0 20px", background: "#171717", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0 };
const ghostBtn   = { height: "40px", padding: "0 16px", background: "white", color: "#555", border: "1px solid #dedede", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
const successBox = { display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#287a45", fontSize: "13px", fontWeight: 600, marginBottom: "20px" };
const errorBox   = { display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "#fff2f1", border: "1px solid #ffd0cc", borderRadius: "10px", color: "#c62828", fontSize: "13px", fontWeight: 600, marginBottom: "20px" };
const centred    = { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" };
const code       = { fontFamily: "monospace", fontSize: "11px", background: "#f0f0f0", padding: "1px 5px", borderRadius: "4px" };

const css = `
    .perm-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .perm-input:focus { border-color: #171717 !important; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
    .perm-spinner { width: 28px; height: 28px; border: 3px solid #e5e5e5; border-top-color: #171717; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
`;

export default AdminPermissions;