import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:3000";
const CATS = ["all", "painting", "photography", "digital", "sculpture", "illustration", "other"];

const BuyerArtworks = () => {
    const navigate    = useNavigate();
    const token       = localStorage.getItem("accessToken");
    const currentUser = token ? jwtDecode(token) : null;
    const hasPremium  = (currentUser?.permissions || []).includes("feature:premium_art");

    const [artworks,          setArtworks]          = useState([]);
    const [loading,           setLoading]            = useState(true);
    const [category,          setCategory]           = useState("all");
    const [searchInput,       setSearchInput]        = useState("");
    const [search,            setSearch]             = useState("");
    const [currentPage,       setCurrentPage]        = useState(1);
    const [meta,              setMeta]               = useState({ total: 0, pages: 1 });
    const [showPremiumBanner, setShowPremiumBanner]  = useState(!hasPremium);

    const cats = hasPremium ? [...CATS, "premium"] : CATS;

    const fetchArtworks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: currentPage, limit: 12 });
            if (category !== "all") params.set("category", category);
            if (search)             params.set("search",   search);

            const res  = await fetch(`${API}/artwork?${params}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
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

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setSearch(searchInput);
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
                <button style={ghostBtn} onClick={() => navigate("/buyer/dashboard")}>
                    ← Dashboard
                </button>
            </nav>

            <div style={container}>

                {/* Premium banner */}
                {showPremiumBanner && (
                    <div style={premiumBanner}>
                        <div>
                            <strong style={{ fontSize: "14px" }}>⭐ Unlock Premium Artworks</strong>
                            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#855f0b" }}>
                                Some exclusive artworks require Premium access. Contact an admin to get access.
                            </p>
                        </div>
                        <button style={bannerClose} onClick={() => setShowPremiumBanner(false)}>✕</button>
                    </div>
                )}

                <div style={pageHeader}>
                    <div>
                        <p style={eyebrow}>MARKETPLACE</p>
                        <h1 style={hdg}>Browse Artworks</h1>
                        <p style={subtext}>Discover original artwork from talented sellers.</p>
                    </div>
                    {hasPremium && (
                        <div style={premiumPill}>⭐ Premium Access</div>
                    )}
                </div>

                {/* Category filters */}
                <div style={filtersRow}>
                    <div style={catTabs}>
                        {cats.map(cat => (
                            <button
                                key={cat}
                                style={{
                                    ...catTab,
                                    ...(category === cat ? catTabActive : {}),
                                    ...(cat === "premium" ? premiumCat : {})
                                }}
                                onClick={() => { setCategory(cat); setCurrentPage(1); }}
                            >
                                {cat === "premium"
                                    ? "⭐ Premium"
                                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
                        <input
                            type="text"
                            placeholder="Search artworks..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            style={searchBox}
                            className="ba-input"
                        />
                        <button type="submit" style={primaryBtn}>Search</button>
                        {search && (
                            <button
                                type="button"
                                style={ghostBtn}
                                onClick={() => { setSearch(""); setSearchInput(""); setCurrentPage(1); }}
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                {!loading && (
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 20px" }}>
                        {meta.total} artwork{meta.total !== 1 ? "s" : ""} found
                    </p>
                )}

                {loading ? (
                    <div style={centred}>
                        <div className="ba-spinner" />
                        <p style={{ color: "#888", marginTop: "16px" }}>Loading artworks...</p>
                    </div>
                ) : artworks.length === 0 ? (
                    <div style={emptyState}>
                        <div style={{ fontSize: "52px", marginBottom: "16px" }}>🖼</div>
                        <h3 style={{ margin: "0 0 8px" }}>No artworks found</h3>
                        <p style={{ color: "#888", fontSize: "14px" }}>
                            Try a different category or search term.
                        </p>
                    </div>
                ) : (
                    <div style={grid}>
                        {artworks.map(artwork => (
                            <div
                                key={artwork._id}
                                style={{
                                    ...card,
                                    ...(artwork.category === "premium" ? premiumCard : {})
                                }}
                                className="ba-card"
                            >
                                <div style={imageWrap}>
                                    {/* ✅ imageUrl is already a full Cloudinary URL */}
                                    <img
                                        src={artwork.imageUrl}
                                        alt={artwork.title}
                                        style={imgStyle}
                                        onError={e => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display = "flex";
                                        }}
                                    />
                                    <div style={imgFallback}>🖼</div>
                                    {artwork.category === "premium" && (
                                        <div style={premiumBadge}>⭐ Premium</div>
                                    )}
                                </div>
                                <div style={cardBody}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={catTag}>{artwork.category}</span>
                                        <span style={{ fontSize: "11px", color: "#bbb" }}>
                                            👁 {artwork.views}
                                        </span>
                                    </div>
                                    <h3 style={cardTitle}>{artwork.title}</h3>
                                    <p style={cardDesc}>{artwork.description}</p>
                                    <div style={cardFooter}>
                                        <div>
                                            <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#aaa" }}>
                                                by {artwork.owner?.name}
                                            </p>
                                            <strong style={{ fontSize: "18px", fontWeight: 800 }}>
                                                ${Number(artwork.price).toFixed(2)}
                                            </strong>
                                        </div>
                                        <button style={buyBtn} className="ba-buy">Buy Now</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {meta.pages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "40px" }}>
                        <button
                            style={pageBtn}
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            ← Prev
                        </button>
                        <span style={{ fontSize: "13px", color: "#888" }}>
                            Page {currentPage} of {meta.pages}
                        </span>
                        <button
                            style={pageBtn}
                            disabled={currentPage >= meta.pages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Styles ───────────────────────────────────────────────
const pg           = { minHeight: "100vh", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar       = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "64px", background: "white", borderBottom: "1px solid #ebebeb", position: "sticky", top: 0, zIndex: 50 };
const logoWrap     = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon     = { width: "32px", height: "32px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const container    = { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" };
const pageHeader   = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" };
const eyebrow      = { margin: "0 0 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const hdg          = { margin: "0 0 8px", fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" };
const subtext      = { margin: 0, color: "#888", fontSize: "14px" };
const filtersRow   = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" };
const catTabs      = { display: "flex", gap: "6px", flexWrap: "wrap" };
const catTab       = { padding: "6px 14px", border: "1px solid #e5e5e5", borderRadius: "20px", background: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#555", fontFamily: "inherit" };
const catTabActive = { background: "#171717", color: "white", borderColor: "#171717" };
const premiumCat   = { borderColor: "#f59e0b", color: "#854d0e" };
const searchBox    = { height: "38px", padding: "0 14px", border: "1px solid #dedede", borderRadius: "8px", fontSize: "14px", outline: "none", width: "200px", background: "white" };
const primaryBtn   = { height: "38px", padding: "0 16px", background: "#171717", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const ghostBtn     = { height: "38px", padding: "0 14px", background: "white", color: "#555", border: "1px solid #dedede", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const grid         = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" };
const card         = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s" };
const premiumCard  = { border: "1.5px solid #f59e0b", background: "#fffbeb" };
const imageWrap    = { position: "relative", height: "200px", background: "#f5f5f3", overflow: "hidden" };
const imgStyle     = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const imgFallback  = { display: "none", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: "48px" };
const premiumBadge = { position: "absolute", top: "10px", left: "10px", padding: "3px 10px", borderRadius: "20px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", fontSize: "10px", fontWeight: 700 };
const cardBody     = { padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 };
const catTag       = { fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "1px" };
const cardTitle    = { margin: 0, fontSize: "16px", fontWeight: 700, lineHeight: 1.3 };
const cardDesc     = { margin: 0, fontSize: "13px", color: "#666", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const cardFooter   = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #f0f0f0" };
const buyBtn       = { padding: "8px 16px", border: "none", borderRadius: "8px", background: "#171717", color: "white", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const pageBtn      = { padding: "8px 16px", border: "1px solid #e5e5e5", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" };
const centred      = { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" };
const emptyState   = { textAlign: "center", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center" };
const premiumBanner = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "12px", marginBottom: "24px", color: "#854d0e" };
const bannerClose  = { background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#854d0e", padding: "0 4px" };
const premiumPill  = { padding: "6px 14px", borderRadius: "20px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", fontSize: "12px", fontWeight: 700, alignSelf: "flex-start" };

const css = `
    .ba-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .ba-buy:hover { background: #333 !important; }
    .ba-input:focus { border-color: #171717 !important; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
    .ba-spinner { width: 32px; height: 32px; border: 3px solid #e5e5e5; border-top-color: #171717; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
`;

export default BuyerArtworks;