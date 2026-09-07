import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:3000";

const SellerArtworks = () => {
    const navigate    = useNavigate();
    const token       = localStorage.getItem("accessToken");
    const currentUser = token ? jwtDecode(token) : null;

    const [artworks,     setArtworks]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [delLoading,   setDelLoading]   = useState(false);
    const [feedback,     setFeedback]     = useState(null);

    const authH = { Authorization: `Bearer ${token}` };

    const fetchMyArtworks = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/artwork?mine=true`, { headers: authH });
            const data = await res.json();
            setArtworks(data.data || []);
        } catch {
            setArtworks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMyArtworks(); }, []);

    const handleDelete = async () => {
        setDelLoading(true);
        try {
            await fetch(`${API}/artwork/${deleteTarget._id}`, {
                method: "DELETE",
                headers: authH
            });
            setDeleteTarget(null);
            fetchMyArtworks();
        } catch {
            setDeleteTarget(null);
        } finally {
            setDelLoading(false);
        }
    };

    const handleStatus = async (id, newStatus) => {
        setFeedback(null);
        try {
            const res = await fetch(`${API}/artwork/${id}`, {
                method: "PUT",
                headers: { ...authH, "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setFeedback({ type: "success", message: `Status changed to "${newStatus}"` });
                fetchMyArtworks();
            }
        } catch {
            setFeedback({ type: "error", message: "Failed to update status" });
        }
    };

    const statusColor = (s) => {
        if (s === "published")    return { bg: "#f0fdf4", color: "#287a45", border: "#bbf7d0" };
        if (s === "early_access") return { bg: "#fefce8", color: "#854F0B", border: "#fde68a" };
        return                           { bg: "#f5f5f3", color: "#888",    border: "#e5e5e5" };
    };

    const stats = {
        total:     artworks.length,
        published: artworks.filter(a => a.status === "published").length,
        draft:     artworks.filter(a => a.status === "draft").length,
        early:     artworks.filter(a => a.status === "early_access").length,
    };

    return (
        <div style={pg}>
            <style>{css}</style>

            <nav style={navbar}>
                <div style={logoWrap}>
                    <div style={logoIcon}>A</div>
                    <span style={{ fontSize: "18px", fontWeight: 800 }}>
                        Art<span style={{ color: "#d7ff5f" }}>Space</span>
                    </span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button style={ghostBtn} onClick={() => navigate("/seller/dashboard")}>
                        ← Dashboard
                    </button>
                    <button style={primaryBtn} onClick={() => navigate("/seller/artworks/upload")}>
                        + Upload Artwork
                    </button>
                </div>
            </nav>

            <div style={container}>

                <div style={{ marginBottom: "28px" }}>
                    <p style={eyebrow}>MY STORE</p>
                    <h1 style={hdg}>My Artworks</h1>
                    <p style={subtext}>Manage your uploaded artwork listings.</p>
                </div>

                {/* Stats row */}
                <div style={statsRow}>
                    <StatPill label="Total"       value={stats.total}     color="#171717" />
                    <StatPill label="Published"   value={stats.published} color="#287a45" />
                    <StatPill label="Drafts"      value={stats.draft}     color="#888"    />
                    <StatPill label="Early Access" value={stats.early}    color="#854F0B" />
                </div>

                {feedback && (
                    <div style={feedback.type === "success" ? successBox : errorBox}>
                        {feedback.message}
                    </div>
                )}

                {loading ? (
                    <div style={centred}>
                        <div className="sa-spinner" />
                        <p style={{ color: "#888", marginTop: "16px" }}>Loading your artworks...</p>
                    </div>
                ) : artworks.length === 0 ? (
                    <div style={emptyState}>
                        <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎨</div>
                        <h3 style={{ margin: "0 0 8px" }}>No artworks yet</h3>
                        <p style={{ color: "#888", fontSize: "14px", margin: "0 0 20px" }}>
                            Upload your first artwork to start selling.
                        </p>
                        <button style={primaryBtn} onClick={() => navigate("/seller/artworks/upload")}>
                            Upload first artwork
                        </button>
                    </div>
                ) : (
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr style={theadRow}>
                                    <th style={th}>Artwork</th>
                                    <th style={th}>Category</th>
                                    <th style={th}>Price</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Views</th>
                                    <th style={th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artworks.map(a => {
                                    const sc = statusColor(a.status);
                                    return (
                                        <tr key={a._id} style={tr} className="sa-row">

                                            {/* Artwork thumbnail + title */}
                                            <td style={td}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={thumbWrap}>
                                                        {/* ✅ imageUrl is already a full Cloudinary URL */}
                                                        <img
                                                            src={a.imageUrl}
                                                            alt={a.title}
                                                            style={thumb}
                                                            onError={e => {
                                                                e.target.style.display = "none";
                                                                e.target.nextSibling.style.display = "flex";
                                                            }}
                                                        />
                                                        <div style={thumbFallback}>🖼</div>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>
                                                            {a.title}
                                                        </p>
                                                        <p style={{
                                                            margin: 0, fontSize: "12px", color: "#888",
                                                            maxWidth: "200px", overflow: "hidden",
                                                            textOverflow: "ellipsis", whiteSpace: "nowrap"
                                                        }}>
                                                            {a.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td style={td}>
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: "20px",
                                                    fontSize: "11px", fontWeight: 700,
                                                    background: "#f5f5f3", color: "#555"
                                                }}>
                                                    {a.category}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td style={td}>
                                                <strong>${Number(a.price).toFixed(2)}</strong>
                                            </td>

                                            {/* Status dropdown */}
                                            <td style={td}>
                                                <select
                                                    value={a.status}
                                                    onChange={e => handleStatus(a._id, e.target.value)}
                                                    style={{
                                                        padding: "4px 10px", borderRadius: "20px",
                                                        fontSize: "11px", fontWeight: 700,
                                                        border: `1px solid ${sc.border}`,
                                                        background: sc.bg, color: sc.color,
                                                        cursor: "pointer", fontFamily: "inherit",
                                                        outline: "none"
                                                    }}
                                                >
                                                    <option value="draft">Draft</option>
                                                    <option value="published">Published</option>
                                                    <option value="early_access">Early Access</option>
                                                </select>
                                            </td>

                                            {/* Views */}
                                            <td style={{ ...td, color: "#888", fontSize: "13px" }}>
                                                👁 {a.views}
                                            </td>

                                            {/* Actions */}
                                            <td style={td}>
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button
                                                        style={editBtn}
                                                        className="sa-edit"
                                                        onClick={() => navigate(`/seller/artworks/edit/${a._id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        style={delBtn}
                                                        className="sa-del"
                                                        onClick={() => setDeleteTarget(a)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete confirm modal */}
            {deleteTarget && (
                <div style={backdrop} onClick={() => setDeleteTarget(null)}>
                    <div style={modal} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 700 }}>
                            Delete Artwork
                        </h2>
                        <p style={{ color: "#555", fontSize: "14px", margin: "0 0 8px" }}>
                            Are you sure you want to delete:
                        </p>
                        <p style={{ fontWeight: 700, margin: "0 0 8px" }}>
                            "{deleteTarget.title}"
                        </p>
                        <p style={{ color: "#c62828", fontSize: "13px", margin: "0 0 24px" }}>
                            This cannot be undone. The image will also be deleted from Cloudinary.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button style={ghostBtn} onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </button>
                            <button
                                style={{ ...primaryBtn, background: "#c62828" }}
                                onClick={handleDelete}
                                disabled={delLoading}
                            >
                                {delLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatPill = ({ label, value, color }) => (
    <div style={{
        background: "white", border: "1px solid #ebebeb", borderRadius: "12px",
        padding: "16px 20px", textAlign: "center", minWidth: "100px"
    }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#888", fontWeight: 700, letterSpacing: "1px" }}>
            {label}
        </p>
        <strong style={{ fontSize: "28px", color }}>{value}</strong>
    </div>
);

// ── Styles ───────────────────────────────────────────────
const pg         = { minHeight: "100vh", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar     = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "64px", background: "white", borderBottom: "1px solid #ebebeb", position: "sticky", top: 0, zIndex: 50 };
const logoWrap   = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon   = { width: "32px", height: "32px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const container  = { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" };
const eyebrow    = { margin: "0 0 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const hdg        = { margin: "0 0 8px", fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" };
const subtext    = { margin: 0, color: "#888", fontSize: "14px" };
const statsRow   = { display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" };
const tableWrap  = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", overflow: "hidden" };
const table      = { width: "100%", borderCollapse: "collapse" };
const theadRow   = { background: "#f9f9f8" };
const th         = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#888", letterSpacing: "1px", borderBottom: "1px solid #ebebeb" };
const tr         = { borderBottom: "1px solid #f0f0f0" };
const td         = { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" };
const thumbWrap  = { width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#f5f5f3", position: "relative" };
const thumb      = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const thumbFallback = { display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", fontSize: "20px" };
const editBtn    = { padding: "6px 12px", border: "1px solid #dedede", borderRadius: "6px", background: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const delBtn     = { padding: "6px 12px", border: "1px solid #ffd2d2", borderRadius: "6px", background: "#fff1f1", color: "#c62828", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const primaryBtn = { height: "38px", padding: "0 16px", background: "#171717", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const ghostBtn   = { height: "38px", padding: "0 14px", background: "white", color: "#555", border: "1px solid #dedede", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const centred    = { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" };
const emptyState = { textAlign: "center", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center" };
const backdrop   = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" };
const modal      = { background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px" };
const successBox = { padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#287a45", fontSize: "13px", fontWeight: 600, marginBottom: "20px" };
const errorBox   = { padding: "12px 16px", background: "#fff2f1", border: "1px solid #ffd0cc", borderRadius: "10px", color: "#c62828", fontSize: "13px", fontWeight: 600, marginBottom: "20px" };

const css = `
    .sa-row:hover { background: #fafaf9; }
    .sa-edit:hover { background: #f5f5f3 !important; }
    .sa-del:hover { background: #ffe4e4 !important; }
    .sa-spinner { width: 32px; height: 32px; border: 3px solid #e5e5e5; border-top-color: #171717; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
`;

export default SellerArtworks;