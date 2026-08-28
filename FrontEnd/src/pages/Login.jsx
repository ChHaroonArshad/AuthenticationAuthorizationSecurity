import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "", general: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Please enter your email address.";
    if (!formData.password) newErrors.password = "Please enter your password.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const formattedErrors = {};
          Object.entries(data.errors).forEach(([field, message]) => {
            formattedErrors[field.replace("body.", "")] = message;
          });
          setErrors(formattedErrors);
        } else {
          setErrors({ general: data.message || "Invalid email or password." });
        }
        return;
      }

      localStorage.setItem("accessToken", data.data);
      //---------------
      const { role } = jwtDecode(data.data);
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "seller") navigate("/seller/dashboard");
      else navigate("/buyer/dashboard");
    } catch (error) {
      console.error(error);
      setErrors({ general: "Unable to connect to the server." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Just redirect — backend handles everything from here
    window.location.href = "http://localhost:3000/auth/google";
  };

  // Read error from URL if Google OAuth failed and redirected back here
  const urlError = new URLSearchParams(window.location.search).get("error");
  const googleError =
    urlError === "oauth_failed" ? "Google sign-in failed. Please try again." :
      urlError === "invalid_state" ? "Sign-in session expired. Please try again." :
        urlError === "no_token" ? "Sign-in failed. No token received." :
          null;

  return (
    <div className="auth-page">
      <style>{`
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: #8a7a63;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #4a3f34;
        }
        .google-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 20px;
          background: transparent;
          border: 1px solid #4a3f34;
          border-radius: 4px;
          color: #d4c5b0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
          margin-bottom: 0;
        }
        .google-button:hover:not(:disabled) {
          border-color: #c79a4b;
          background: rgba(199, 154, 75, 0.06);
          color: #f1e9dd;
        }
        .google-button:focus-visible {
          outline: 2px solid #c79a4b;
          outline-offset: 2px;
        }
        .google-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .google-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .oauth-error {
          background: rgba(197, 139, 122, 0.12);
          border: 1px solid rgba(197, 139, 122, 0.3);
          border-radius: 4px;
          color: #e0a898;
          font-size: 13px;
          padding: 10px 14px;
          margin-bottom: 16px;
          text-align: center;
        }
      `}</style>

      <div className="auth-container">

        <div className="auth-visual">
          <div className="visual-content">
            <div className="logo">User<span>HUB</span></div>
            <div className="visual-text">
              <p className="eyebrow">WELCOME BACK</p>
              <h1>Your space.<br />Your world.</h1>
              <p>
                Sign in to continue managing your profile,
                posts and everything that matters to you.
              </p>
            </div>
            <div className="visual-footer">
              Secure authentication <span>•</span> MongoDB
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-wrapper">

            <div className="mobile-logo">User<span>HUB</span></div>

            <div className="form-header">
              <p className="form-eyebrow">ACCOUNT LOGIN</p>
              <h2>Welcome back.</h2>
              <p>Enter your credentials to access your account.</p>
            </div>

            {/* Google OAuth error (redirected back from failed OAuth) */}
            {googleError && (
              <div className="oauth-error">{googleError}</div>
            )}

            {/* Normal form error */}
            {errors.general && (
              <div className="auth-error">{errors.general}</div>
            )}

            {/* ── Google Sign-in ── */}
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
            </button>

            <div className="divider">or sign in with email</div>

            {/* ── Email / Password form ── */}
            <form onSubmit={handleLogin} noValidate>

              <div className="input-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="field-error">{errors.email}</div>
                )}
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="forgot">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <div className="field-error">{errors.password}</div>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading || googleLoading}
              >
                {loading ? "Signing in..." : (<>Sign in <span>→</span></>)}
              </button>

            </form>

            <div className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">Create an account</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;