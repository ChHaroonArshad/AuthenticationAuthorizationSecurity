import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
      general: "",
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrors({});

    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/user/login",
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const formattedErrors = {};

          Object.entries(data.errors).forEach(
            ([field, message]) => {
              const cleanField = field.replace("body.", "");

              formattedErrors[cleanField] = message;
            }
          );

          setErrors(formattedErrors);
        } else {
          setErrors({
            general:
              data.message ||
              "Invalid email or password.",
          });
        }

        return;
      }

      // Access token comes from response
      const accessToken = data.data;

      // Store access token in localStorage
      localStorage.setItem(
        "accessToken",
        accessToken
      );

      console.log("Login successful");

      // Go to Home
      navigate("/home");

    } catch (error) {
      console.error(error);

      setErrors({
        general:
          "Unable to connect to the server.",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        <div className="auth-visual">

          <div className="visual-content">

            <div className="logo">
              User<span>HUB</span>
            </div>

            <div className="visual-text">

              <p className="eyebrow">
                WELCOME BACK
              </p>

              <h1>
                Your space.
                <br />
                Your world.
              </h1>

              <p>
                Sign in to continue managing your
                profile, posts and everything that
                matters to you.
              </p>

            </div>

            <div className="visual-footer">
              Secure authentication
              <span>•</span>
              MongoDB
            </div>

          </div>

        </div>

        <div className="auth-form-section">

          <div className="auth-form-wrapper">

            <div className="mobile-logo">
              User<span>HUB</span>
            </div>

            <div className="form-header">

              <p className="form-eyebrow">
                ACCOUNT LOGIN
              </p>

              <h2>
                Welcome back.
              </h2>

              <p>
                Enter your credentials to access
                your account.
              </p>

            </div>

            {errors.general && (
              <div className="auth-error">
                {errors.general}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              noValidate
            >

              <div className="input-group">

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />

                {errors.email && (
                  <div className="field-error">
                    {errors.email}
                  </div>
                )}

              </div>

              <div className="input-group">

                <div className="label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                <Link
  to="/forgot-password"
  className="forgot"
>
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
                  <div className="field-error">
                    {errors.password}
                  </div>
                )}

              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >

                {loading
                  ? "Signing in..."
                  : (
                    <>
                      Sign in
                      <span>→</span>
                    </>
                  )}

              </button>

            </form>

            <div className="auth-switch">

              Don't have an account?

              <Link to="/register">
                Create an account
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;