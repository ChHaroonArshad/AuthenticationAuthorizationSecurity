import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SelectRole = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/auth/google/complete", {
        method: "POST",
        credentials: "include",     // sends the pending_google_profile cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      // Store token and go to dashboard — same as normal login
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>

        <div style={iconWrap}>
          <div style={iconBox}>A</div>
          <span style={{ fontSize: "18px", fontWeight: 800 }}>ArtSpace</span>
        </div>

        <p style={eyebrow}>ONE LAST STEP</p>
        <h1 style={heading}>How will you use ArtSpace?</h1>
        <p style={sub}>Choose your role — you can always change this later.</p>

        <div style={roleGrid}>
          <button
            style={{ ...roleBtn, ...(role === "buyer" ? roleActive : {}) }}
            onClick={() => setRole("buyer")}
          >
            <span style={roleIcon}>🛍</span>
            <strong>Buyer</strong>
            <small>Browse and collect art</small>
          </button>

          <button
            style={{ ...roleBtn, ...(role === "seller" ? roleActive : {}) }}
            onClick={() => setRole("seller")}
          >
            <span style={roleIcon}>🎨</span>
            <strong>Seller</strong>
            <small>Showcase and sell art</small>
          </button>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <button style={continueBtn} onClick={handleContinue} disabled={loading}>
          {loading ? "Setting up your account…" : "Continue →"}
        </button>

        <p style={backLink}>
          Wrong account?{" "}
          <span style={{ color: "#171717", cursor: "pointer", fontWeight: 700 }}
            onClick={() => navigate("/login")}>
            Go back
          </span>
        </p>

      </div>
    </div>
  );
};

// ── Styles ──────────────────────────────────────────
const page = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f1eb", fontFamily: "Inter, system-ui, sans-serif", padding: "20px" };
const card = { width: "480px", maxWidth: "100%", background: "white", borderRadius: "24px", padding: "48px 44px", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", textAlign: "center" };
const iconWrap = { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "32px" };
const iconBox = { width: "36px", height: "36px", borderRadius: "10px", background: "#171717", color: "#d7ff5f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "16px" };
const eyebrow = { margin: "0 0 10px", fontSize: "10px", fontWeight: 800, letterSpacing: "2px", color: "#999" };
const heading = { margin: "0 0 10px", fontSize: "28px", fontWeight: 800, letterSpacing: "-1px" };
const sub = { margin: "0 0 32px", color: "#888", fontSize: "14px" };
const roleGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" };
const roleBtn = { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "20px 12px", border: "2px solid #e5e5e5", borderRadius: "14px", background: "#fafafa", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" };
const roleActive = { border: "2px solid #171717", background: "#171717", color: "white" };
const roleIcon = { fontSize: "28px" };
const errorBox = { background: "#fff2f1", border: "1px solid #ffd0cc", borderRadius: "10px", color: "#c62828", fontSize: "13px", padding: "12px", marginBottom: "16px" };
const continueBtn = { width: "100%", height: "52px", border: "none", borderRadius: "12px", background: "#171717", color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "0.2s", opacity: 1 };
const backLink = { marginTop: "20px", fontSize: "12px", color: "#999" };

export default SelectRole;