import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/user/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to send reset link."
        );
        return;
      }

      setMessage(data.message);

    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* LEFT SIDE */}

        <div className="auth-visual">

          <div className="visual-content">

            <div className="logo">
              User<span>HUB</span>
            </div>

            <div className="visual-text">

              <p className="eyebrow">
                ACCOUNT RECOVERY
              </p>

              <h1>
                Get back
                <br />
                into your account.
              </h1>

              <p>
                Don't worry. We'll send you a secure
                password reset link so you can regain
                access to your account.
              </p>

            </div>

            <div className="visual-footer">
              Secure authentication
              <span>•</span>
              Password recovery
            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="auth-form-section">

          <div className="auth-form-wrapper">

            <div className="mobile-logo">
              User<span>HUB</span>
            </div>


            <div className="form-header">

              <p className="form-eyebrow">
                FORGOT PASSWORD
              </p>

              <h2>
                Reset your password.
              </h2>

              <p>
                Enter your email and we'll send
                you a secure reset link.
              </p>

            </div>


            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}


            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              noValidate
            >

              <div className="input-group">

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />

              </div>


              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >

                {loading
                  ? "Sending..."
                  : (
                    <>
                      Send reset link
                      <span>→</span>
                    </>
                  )}

              </button>

            </form>


            <div className="auth-switch">

              Remember your password?

              <Link to="/login">
                Back to login
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;