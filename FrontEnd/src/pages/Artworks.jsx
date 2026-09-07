import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:3000";
const CATEGORIES = ["all", "painting", "photography", "digital", "sculpture", "illustration", "other"];

const Artworks = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const currentUser = token ? jwtDecode(token) : null;
    const role = currentUser?.role || null;
    const canUpload = role === "seller" || role === "admin";

    const [artworks,    setArtworks]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [category,    setCategory]    = useState("all");
    const [search,      setSearch]      = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [viewMine,    setViewMine]    = useState(false);
    const [meta,        setMeta]        = useState({ total: 0, pages: 1, page: 1 });
    const [page,        setPage]        = useState(1);

    // Delete modal
    const [deleteTarget,  setDeleteTarget]  = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Status update feedback
    const [feedback, setFeedback] = useState(null);

    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchArtworks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 12 });
            if (category !== "all") params.set("category", category);
            if (search)             params.set("search", search);
            if (viewMine)           params.set("mine", "true");

            const res = await fetch(`${API}/artwork?${params.toString()}`, {
                headers: authHeader
            });
            const data = await res.json();
            setArtworks(data.data || []);
            setMeta(data.meta || { total: 0, pages: 1, page: 1 });
        } catch {
            setArtworks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchArtworks(); }, [category, search, viewMine, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await fetch(`${API}/artwork/${deleteTarget._id}`, {
                method: "DELETE",
                headers: authHeader
            });
            setDeleteTarget(null);
            fetchArtworks();
        } catch {
            setDeleteTarget(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleStatusChange = async (artworkId, newStatus) => {
        setFeedback(null);
        try {
            const res = await fetch(`${API}/artwork/${artworkId}`, {
                method: "PUT",
                headers: { ...authHeader, "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setFeedback({ type: "success", message: `Status changed to "${newStatus}"` });
                fetchArtworks();
            }
        } catch {
            setFeedback({ type: "error", message: "Failed to update status" });
        }
    };

    const canModify = (artwork) => {
        if (!currentUser) return false;
        if (role === "admin") return true;
        return artwork.owner?._id === currentUser.userID;
    };

    const statusColor = (status) => {
        if (status === "published")    return { bg: "#f0fdf4", color: "#287a45", border: "#bbf7d0" };
        if (status === "early_access") return { bg: "#fefce8", color: "#854F0B", border: "#fde68a" };
        return { bg: "#f5f5f3", color: "#888", border: "#e5e5e5" };
    };

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
                    <button style={ghostBtn} onClick={() => navigate(`/${role}/dashboard`)}>
                        ← Dashboard
                    </button>
                    {canUpload && (
                        <button style={primaryBtn} onClick={() => navigate(`/${role}/artworks/upload`)}>
                            + Upload Artwork
                        </button>
                    )}
                </div>
            </nav>

            <div style={container}>

                {/* HEADER */}
                <div style={pageHeader}>
                    <div>
                        <p style={eyebrow}>MARKETPLACE</p>
                        <h1 style={heading}>Artworks</h1>
                        <p style={subtext}>
                            {canUpload
                                ? "Upload and manage your artworks, or browse the marketplace."
                                : "Discover and collect original artwork from talented sellers."}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
                        {canUpload && (
                            <button
                                style={{ ...tabBtn, ...(viewMine ? tabActive : {}) }}
                                onClick={() => { setViewMine(true);  setPage(1); }}
                            >
                                My Artworks
                            </button>
                        )}
                        <button
                            style={{ ...tabBtn, ...(!viewMine ? tabActive : {}) }}
                            onClick={() => { setViewMine(false); setPage(1); }}
                        >
                            Browse All
                        </button>
                    </div>
                </div>

                {/* FEEDBACK */}
                {feedback && (
                    <div style={feedback.type === "success" ? successBox : errorBox}>
                        {feedback.message}
                    </div>
                )}

                {/* FILTERS */}
                <div style={filtersRow}>
                    {/* Category tabs */}
                    <div style={catTabs}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                style={{ ...catTab, ...(category === cat ? catTabActive : {}) }}
                                onClick={() => { setCategory(cat); setPage(1); }}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
                        <input
                            type="text"
                            placeholder="Search artworks..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            style={searchInput_}
                            className="art-input"
                        />
                        <button type="submit" style={primaryBtn}>Search</button>
                        {search && (
                            <button
                                type="button"
                                style={ghostBtn}
                                onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                {/* META INFO */}
                {!loading && (
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 20px" }}>
                        {meta.total} artwork{meta.total !== 1 ? "s" : ""} found
                    </p>
                )}

                {/* GRID */}
                {loading ? (
                    <div style={centred}>
                        <div className="art-spinner" />
                        <p style={{ color: "#888", marginTop: "16px" }}>Loading artworks...</p>
                    </div>
                ) : artworks.length === 0 ? (
                    <div style={emptyState}>
                        <div style={{ fontSize: "52px", marginBottom: "16px" }}>🖼</div>
                        <h3 style={{ margin: "0 0 8px", fontSize: "20px" }}>No artworks found</h3>
                        <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>
                            {canUpload ? "Upload your first artwork to get started." : "Check back soon for new artwork."}
                        </p>
                        {canUpload && (
                            <button style={primaryBtn} onClick={() => navigate(`/${role}/artworks/upload`)}>
                                Upload first artwork
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={grid}>
                        {artworks.map(artwork => {
                            const sc = statusColor(artwork.status);
                            const owned = canModify(artwork);
                            return (
                                <div key={artwork._id} style={card} className="art-card">

                                    {/* Image */}
                                    <div style={imageWrap}>
                                        <img
                                           src={artwork.imageUrl}
                                            alt={artwork.title}
                                            style={image}
                                            onError={e => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display = "flex";
                                            }}
                                        />
                                        <div style={imageFallback}>🖼</div>

                                        {/* Status badge */}
                                        <div style={{
                                            ...statusBadge,
                                            background: sc.bg,
                                            color: sc.color,
                                            border: `1px solid ${sc.border}`
                                        }}>
                                            {artwork.status === "published"    && "● Published"}
                                            {artwork.status === "draft"        && "○ Draft"}
                                            {artwork.status === "early_access" && "★ Early Access"}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div style={cardBody}>
                                        <div style={cardTop}>
                                            <span style={catTag}>{artwork.category}</span>
                                            <span style={viewCount}>👁 {artwork.views}</span>
                                        </div>
                                        <h3 style={cardTitle}>{artwork.title}</h3>
                                        <p style={cardDesc}>{artwork.description}</p>

                                        <div style={cardFooter}>
                                            <div>
                                                <p style={ownerLabel}>by {artwork.owner?.name}</p>
                                                <strong style={priceTag}>${Number(artwork.price).toFixed(2)}</strong>
                                            </div>

                                            {/* Actions */}
                                            {owned ? (
                                                <div style={{ display: "flex", gap: "6px", flexDirection: "column", alignItems: "flex-end" }}>
                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                        <button
                                                            style={editBtn}
                                                            className="art-edit-btn"
                                                            onClick={() => navigate(`/${role}/artworks/edit/${artwork._id}`)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            style={deleteBtn}
                                                            className="art-delete-btn"
                                                            onClick={() => setDeleteTarget(artwork)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                    {/* Status quick-change */}
                                                    <select
                                                        value={artwork.status}
                                                        onChange={e => handleStatusChange(artwork._id, e.target.value)}
                                                        style={statusSelect}
                                                        className="art-input"
                                                    >
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                        <option value="early_access">Early Access</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <button style={buyBtn} className="art-buy-btn">
                                                    Buy Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION */}
                {meta.pages > 1 && (
                    <div style={pagination}>
                        <button
                            style={pageBtn}
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            ← Prev
                        </button>
                        <span style={{ fontSize: "13px", color: "#888" }}>
                            Page {meta.page} of {meta.pages}
                        </span>
                        <button
                            style={pageBtn}
                            disabled={page >= meta.pages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* DELETE CONFIRM MODAL */}
            {deleteTarget && (
                <div style={backdrop} onClick={() => setDeleteTarget(null)}>
                    <div style={modal} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: "0 0 12px", fontSize: "20px", fontWeight: 700 }}>Delete Artwork</h2>
                        <p style={{ color: "#555", fontSize: "14px", margin: "0 0 8px" }}>
                            Are you sure you want to delete:
                        </p>
                        <p style={{ fontWeight: 700, margin: "0 0 8px" }}>"{deleteTarget.title}"</p>
                        <p style={{ color: "#c62828", fontSize: "13px", margin: "0 0 24px" }}>
                            The image file will also be permanently deleted.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button style={ghostBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button
                                style={{ ...primaryBtn, background: "#c62828" }}
                                onClick={handleDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? "Deleting..." : "Delete Artwork"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Styles ───────────────────────────────────────────────────
const page        = { minHeight: "100vh", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar      = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "64px", background: "white", borderBottom: "1px solid #ebebeb", position: "sticky", top: 0, zIndex: 50 };
const logoWrap    = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon    = { width: "32px", height: "32px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const container   = { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" };
const pageHeader  = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px" };
const eyebrow     = { margin: "0 0 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const heading     = { margin: "0 0 8px", fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" };
const subtext     = { margin: 0, color: "#888", fontSize: "14px" };
const filtersRow  = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" };
const catTabs     = { display: "flex", gap: "6px", flexWrap: "wrap" };
const catTab      = { padding: "6px 14px", border: "1px solid #e5e5e5", borderRadius: "20px", background: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#555", transition: "0.15s", fontFamily: "inherit" };
const catTabActive = { background: "#171717", color: "white", borderColor: "#171717" };
const tabBtn      = { padding: "8px 16px", border: "1px solid #e5e5e5", borderRadius: "8px", background: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#555", fontFamily: "inherit" };
const tabActive   = { background: "#171717", color: "white", borderColor: "#171717" };
const searchInput_ = { height: "38px", padding: "0 14px", border: "1px solid #dedede", borderRadius: "8px", fontSize: "14px", outline: "none", width: "200px", background: "white" };
const grid        = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" };
const card        = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s" };
const imageWrap   = { position: "relative", height: "200px", background: "#f5f5f3", overflow: "hidden" };
const image       = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const imageFallback = { display: "none", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: "48px" };
const statusBadge = { position: "absolute", top: "10px", left: "10px", padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700 };
const cardBody    = { padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 };
const cardTop     = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const catTag      = { fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px" };
const viewCount   = { fontSize: "11px", color: "#bbb" };
const cardTitle   = { margin: 0, fontSize: "16px", fontWeight: 700, lineHeight: 1.3 };
const cardDesc    = { margin: 0, fontSize: "13px", color: "#666", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const cardFooter  = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f0f0f0" };
const ownerLabel  = { margin: "0 0 2px", fontSize: "11px", color: "#aaa" };
const priceTag    = { fontSize: "18px", fontWeight: 800, color: "#171717" };
const editBtn     = { padding: "6px 12px", border: "1px solid #dedede", borderRadius: "6px", background: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const deleteBtn   = { padding: "6px 12px", border: "1px solid #ffd2d2", borderRadius: "6px", background: "#fff1f1", color: "#c62828", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const buyBtn      = { padding: "8px 16px", border: "none", borderRadius: "8px", background: "#171717", color: "white", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const statusSelect = { fontSize: "11px", border: "1px solid #e5e5e5", borderRadius: "6px", padding: "4px 6px", cursor: "pointer", background: "white", fontFamily: "inherit" };
const primaryBtn  = { height: "38px", padding: "0 16px", background: "#171717", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const ghostBtn    = { height: "38px", padding: "0 14px", background: "white", color: "#555", border: "1px solid #dedede", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const centred     = { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" };
const emptyState  = { textAlign: "center", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center" };
const pagination  = { display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "40px" };
const pageBtn     = { padding: "8px 16px", border: "1px solid #e5e5e5", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" };
const backdrop    = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" };
const modal       = { background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px" };
const successBox  = { padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#287a45", fontSize: "13px", fontWeight: 600, marginBottom: "20px" };
const errorBox    = { padding: "12px 16px", background: "#fff2f1", border: "1px solid #ffd0cc", borderRadius: "10px", color: "#c62828", fontSize: "13px", fontWeight: 600, marginBottom: "20px" };

const css = `
    .art-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .art-edit-btn:hover { background: #f5f5f3 !important; }
    .art-delete-btn:hover { background: #ffe4e4 !important; }
    .art-buy-btn:hover { background: #333 !important; }
    .art-input:focus { border-color: #171717 !important; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
    .art-spinner { width: 32px; height: 32px; border: 3px solid #e5e5e5; border-top-color: #171717; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
`;

export default Artworks;