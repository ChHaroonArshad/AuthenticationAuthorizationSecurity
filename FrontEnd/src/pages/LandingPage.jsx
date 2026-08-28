import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
const LandingPage = () => {
  const navigate = useNavigate();
useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
        const { role } = jwtDecode(token);
        if (role === "admin")       navigate("/admin/dashboard",  { replace: true });
        else if (role === "seller") navigate("/seller/dashboard", { replace: true });
        else                        navigate("/buyer/dashboard",  { replace: true });
    } catch {
        localStorage.removeItem("accessToken");
    }
}, [navigate]);
  return (
    <div style={page}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .float { animation: float 4s ease-in-out infinite; }
        .nav-link { background: none; border: none; cursor: pointer; font-size: 14px; color: #aaa; font-weight: 500; transition: color 0.2s; padding: 0; }
        .nav-link:hover { color: white; }
        .feature-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; transition: all 0.2s; cursor: default; }
        .feature-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(215,255,95,0.2); transform: translateY(-4px); }
        .role-card { border: 2px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px 28px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.03); }
        .role-card:hover { border-color: #d7ff5f; background: rgba(215,255,95,0.05); transform: translateY(-4px); }
        .primary-btn { background: #d7ff5f; color: #171717; border: none; border-radius: 12px; padding: 14px 28px; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .primary-btn:hover { background: #c8f050; transform: translateY(-2px); }
        .ghost-btn { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px 28px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .ghost-btn:hover { border-color: rgba(255,255,255,0.5); }
      `}</style>

      {/* NAVBAR */}
      <nav style={navbar}>
        <div style={logoWrap}>
          <div style={logoIcon}>A</div>
          <span style={{ fontSize: "18px", fontWeight: 800, color: "white" }}>ArtSpace</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <button className="nav-link">Features</button>
          <button className="nav-link">Artists</button>
          <button className="nav-link">Marketplace</button>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="ghost-btn" onClick={() => navigate("/login")}>Sign in</button>
          <button className="primary-btn" onClick={() => navigate("/register")}>Get started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={hero}>
        <div style={heroInner}>
          <div style={heroBadge}>✦ THE ART MARKETPLACE</div>
          <h1 style={heroHeading}>
            Where art finds<br />
            <span style={{ color: "#d7ff5f" }}>its audience.</span>
          </h1>
          <p style={heroSub}>
            ArtSpace connects talented artists with passionate collectors.
            Discover, buy, and sell original artwork in a community built for creativity.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <button className="primary-btn" style={{ fontSize: "15px", padding: "16px 32px" }} onClick={() => navigate("/register")}>
              Start for free →
            </button>
            <button className="ghost-btn" style={{ fontSize: "15px", padding: "16px 32px" }} onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
          <div style={heroStats}>
            <div style={heroStat}><strong style={{ color: "#d7ff5f", fontSize: "24px" }}>—</strong><span>Artists</span></div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", height: "40px" }}></div>
            <div style={heroStat}><strong style={{ color: "#d7ff5f", fontSize: "24px" }}>—</strong><span>Artworks</span></div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", height: "40px" }}></div>
            <div style={heroStat}><strong style={{ color: "#d7ff5f", fontSize: "24px" }}>—</strong><span>Sales</span></div>
          </div>
        </div>

        {/* Floating artwork card */}
        <div className="float" style={floatCard}>
          <div style={{ fontSize: "64px", marginBottom: "12px", textAlign: "center" }}>🖼</div>
          <p style={{ margin: "0 0 4px", fontWeight: 700, color: "white" }}>Abstract #001</p>
          <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#aaa" }}>by Artist Name</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ color: "#d7ff5f", fontSize: "18px" }}>$120.00</strong>
            <button className="primary-btn" style={{ padding: "8px 16px", fontSize: "12px" }}>Buy now</button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={section}>
        <p style={sectionEyebrow}>PLATFORM FEATURES</p>
        <h2 style={sectionHeading}>Everything you need to create, buy, and sell art.</h2>
        <div style={featuresGrid}>
          {[
            { icon: "🖼", title: "Artist Portfolios", desc: "Showcase your work with a beautiful portfolio page. Tell your story and build your audience." },
            { icon: "🛍", title: "Marketplace", desc: "Buy and sell original artwork securely. Browse thousands of pieces from talented artists worldwide." },
            { icon: "💬", title: "Direct Messaging", desc: "Connect directly with artists and buyers. Discuss commissions and build real relationships." },
            { icon: "🔴", title: "Live Sessions", desc: "Watch artists create in real time. Attend live painting sessions and exclusive auctions." },
            { icon: "📦", title: "Order Tracking", desc: "Track your purchases from payment to delivery. Full transparency at every step." },
            { icon: "🔒", title: "Secure Payments", desc: "Stripe-powered secure payments. Your transactions are always safe and protected." },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 10px", fontSize: "17px", fontWeight: 700, color: "white" }}>{f.title}</h3>
              <p style={{ margin: 0, color: "#888", fontSize: "13px", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JOIN AS */}
      <section style={{ ...section, textAlign: "center" }}>
        <p style={sectionEyebrow}>JOIN AS</p>
        <h2 style={sectionHeading}>Pick your role and get started.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "600px", margin: "0 auto" }}>
          <button className="role-card" onClick={() => navigate("/register")}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛍</div>
            <h3 style={{ margin: "0 0 10px", fontSize: "20px", fontWeight: 800, color: "white" }}>Buyer</h3>
            <p style={{ margin: "0 0 20px", color: "#888", fontSize: "13px" }}>Discover and collect original artwork from talented artists worldwide.</p>
            <span style={{ color: "#d7ff5f", fontWeight: 700, fontSize: "13px" }}>Join as Buyer →</span>
          </button>
          <button className="role-card" onClick={() => navigate("/register")}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</div>
            <h3 style={{ margin: "0 0 10px", fontSize: "20px", fontWeight: 800, color: "white" }}>Seller</h3>
            <p style={{ margin: "0 0 20px", color: "#888", fontSize: "13px" }}>Showcase your work, reach collectors, and sell your art to the world.</p>
            <span style={{ color: "#d7ff5f", fontWeight: 700, fontSize: "13px" }}>Join as Seller →</span>
          </button>
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...section, textAlign: "center", paddingBottom: "80px" }}>
        <h2 style={{ ...sectionHeading, fontSize: "48px" }}>Ready to start?</h2>
        <p style={{ color: "#888", fontSize: "15px", marginBottom: "32px" }}>Join ArtSpace today. It's free to get started.</p>
        <button className="primary-btn" style={{ fontSize: "16px", padding: "18px 40px" }} onClick={() => navigate("/register")}>
          Create your account →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={footer}>
        <div style={logoWrap}>
          <div style={{ ...logoIcon, width: "28px", height: "28px" }}>A</div>
          <span style={{ color: "white", fontWeight: 700 }}>ArtSpace</span>
        </div>
        <p style={{ margin: 0, color: "#555", fontSize: "12px" }}>© 2025 ArtSpace. Built for artists and collectors.</p>
      </footer>
    </div>
  );
};

const page = { minHeight: "100vh", background: "#0d0d0d", fontFamily: "Inter, system-ui, sans-serif", color: "#171717" };
const navbar = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 60px", height: "70px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(13,13,13,0.95)", backdropFilter: "blur(12px)", zIndex: 100 };
const logoWrap = { display: "flex", alignItems: "center", gap: "10px" };
const logoIcon = { width: "32px", height: "32px", borderRadius: "8px", background: "#d7ff5f", color: "#171717", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "16px" };
const hero = { display: "grid", gridTemplateColumns: "1fr 380px", gap: "60px", alignItems: "center", padding: "80px 60px 100px", maxWidth: "1200px", margin: "0 auto" };
const heroInner = { display: "flex", flexDirection: "column", gap: "24px" };
const heroBadge = { display: "inline-block", color: "#d7ff5f", fontSize: "11px", fontWeight: 800, letterSpacing: "2px" };
const heroHeading = { margin: 0, fontSize: "64px", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-3px", color: "white" };
const heroSub = { margin: 0, color: "#888", fontSize: "16px", lineHeight: 1.7, maxWidth: "480px" };
const heroStats = { display: "flex", gap: "32px", alignItems: "center", paddingTop: "8px" };
const heroStat = { display: "flex", flexDirection: "column", gap: "4px" };
const floatCard = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "28px", backdropFilter: "blur(10px)" };
const section = { maxWidth: "1100px", margin: "0 auto", padding: "80px 60px" };
const sectionEyebrow = { margin: "0 0 16px", fontSize: "11px", fontWeight: 800, letterSpacing: "2px", color: "#d7ff5f" };
const sectionHeading = { margin: "0 0 48px", fontSize: "40px", fontWeight: 800, color: "white", letterSpacing: "-1.5px", lineHeight: 1.1 };
const featuresGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" };
const footer = { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" };

export default LandingPage;