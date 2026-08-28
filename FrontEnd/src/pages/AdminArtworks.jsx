import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:3000";
const CATS = ["all", "painting", "photography", "digital", "sculpture", "illustration", "premium", "other"];

const AdminArtworks = () => {
    const navigate    = useNavigate();
    const token       = localStorage.getItem("accessToken");
    const currentUser = token ? jwtDecode(token) : null;

    if (!currentUser || currentUser.role !== "admin") {
        navigate("/unauthorized");
        return null;
    }

    const [artworks,     setArtworks]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [category,     setCategory]     = useState("all");
    const [searchInput,  setSearchInput]  = useState("");
    const [search,       setSearch]       = useState("");
    const [currentPage,  setCurrentPage]  = useState(1);
    const [meta,         setMeta]         = useState({ total: 0, pages: 1 });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [delLoading,   setDelLoading]   = useState(false);
    const [feedback,     setFeedback]     = useState(null);

    const authH = { Authorization: `Bearer ${token}` };

    const fetchArtworks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: currentPage, limit: 15 });
            if (category !== "all") params.set("category", category);
            if (search) params.set("search", search);

            const res  = await fetch(`${API}/artwork?${params}`, { headers: authH });
            const data = await res.json();
            setArtworks(data.data || []);
            setMeta(data.meta || { total: 0, pages: 1 });
        } catch {
            setArtworks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchArtworks(); }, [category, search, currentPage]);

    const handleDelete = async () => {
        setDelLoading(true);
        try {
            await fetch(`${API}/artwork/${deleteTarget._id}`, {
                method: "DELETE", headers: authH
            });
            setDeleteTarget(null);
            setFeedback({ type: "success", message: "Artwork deleted successfully" });
            fetchArtworks();
        } catch {
            setFeedback({ type: "error", message: "Failed to delete artwork" });
            setDeleteTarget(null);
        } finally {
            setDelLoading(false);
        }
    };

    const statusColor = (s) => {
        if (s === "published")    return { bg: "#f0fdf4", color: "#287a45" };
        if (s === "early_access") return { bg: "#fefce8", color: "#854F0B" };
        return                           { bg: "#f5f5f3", color: "#888" };
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
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={adminPill}>⚡ Admin</div>
                    <button style={ghostBtn} onClick={() => navigate("/admin/dashboard")}>
                        ← Dashboard
                    </button>
                </div>
            </nav>

            <div style={container}>

                <div style={{ marginBottom: "24px" }}>
                    <p style={eyebrow}>ADMIN PANEL</p>
                    <h1 style={hdg}>Artwork Management</h1>
                    <p style={subtext}>View, moderate, and delete any artwork on the platform.</p>
                </div>

                {feedback && (
                    <div style={feedback.type === "success" ? successBox : errorBox}>
                        {feedback.message}
                    </div>
                )}

                {/* Filters */}
                <div style={filtersRow}>
                    <div style={catTabs}>
                        {CATS.map(cat => (
                            <button
                                key={cat}
                                style={{
                                    ...catTab,
                                    ...(category === cat ? catTabActive : {}),
                                    ...(cat === "premium" ? { borderColor: "#f59e0b", color: category === cat ? "white" : "#854d0e" } : {})
                                }}
                                onClick={() => { setCategory(cat); setCurrentPage(1); }}
                            >
                                {cat === "premium" ? "⭐ Premium" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setCurrentPage(1); }}
                        style={{ display: "flex", gap: "8px" }}>
                        <input
                            type="text"
                            placeholder="Search artworks..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            style={searchBox}
                            className="aa-input"
                        />
                        <button type="submit" style={primaryBtn}>Search</button>
                        {search && (
                            <button type="button" style={ghostBtn}
                                onClick={() => { setSearch(""); setSearchInput(""); setCurrentPage(1); }}>
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                {!loading && (
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 16px" }}>
                        {meta.total} artwork{meta.total !== 1 ? "s" : ""} total
                    </p>
                )}

                {loading ? (
                    <div style={centred}>
                        <div className="aa-spinner" />
                        <p style={{ color: "#888", marginTop: "16px" }}>Loading artworks...</p>
                    </div>
                ) : artworks.length === 0 ? (
                    <div style={centred}>
                        <p style={{ color: "#888" }}>No artworks found.</p>
                    </div>
                ) : (
                    <div style={tableWrap}>
                        <table style={table}>
                            <thead>
                                <tr style={theadRow}>
                                    <th style={th}>Artwork</th>
                                    <th style={th}>Owner</th>
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
                                        <tr key={a._id} style={tr} className="aa-row">
                                            <td style={td}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={thumbWrap}>
                                                        <img
                                                            src={`${API}${a.imageUrl}`}
                                                            alt={a.title}
                                                            style={thumb}
                                                            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                                                        />
                                                        <div style={thumbFallback}>🖼</div>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>{a.title}</p>
                                                        <p style={{ margin: 0, fontSize: "11px", color: "#bbb" }}>
                                                            {new Date(a.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={td}>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: "13px" }}>{a.owner?.name}</p>
                                                <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{a.owner?.email}</p>
                                            </td>
                                            <td style={td}>
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                                                    background: a.category === "premium" ? "#fef3c7" : "#f5f5f3",
                                                    color: a.category === "premium" ? "#92400e" : "#555"
                                                }}>
                                                    {a.category === "premium" ? "⭐ " : ""}{a.category}
                                                </span>
                                            </td>
                                            <td style={td}>
                                                <strong>${Number(a.price).toFixed(2)}</strong>
                                            </td>
                                            <td style={td}>
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                                                    background: sc.bg, color: sc.color
                                                }}>
                                                    {a.status === "published"    && "● Published"}
                                                    {a.status === "draft"        && "○ Draft"}
                                                    {a.status === "early_access" && "★ Early Access"}
                                                </span>
                                            </td>
                                            <td style={{ ...td, color: "#888", fontSize: "13px" }}>
                                                👁 {a.views}
                                            </td>
                                            <td style={td}>
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button
                                                        style={editBtn}
                                                        className="aa-edit"
                                                        onClick={() => navigate(`/admin/artworks/edit/${a._id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        style={delBtn}
                                                        className="aa-del"
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

                {meta.pages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "32px" }}>
                        <button style={pageBtn} disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
                        <span style={{ fontSize: "13px", color: "#888" }}>
                            Page {currentPage} of {meta.pages}
                        </span>
                        <button style={pageBtn} disabled={currentPage >= meta.pages}
                            onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
                    </div>
                )}
            </div>

            {/* Delete modal */}
            {deleteTarget && (
                <div style={backdrop} onClick={() => setDeleteTarget(null)}>
                    <div style={modal} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 700 }}>Delete Artwork</h2>
                        <p style={{ color: "#555", fontSize: "14px", margin: "0 0 8px" }}>
                            You are about to permanently delete:
                        </p>
                        <p style={{ fontWeight: 700, margin: "0 0 4px" }}>"{deleteTarget.title}"</p>
                        <p style={{ fontSize: "13px", color: "#888", margin: "0 0 8px" }}>
                            by {deleteTarget.owner?.name}
                        </p>
                        <p style={{ color: "#c62828", fontSize: "13px", margin: "0 0 24px" }}>
                            This cannot be undone. The image file will also be deleted.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button style={ghostBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button
                                style={{ ...primaryBtn, background: "#c62828" }}
                                onClick={handleDelete}
                                disabled={delLoading}
                            >
                                {delLoading ? "Deleting..." : "Delete Artwork"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const pg        = { minHeight: "100vh", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar    = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "64px", background: "white", borderBottom: "1px solid #ebebeb", position: "sticky", top: 0, zIndex: 50 };
const logoWrap  = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon  = { width: "32px", height: "32px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const adminPill = { padding: "4px 12px", borderRadius: "20px", background: "#171717", color: "#d7ff5f", fontSize: "11px", fontWeight: 700 };
const container = { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" };
const eyebrow   = { margin: "0 0 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const hdg       = { margin: "0 0 8px", fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" };
const subtext   = { margin: 0, color: "#888", fontSize: "14px" };
const filtersRow = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" };
const catTabs   = { display: "flex", gap: "6px", flexWrap: "wrap" };
const catTab    = { padding: "6px 14px", border: "1px solid #e5e5e5", borderRadius: "20px", background: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#555", fontFamily: "inherit" };
const catTabActive = { background: "#171717", color: "white", borderColor: "#171717" };
const searchBox = { height: "38px", padding: "0 14px", border: "1px solid #dedede", borderRadius: "8px", fontSize: "14px", outline: "none", width: "200px", background: "white" };
const primaryBtn = { height: "38px", padding: "0 16px", background: "#171717", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const ghostBtn   = { height: "38px", padding: "0 14px", background: "white", color: "#555", border: "1px solid #dedede", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const tableWrap  = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", overflow: "hidden" };
const table      = { width: "100%", borderCollapse: "collapse" };
const theadRow   = { background: "#f9f9f8" };
const th         = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "#888", letterSpacing: "1px", borderBottom: "1px solid #ebebeb" };
const tr         = { borderBottom: "1px solid #f0f0f0" };
const td         = { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" };
const thumbWrap  = { width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#f5f5f3", position: "relative" };
const thumb      = { width: "100%", height: "100%", objectFit: "cover" };
const thumbFallback = { display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", fontSize: "20px" };
const editBtn    = { padding: "6px 12px", border: "1px solid #dedede", borderRadius: "6px", background: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const delBtn     = { padding: "6px 12px", border: "1px solid #ffd2d2", borderRadius: "6px", background: "#fff1f1", color: "#c62828", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const pageBtn    = { padding: "8px 16px", border: "1px solid #e5e5e5", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" };
const centred    = { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" };
const backdrop   = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" };
const modal      = { background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px" };
const successBox = { padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#287a45", fontSize: "13px", fontWeight: 600, marginBottom: "20px" };
const errorBox   = { padding: "12px 16px", background: "#fff2f1", border: "1px solid #ffd0cc", borderRadius: "10px", color: "#c62828", fontSize: "13px", fontWeight: 600, marginBottom: "20px" };

const css = `
    .aa-row:hover { background: #fafaf9; }
    .aa-edit:hover { background: #f5f5f3 !important; }
    .aa-del:hover { background: #ffe4e4 !important; }
    .aa-input:focus { border-color: #171717 !important; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
    .aa-spinner { width: 32px; height: 32px; border: 3px solid #e5e5e5; border-top-color: #171717; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
`;

export default AdminArtworks;