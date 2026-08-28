import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:3000";

const Posts = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const currentUser = token ? jwtDecode(token) : null;
  const role = currentUser?.role;
  const canWrite = role === "seller" || role === "admin";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // modal state
  const [modal, setModal] = useState(null); // null | "create" | "edit" | "delete"
  const [activePost, setActivePost] = useState(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // ── fetch posts ─────────────────────────────────────
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = search
        ? `${API}/post?search=${encodeURIComponent(search)}`
        : `${API}/post`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // ── ownership check ──────────────────────────────────
  // A user can edit/delete if they own it OR they are admin
  const canModify = (post) => {
    if (!currentUser) return false;
    if (role === "admin") return true;
    return post.owner?._id === currentUser.userID;
  };

  // ── open modals ──────────────────────────────────────
  const openCreate = () => {
    setForm({ title: "", content: "" });
    setFormError("");
    setModal("create");
  };

  const openEdit = (post) => {
    setActivePost(post);
    setForm({ title: post.title, content: post.content });
    setFormError("");
    setModal("edit");
  };

  const openDelete = (post) => {
    setActivePost(post);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setActivePost(null);
    setFormError("");
  };

  // ── create ───────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch(`${API}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Failed to create post");
        return;
      }
      closeModal();
      fetchPosts();
    } catch {
      setFormError("Unable to connect to server");
    } finally {
      setFormLoading(false);
    }
  };

  // ── edit ─────────────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch(`${API}/post/${activePost._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Failed to update post");
        return;
      }
      closeModal();
      fetchPosts();
    } catch {
      setFormError("Unable to connect to server");
    } finally {
      setFormLoading(false);
    }
  };

  // ── delete ───────────────────────────────────────────
  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await fetch(`${API}/post/${activePost._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      closeModal();
      fetchPosts();
    } catch {
      // silently close
      closeModal();
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={page}>
      <style>{css}</style>

      {/* ── NAVBAR ── */}
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
          {canWrite && (
            <button style={primaryBtn} onClick={openCreate}>
              + New Post
            </button>
          )}
        </div>
      </nav>
  
      {/* ── HEADER ── */}
      <div style={pageHeader}>
        <div>
          <p style={eyebrow}>COMMUNITY</p>
          <h1 style={heading}>Posts</h1>
          <p style={subtext}>
            {canWrite
              ? "Create and manage posts visible to the community."
              : "Browse posts from sellers and the ArtSpace team."}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={searchForm}>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={searchInput_ }
            className="posts-search"
          />
          <button type="submit" style={primaryBtn}>Search</button>
          {search && (
            <button
              type="button"
              style={ghostBtn}
              onClick={() => { setSearch(""); setSearchInput(""); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* ── POSTS ── */}
      <div style={container}>
        {loading ? (
          <div style={centred}>
            <div className="post-spinner" />
            <p style={{ color: "#888", marginTop: "16px" }}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={emptyState}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "20px" }}>No posts yet</h3>
            <p style={{ margin: 0, color: "#888", fontSize: "14px" }}>
              {canWrite ? "Be the first to create a post." : "Check back soon."}
            </p>
            {canWrite && (
              <button style={{ ...primaryBtn, marginTop: "20px" }} onClick={openCreate}>
                Create first post
              </button>
            )}
          </div>
        ) : (
          <div style={grid}>
            {posts.map((post) => (
              <div key={post._id} style={card} className="post-card">

                {/* Card header */}
                <div style={cardTop}>
                  <div style={authorWrap}>
                    <div style={avatar}>
                      {post.owner?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p style={authorName}>{post.owner?.name || "Unknown"}</p>
                      <p style={authorEmail}>{post.owner?.email || ""}</p>
                    </div>
                  </div>
                  <span style={dateLabel}>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </span>
                </div>

                {/* Content */}
                <h2 style={cardTitle}>{post.title}</h2>
                <p style={cardContent}>{post.content}</p>

                {/* Actions — only if user can modify */}
                {canModify(post) && (
                  <div style={cardActions}>
                    <button
                      style={editBtn}
                      className="post-edit-btn"
                      onClick={() => openEdit(post)}
                    >
                      Edit
                    </button>
                    <button
                      style={deleteBtn}
                      className="post-delete-btn"
                      onClick={() => openDelete(post)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL BACKDROP ── */}
      {modal && (
        <div style={backdrop} onClick={closeModal}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>

            {/* CREATE */}
            {modal === "create" && (
              <>
                <div style={modalHeader}>
                  <h2 style={modalTitle}>New Post</h2>
                  <button style={closeBtn} onClick={closeModal}>✕</button>
                </div>
                <form onSubmit={handleCreate}>
                  <FormField
                    label="Title"
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    placeholder="Post title"
                  />
                  <FormField
                    label="Content"
                    value={form.content}
                    onChange={(v) => setForm({ ...form, content: v })}
                    placeholder="Write something..."
                    textarea
                  />
                  {formError && <p style={errorText}>{formError}</p>}
                  <div style={modalFooter}>
                    <button type="button" style={ghostBtn} onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" style={primaryBtn} disabled={formLoading}>
                      {formLoading ? "Creating..." : "Create Post"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* EDIT */}
            {modal === "edit" && (
              <>
                <div style={modalHeader}>
                  <h2 style={modalTitle}>Edit Post</h2>
                  <button style={closeBtn} onClick={closeModal}>✕</button>
                </div>
                <form onSubmit={handleEdit}>
                  <FormField
                    label="Title"
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    placeholder="Post title"
                  />
                  <FormField
                    label="Content"
                    value={form.content}
                    onChange={(v) => setForm({ ...form, content: v })}
                    placeholder="Write something..."
                    textarea
                  />
                  {formError && <p style={errorText}>{formError}</p>}
                  <div style={modalFooter}>
                    <button type="button" style={ghostBtn} onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" style={primaryBtn} disabled={formLoading}>
                      {formLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* DELETE */}
            {modal === "delete" && (
              <>
                <div style={modalHeader}>
                  <h2 style={modalTitle}>Delete Post</h2>
                  <button style={closeBtn} onClick={closeModal}>✕</button>
                </div>
                <p style={{ color: "#555", fontSize: "14px", lineHeight: 1.6, margin: "0 0 8px" }}>
                  Are you sure you want to delete:
                </p>
                <p style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 24px" }}>
                  "{activePost?.title}"
                </p>
                <p style={{ color: "#c62828", fontSize: "13px", margin: "0 0 24px" }}>
                  This action cannot be undone.
                </p>
                <div style={modalFooter}>
                  <button style={ghostBtn} onClick={closeModal}>Cancel</button>
                  <button
                    style={{ ...primaryBtn, background: "#c62828" }}
                    onClick={handleDelete}
                    disabled={formLoading}
                  >
                    {formLoading ? "Deleting..." : "Delete Post"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// ── small reusable form field ────────────────────────────
const FormField = ({ label, value, onChange, placeholder, textarea }) => (
  <div style={{ marginBottom: "18px" }}>
    <label style={fieldLabel}>{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        required
        style={{ ...fieldInput, height: "auto", resize: "vertical", paddingTop: "12px" }}
        className="posts-search"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={fieldInput}
        className="posts-search"
      />
    )}
  </div>
);

// ── styles ───────────────────────────────────────────────
const page = { minHeight: "100vh", background: "#f5f5f3", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "64px", background: "white", borderBottom: "1px solid #ebebeb", position: "sticky", top: 0, zIndex: 50 };
const logoWrap = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon = { width: "32px", height: "32px", borderRadius: "8px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "16px" };
const pageHeader = { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" };
const eyebrow = { margin: "0 0 8px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const heading = { margin: "0 0 8px", fontSize: "36px", fontWeight: 800, letterSpacing: "-1px" };
const subtext = { margin: 0, color: "#888", fontSize: "14px" };
const container = { maxWidth: "1100px", margin: "0 auto", padding: "0 24px 60px" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" };
const card = { background: "white", borderRadius: "16px", border: "1px solid #ebebeb", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", transition: "box-shadow 0.2s" };
const cardTop = { display: "flex", justifyContent: "space-between", alignItems: "flex-start" };
const authorWrap = { display: "flex", alignItems: "center", gap: "10px" };
const avatar = { width: "36px", height: "36px", borderRadius: "50%", background: "#171717", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0 };
const authorName = { margin: 0, fontWeight: 600, fontSize: "13px" };
const authorEmail = { margin: 0, fontSize: "11px", color: "#999" };
const dateLabel = { fontSize: "11px", color: "#bbb", whiteSpace: "nowrap" };
const cardTitle = { margin: 0, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1.3 };
const cardContent = { margin: 0, fontSize: "14px", color: "#555", lineHeight: 1.7, flex: 1 };
const cardActions = { display: "flex", gap: "8px", marginTop: "4px" };
const editBtn = { padding: "7px 16px", border: "1px solid #dedede", borderRadius: "8px", background: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
const deleteBtn = { padding: "7px 16px", border: "1px solid #ffd2d2", borderRadius: "8px", background: "#fff1f1", color: "#c62828", fontSize: "12px", fontWeight: 600, cursor: "pointer" };
const searchForm = { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" };
const searchInput_ = { height: "40px", padding: "0 14px", border: "1px solid #dedede", borderRadius: "8px", fontSize: "14px", outline: "none", width: "220px", background: "#fafafa" };
const primaryBtn = { height: "40px", padding: "0 18px", background: "#171717", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
const ghostBtn = { height: "40px", padding: "0 16px", background: "white", color: "#555", border: "1px solid #dedede", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" };
const centred = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" };
const emptyState = { textAlign: "center", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center" };
const backdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" };
const modalBox = { background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" };
const modalTitle = { margin: 0, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" };
const closeBtn = { background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#888", padding: "4px" };
const modalFooter = { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" };
const fieldLabel = { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600 };
const fieldInput = { width: "100%", height: "48px", padding: "0 14px", border: "1px solid #dedede", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#fafafa", fontFamily: "inherit", boxSizing: "border-box" };
const errorText = { color: "#c62828", fontSize: "13px", margin: "0 0 12px" };

const css = `
  .post-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .post-edit-btn:hover { background: #f5f5f3 !important; }
  .post-delete-btn:hover { background: #ffe4e4 !important; }
  .posts-search:focus { border-color: #171717 !important; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
  .post-spinner { width: 32px; height: 32px; border: 3px solid #e5e5e5; border-top-color: #171717; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default Posts;