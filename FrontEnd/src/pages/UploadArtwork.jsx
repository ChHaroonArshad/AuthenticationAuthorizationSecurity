import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:3000";
const CATEGORIES = ["painting", "photography", "digital", "sculpture", "illustration", "other"];

const UploadArtwork = () => {
    const navigate   = useNavigate();
    const { id }     = useParams();       // if present → edit mode
    const isEdit     = Boolean(id);
    const token      = localStorage.getItem("accessToken");
    const currentUser = token ? jwtDecode(token) : null;
    const role       = currentUser?.role;
    const fileRef    = useRef(null);

   const [form, setForm] = useState({
    title:       "",
    description: "",
    price:       "",
    category:    "painting",
    status:      "published" 
});
    const [imageFile,    setImageFile]    = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImg,  setExistingImg]  = useState(null); // for edit mode
    const [errors,       setErrors]       = useState({});
    const [loading,      setLoading]      = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);

    // Redirect if not seller/admin
    useEffect(() => {
        if (!token || (role !== "seller" && role !== "admin")) {
            navigate("/unauthorized");
        }
    }, []);

    // If edit mode, fetch existing artwork
    useEffect(() => {
        if (!isEdit) return;

        const fetchArtwork = async () => {
            try {
                const res = await fetch(`${API}/artwork/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) { navigate(`/${role}/artworks`); return; }

                const a = data.data;
                setForm({
                    title:       a.title,
                    description: a.description,
                    price:       String(a.price),
                    category:    a.category,
                    status:      a.status
                });
             setExistingImg(a.imageUrl);
            } catch {
                navigate(`/${role}/artworks`);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchArtwork();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side size check (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: "Image must be under 10MB" }));
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, image: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.title.trim())       newErrors.title       = "Title is required";
        if (!form.description.trim()) newErrors.description = "Description is required";
        if (!form.price)              newErrors.price       = "Price is required";
        else if (isNaN(form.price) || Number(form.price) < 0)
                                      newErrors.price       = "Enter a valid price";
        if (!isEdit && !imageFile)    newErrors.image       = "Image is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        // Must use FormData because we're sending a file
        const formData = new FormData();
        formData.append("title",       form.title);
        formData.append("description", form.description);
        formData.append("price",       form.price);
        formData.append("category",    form.category);
        formData.append("status",      form.status);
        if (imageFile) formData.append("image", imageFile);

        try {
            const url    = isEdit ? `${API}/artwork/${id}` : `${API}/artwork`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                // Do NOT set Content-Type — browser sets it automatically with boundary for FormData
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.message || "Something went wrong" });
                return;
            }

            navigate(`/${role}/artworks`);
        } catch {
            setErrors({ general: "Unable to connect to server" });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f3" }}>
                <div className="upload-spinner" style={{ width: "32px", height: "32px", border: "3px solid #e5e5e5", borderTopColor: "#171717", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
        );
    }

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
                <button style={ghostBtn} onClick={() => navigate(`/${role}/artworks`)}>
                    ← Back to Artworks
                </button>
            </nav>

            <div style={container}>
                <div style={formCard}>

                    {/* HEADER */}
                    <div style={{ marginBottom: "32px" }}>
                        <p style={eyebrow}>{isEdit ? "EDIT ARTWORK" : "NEW ARTWORK"}</p>
                        <h1 style={heading}>{isEdit ? "Edit your artwork" : "Upload an artwork"}</h1>
                        <p style={subtext}>
                            {isEdit
                                ? "Update the details below. Leave image blank to keep existing."
                                : "Fill in the details and upload your image."}
                        </p>
                    </div>

                    {errors.general && (
                        <div style={errorBox}>{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div style={twoCol}>

                            {/* LEFT — form fields */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                                {/* Title */}
                                <div>
                                    <label style={label}>TITLE</label>
                                    <input
                                        name="title"
                                        type="text"
                                        placeholder="Artwork title"
                                        value={form.title}
                                        onChange={handleChange}
                                        style={{ ...input, ...(errors.title ? inputError : {}) }}
                                        className="upload-input"
                                    />
                                    {errors.title && <small style={errText}>{errors.title}</small>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label style={label}>DESCRIPTION</label>
                                    <textarea
                                        name="description"
                                        placeholder="Describe your artwork — medium, inspiration, size..."
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={4}
                                        style={{ ...input, height: "auto", resize: "vertical", paddingTop: "12px", ...(errors.description ? inputError : {}) }}
                                        className="upload-input"
                                    />
                                    {errors.description && <small style={errText}>{errors.description}</small>}
                                </div>

                                {/* Price */}
                                <div>
                                    <label style={label}>PRICE (USD)</label>
                                    <div style={{ position: "relative" }}>
                                        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: "14px" }}>$</span>
                                        <input
                                            name="price"
                                            type="number"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={handleChange}
                                            style={{ ...input, paddingLeft: "28px", ...(errors.price ? inputError : {}) }}
                                            className="upload-input"
                                        />
                                    </div>
                                    {errors.price && <small style={errText}>{errors.price}</small>}
                                </div>

                                {/* Category + Status row */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <label style={label}>CATEGORY</label>
                                        <select
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            style={select}
                                            className="upload-input"
                                        >
                                            {CATEGORIES.map(c => (
                                                <option key={c} value={c}>
                                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={label}>STATUS</label>
                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleChange}
                                            style={select}
                                            className="upload-input"
                                        >
                                            <option value="draft">Draft (only you)</option>
                                            <option value="published">Published (everyone)</option>
                                            <option value="early_access">Early Access</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Status explanation */}
                                <div style={statusHint}>
                                    {form.status === "draft"        && "🔒 Only you and admins can see this artwork."}
                                    {form.status === "published"    && "🌍 Visible to everyone on the marketplace."}
                                    {form.status === "early_access" && "⭐ Visible to buyers with Early Access permission + admins."}
                                </div>

                            </div>

                            {/* RIGHT — image upload */}
                            <div>
                                <label style={label}>ARTWORK IMAGE {!isEdit && <span style={{ color: "#c62828" }}>*</span>}</label>

                                {/* Preview */}
                                <div
                                    style={{
                                        ...dropZone,
                                        borderColor: errors.image ? "#e05a52" : imagePreview || existingImg ? "#171717" : "#dedede"
                                    }}
                                    onClick={() => fileRef.current.click()}
                                    className="art-drop"
                                >
                                    {imagePreview || existingImg ? (
                                        <>
                                            <img
                                                src={imagePreview || existingImg}
                                                alt="Preview"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                                            />
                                            <div style={dropOverlay}>
                                                <span style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>
                                                    Click to change
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: "center", color: "#888" }}>
                                            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🖼</div>
                                            <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600 }}>
                                                Click to upload image
                                            </p>
                                            <p style={{ margin: 0, fontSize: "12px" }}>
                                                JPG, PNG, WebP, GIF — max 10MB
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImage}
                                    style={{ display: "none" }}
                                />

                                {imageFile && (
                                    <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888" }}>
                                        {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}

                                {errors.image && <small style={errText}>{errors.image}</small>}
                            </div>
                        </div>

                        {/* SUBMIT */}
                        <div style={{ display: "flex", gap: "12px", marginTop: "32px", justifyContent: "flex-end" }}>
                            <button
                                type="button"
                                style={ghostBtn}
                                onClick={() => navigate(`/${role}/artworks`)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={primaryBtn}
                                disabled={loading}
                            >
                                {loading
                                    ? (isEdit ? "Saving..." : "Uploading...")
                                    : (isEdit ? "Save Changes" : "Upload Artwork →")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ── Styles ──────────────────────────────────────────────────
const page      = { minHeight: "100vh", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar    = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "64px", background: "white", borderBottom: "1px solid #ebebeb" };
const logoWrap  = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon  = { width: "32px", height: "32px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 };
const container = { maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px" };
const formCard  = { background: "white", borderRadius: "20px", border: "1px solid #ebebeb", padding: "40px" };
const eyebrow   = { margin: "0 0 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const heading   = { margin: "0 0 8px", fontSize: "28px", fontWeight: 800, letterSpacing: "-1px" };
const subtext   = { margin: 0, color: "#888", fontSize: "14px" };
const twoCol    = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" };
const label     = { display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px", color: "#555" };
const input     = { width: "100%", height: "48px", padding: "0 14px", border: "1px solid #dedede", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#fafafa", fontFamily: "inherit", boxSizing: "border-box", transition: "border 0.2s, box-shadow 0.2s" };
const inputError = { borderColor: "#e05a52", background: "#fffafa" };
const select    = { width: "100%", height: "48px", padding: "0 14px", border: "1px solid #dedede", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#fafafa", fontFamily: "inherit", boxSizing: "border-box", cursor: "pointer" };
const dropZone  = { width: "100%", height: "280px", border: "2px dashed", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden", transition: "border-color 0.2s", background: "#fafafa", boxSizing: "border-box" };
const dropOverlay = { position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" };
const statusHint = { padding: "12px 16px", background: "#f5f5f3", borderRadius: "10px", fontSize: "13px", color: "#555", lineHeight: 1.5 };
const primaryBtn = { height: "48px", padding: "0 24px", background: "#171717", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" };
const ghostBtn   = { height: "48px", padding: "0 20px", background: "white", color: "#555", border: "1px solid #dedede", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const errText    = { display: "block", marginTop: "6px", fontSize: "12px", color: "#d93025" };
const errorBox   = { padding: "12px 16px", background: "#fff2f1", border: "1px solid #ffd0cc", borderRadius: "10px", color: "#c62828", fontSize: "13px", marginBottom: "20px" };

const css = `
    .upload-input:focus { border-color: #171717 !important; box-shadow: 0 0 0 4px rgba(23,23,23,0.05) !important; background: white !important; }
    .art-drop:hover .drop-overlay { opacity: 1; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 700px) {
        .upload-two-col { grid-template-columns: 1fr !important; }
    }
`;

export default UploadArtwork;