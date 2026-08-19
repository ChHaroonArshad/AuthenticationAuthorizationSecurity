import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const ResetPassword = () => {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError(
        "Please fill in both password fields."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:3000/user/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.message ||
          "Unable to reset password."
        );

        return;
      }

      setMessage(
        "Your password has been reset successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800);

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
                ACCOUNT SECURITY
              </p>

              <h1>
                Create a
                <br />
                new password.
              </h1>

              <p>
                Choose a strong password that you
                haven't used before to keep your
                account secure.
              </p>

            </div>


            <div className="visual-footer">
              Secure authentication
              <span>•</span>
              Password protection
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
                RESET PASSWORD
              </p>

              <h2>
                Choose a new password.
              </h2>

              <p>
                Enter your new password below.
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


            {!message && (

              <form
                onSubmit={handleSubmit}
                noValidate
              >


                {/* NEW PASSWORD */}

                <div className="input-group">

                  <label htmlFor="password">
                    New password
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <small className="password-hint">
                    Use at least 8 characters.
                  </small>

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="input-group">

                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />

                </div>


                <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >

                  {loading
                    ? "Resetting..."
                    : (
                      <>
                        Reset password
                        <span>→</span>
                      </>
                    )}

                </button>


              </form>

            )}


            {message ? (

              <div className="auth-switch">

                Redirecting to login...

              </div>

            ) : (

              <div className="auth-switch">

                Remember your password?

                <Link to="/login">
                  Back to login
                </Link>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ResetPassword;