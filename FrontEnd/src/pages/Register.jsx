import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

    // Remove error for the field when user starts correcting it
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend/Zod validation errors
        if (data.errors) {
          const formattedErrors = {};

          Object.entries(data.errors).forEach(([field, message]) => {
            const cleanField = field.replace("body.", "");
            formattedErrors[cleanField] = message;
          });

          setErrors(formattedErrors);
        } else {
          setErrors({
            general: data.message || "Registration failed",
          });
        }

        return;
      }

      navigate("/login");

    } catch (error) {
      setErrors({
        general: "Unable to connect to the server",
      });
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
              <span>●</span> ArtSpace
            </div>

            <div className="visual-text">

              <p className="eyebrow">
                YOUR CREATIVE JOURNEY
              </p>

              <h1>
                Create.
                <br />
                Share.
                <br />
                Inspire.
              </h1>

              <p>
                Join a community where artists and
                collectors connect, discover and create
                something extraordinary.
              </p>

            </div>

            <div className="visual-footer">
              <span>✦</span>
              Built for creators
            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="auth-form-section">

          <div className="auth-form-wrapper">

            <div className="mobile-logo">
              <span>●</span> ArtSpace
            </div>

            <div className="form-header">

              <p className="form-eyebrow">
                GET STARTED
              </p>

              <h2>Create your account</h2>

              <p>
                Start your creative journey with us.
              </p>

            </div>


            {/* General Error */}

            {errors.general && (
              <div className="auth-error">
                {errors.general}
              </div>
            )}


            <form onSubmit={handleSubmit}>

              {/* NAME */}

              <div className="input-group">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Ali Khan"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                {errors.name && (
                  <div className="field-error">
                    {errors.name}
                  </div>
                )}

              </div>


              {/* EMAIL */}

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
                  required
                />

                {errors.email && (
                  <div className="field-error">
                    {errors.email}
                  </div>
                )}

              </div>


              {/* PASSWORD */}

              <div className="input-group">

                <div className="label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <span>
                    Minimum 8 characters
                  </span>

                </div>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />

                {errors.password && (
                  <div className="field-error">
                    {errors.password}
                  </div>
                )}

              </div>


              {/* BUTTON */}

              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create account"
                }

                {!loading && <span>→</span>}
              </button>

            </form>


            <div className="auth-switch">

              Already have an account?

              <Link to="/login">
                Sign in
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;