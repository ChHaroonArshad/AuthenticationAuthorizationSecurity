import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Registration success state
  const [registered, setRegistered] = useState(false);
  const [countdown, setCountdown] = useState(12);

  // =========================
  // PASSWORD RULES
  // =========================

  const passwordRules = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const passwordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  // =========================
  // AUTO REDIRECT AFTER SUCCESS
  // =========================

  useEffect(() => {
    if (!registered) return;

    if (countdown <= 0) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [registered, countdown, navigate]);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  // =========================
  // FRONTEND VALIDATION
  // =========================

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (!passwordValid) {
      newErrors.password =
        "Password does not meet all the requirements.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // REGISTER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before sending request
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        "http://localhost:3000/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      // =========================
      // BACKEND ERROR
      // =========================

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
              data.message || "Registration failed.",
          });
        }

        return;
      }

      // =========================
      // REGISTRATION SUCCESS
      // =========================

      setRegistered(true);
      setCountdown(12);

    } catch (error) {
      console.error(error);

      setErrors({
        general:
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SUCCESS SCREEN
  // =========================

  if (registered) {
    return (
      <>
        <style>{styles}</style>

        <div className="register-page">
          <div className="success-card">

            <div className="success-icon">
              ✓
            </div>

            <p className="success-label">
              ACCOUNT CREATED
            </p>

            <h1>
              Check your email
            </h1>

            <p className="success-text">
              Your account has been created successfully.
              We have sent a verification link to:
            </p>

            <div className="email-box">
              {formData.email}
            </div>

            <div className="success-warning">
              <span>✉</span>
              <div>
                <strong>Verify your email</strong>
                <p>
                  Open the email and click the verification
                  link to activate your account.
                </p>
              </div>
            </div>

            <div className="redirect-box">
              <div className="redirect-loader"></div>

              <p>
                Redirecting to login in{" "}
                <strong>{countdown}</strong> seconds...
              </p>
            </div>

            <button
              className="login-now-button"
              onClick={() => navigate("/login")}
            >
              Go to Login →
            </button>

          </div>
        </div>
      </>
    );
  }

  // =========================
  // REGISTER PAGE
  // =========================

  return (
    <>
      <style>{styles}</style>

      <div className="register-page">

        <div className="register-card">

          {/* =========================
              LEFT SIDE
          ========================= */}

          <div className="register-brand">

            <div className="brand-logo">
              <div className="brand-icon">
                A
              </div>

              <span>
                ArtSpace
              </span>
            </div>

            <div className="brand-content">

              <div className="brand-badge">
                ✦ JOIN THE COMMUNITY
              </div>

              <h1>
                Your art.
                <br />
                <span>Your story.</span>
              </h1>

              <p>
                Create your account and become part
                of a creative community built for
                artists, collectors and people who
                love art.
              </p>

            </div>

            <div className="brand-bottom">

              <div className="mini-stat">
                <strong>01</strong>
                <span>Create</span>
              </div>

              <div className="stat-line"></div>

              <div className="mini-stat">
                <strong>02</strong>
                <span>Connect</span>
              </div>

              <div className="stat-line"></div>

              <div className="mini-stat">
                <strong>03</strong>
                <span>Inspire</span>
              </div>

            </div>

          </div>


          {/* =========================
              FORM SIDE
          ========================= */}

          <div className="register-form">

            <div className="form-top">

              <span>
                ALREADY A MEMBER?
              </span>

              <Link to="/login">
                Sign in →
              </Link>

            </div>


            <div className="mobile-brand">

              <div className="brand-icon">
                A
              </div>

              ArtSpace

            </div>


            <div className="register-heading">

              <p className="heading-label">
                CREATE ACCOUNT
              </p>

              <h2>
                Start creating.
              </h2>

              <p>
                Set up your account in less than a minute.
              </p>

            </div>


            {/* GENERAL ERROR */}

            {errors.general && (
              <div className="register-error">
                <span>!</span>
                {errors.general}
              </div>
            )}


            <form onSubmit={handleSubmit}>

              {/* =========================
                  NAME
              ========================= */}

              <div className="register-input">

                <label htmlFor="name">
                  FULL NAME
                </label>

                <div
                  className={`input-wrapper ${
                    errors.name ? "input-error" : ""
                  }`}
                >

                  <span className="input-icon">
                    ◯
                  </span>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                </div>

                {errors.name && (
                  <small>
                    {errors.name}
                  </small>
                )}

              </div>


              {/* =========================
                  EMAIL
              ========================= */}

              <div className="register-input">

                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>

                <div
                  className={`input-wrapper ${
                    errors.email ? "input-error" : ""
                  }`}
                >

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />

                </div>

                {errors.email && (
                  <small>
                    {errors.email}
                  </small>
                )}

              </div>


              {/* =========================
                  PASSWORD
              ========================= */}

              <div className="register-input">

                <div className="password-label">

                  <label htmlFor="password">
                    PASSWORD
                  </label>

                  <span>
                    Strong password required
                  </span>

                </div>

                <div
                  className={`input-wrapper ${
                    errors.password ? "input-error" : ""
                  }`}
                >

                  <span className="input-icon">
                    ◆
                  </span>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                </div>


                {/* PASSWORD REQUIREMENTS */}

                <div className="password-requirements">

                  <PasswordRule
                    valid={passwordRules.length}
                    text="At least 8 characters"
                  />

                  <PasswordRule
                    valid={passwordRules.uppercase}
                    text="One uppercase letter"
                  />

                  <PasswordRule
                    valid={passwordRules.lowercase}
                    text="One lowercase letter"
                  />

                  <PasswordRule
                    valid={passwordRules.number}
                    text="One number"
                  />

                  <PasswordRule
                    valid={passwordRules.special}
                    text="One special character"
                  />

                </div>

                {errors.password && (
                  <small>
                    {errors.password}
                  </small>
                )}

              </div>


              {/* =========================
                  BUTTON
              ========================= */}

              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create my account
                    <span>→</span>
                  </>
                )}

              </button>

            </form>


            <div className="register-footer">

              <span>
                By creating an account, you agree to our
                terms and privacy policy.
              </span>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}


// =====================================
// PASSWORD RULE COMPONENT
// =====================================

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`password-rule ${
        valid ? "valid" : ""
      }`}
    >
      <span className="rule-icon">
        {valid ? "✓" : "○"}
      </span>

      <span>
        {text}
      </span>
    </div>
  );
}


// =====================================
// INLINE CSS
// =====================================

const styles = `

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  background: #f4f1eb;
  color: #171717;
}


/* =====================================
   PAGE
===================================== */

.register-page {
  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 30px;

  background:
    radial-gradient(
      circle at 10% 10%,
      #ffffff 0,
      #f4f1eb 40%,
      #eeeae2 100%
    );
}


/* =====================================
   MAIN CARD
===================================== */

.register-card {
  width: 1100px;
  max-width: 100%;

  min-height: 700px;

  display: grid;
  grid-template-columns: 45% 55%;

  background: white;

  border-radius: 28px;

  overflow: hidden;

  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.12);
}


/* =====================================
   LEFT BRAND
===================================== */

.register-brand {
  position: relative;

  padding: 50px;

  background:
    radial-gradient(
      circle at 80% 10%,
      #383838 0,
      #181818 40%,
      #090909 100%
    );

  color: white;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  overflow: hidden;
}

.register-brand::before {
  content: "";

  position: absolute;

  width: 500px;
  height: 500px;

  border-radius: 50%;

  border: 1px solid rgba(255,255,255,0.08);

  right: -250px;
  top: -180px;
}

.register-brand::after {
  content: "";

  position: absolute;

  width: 350px;
  height: 350px;

  border-radius: 50%;

  border: 1px solid rgba(255,255,255,0.06);

  left: -200px;
  bottom: -170px;
}


/* =====================================
   BRAND LOGO
===================================== */

.brand-logo {
  display: flex;
  align-items: center;

  gap: 12px;

  font-size: 21px;
  font-weight: 700;

  position: relative;
  z-index: 2;
}

.brand-icon {
  width: 40px;
  height: 40px;

  border-radius: 12px;

  background: #d7ff5f;

  color: #171717;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 900;
}


/* =====================================
   BRAND CONTENT
===================================== */

.brand-content {
  position: relative;
  z-index: 2;

  max-width: 420px;
}

.brand-badge {
  display: inline-block;

  margin-bottom: 25px;

  color: #d7ff5f;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 2px;
}

.brand-content h1 {
  margin: 0;

  font-size: 58px;

  line-height: 0.98;

  letter-spacing: -3px;
}

.brand-content h1 span {
  color: #d7ff5f;
}

.brand-content p {
  margin-top: 28px;

  max-width: 380px;

  color: #a7a7a7;

  font-size: 15px;

  line-height: 1.7;
}


/* =====================================
   BRAND BOTTOM
===================================== */

.brand-bottom {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;

  gap: 18px;
}

.mini-stat {
  display: flex;
  flex-direction: column;

  gap: 5px;
}

.mini-stat strong {
  color: #d7ff5f;

  font-size: 13px;
}

.mini-stat span {
  color: #999;

  font-size: 10px;

  text-transform: uppercase;

  letter-spacing: 1px;
}

.stat-line {
  width: 35px;
  height: 1px;

  background: #444;
}


/* =====================================
   FORM
===================================== */

.register-form {
  padding: 45px 65px;

  display: flex;
  flex-direction: column;
}


/* =====================================
   TOP LINK
===================================== */

.form-top {
  display: flex;

  justify-content: flex-end;
  align-items: center;

  gap: 10px;

  color: #999;

  font-size: 11px;
}

.form-top a {
  color: #171717;

  font-weight: 700;

  text-decoration: none;

  transition: 0.2s;
}

.form-top a:hover {
  opacity: 0.55;
}


/* =====================================
   MOBILE BRAND
===================================== */

.mobile-brand {
  display: none;

  align-items: center;

  gap: 10px;

  font-weight: 700;
}


/* =====================================
   HEADING
===================================== */

.register-heading {
  margin-top: 48px;

  margin-bottom: 30px;
}

.heading-label {
  margin: 0 0 12px;

  color: #999;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 2px;
}

.register-heading h2 {
  margin: 0;

  font-size: 40px;

  line-height: 1.1;

  letter-spacing: -1.8px;
}

.register-heading > p:last-child {
  margin-top: 10px;

  color: #888;

  font-size: 14px;
}


/* =====================================
   GENERAL ERROR
===================================== */

.register-error {
  display: flex;
  align-items: center;

  gap: 9px;

  margin-bottom: 20px;

  padding: 12px 14px;

  border-radius: 10px;

  border: 1px solid #ffd0cc;

  background: #fff2f1;

  color: #c62828;

  font-size: 12px;
}

.register-error span {
  width: 19px;
  height: 19px;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #c62828;

  color: white;

  font-weight: 800;

  font-size: 11px;
}


/* =====================================
   INPUT
===================================== */

.register-input {
  margin-bottom: 20px;
}

.register-input label {
  display: block;

  margin-bottom: 8px;

  color: #555;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 1.4px;
}

.password-label {
  display: flex;

  align-items: center;
  justify-content: space-between;
}

.password-label label {
  margin-bottom: 8px;
}

.password-label span {
  color: #aaa;

  font-size: 10px;
}


/* =====================================
   INPUT WRAPPER
===================================== */

.input-wrapper {
  height: 54px;

  display: flex;
  align-items: center;

  padding: 0 16px;

  border: 1px solid #dedede;

  border-radius: 12px;

  background: #fafafa;

  transition:
    border 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #171717;

  background: white;

  box-shadow:
    0 0 0 4px rgba(23,23,23,0.05);
}

.input-wrapper.input-error {
  border-color: #e05a52;

  background: #fffafa;
}

.input-icon {
  width: 30px;

  color: #999;

  font-size: 14px;
}

.input-wrapper input {
  flex: 1;

  width: 100%;

  border: none;

  outline: none;

  background: transparent;

  color: #171717;

  font-size: 14px;
}

.input-wrapper input::placeholder {
  color: #b5b5b5;
}


/* =====================================
   FIELD ERROR
===================================== */

.register-input small {
  display: block;

  margin-top: 7px;

  color: #d93025;

  font-size: 11px;
}


/* =====================================
   PASSWORD REQUIREMENTS
===================================== */

.password-requirements {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 7px 12px;

  margin-top: 11px;

  padding: 12px;

  border-radius: 10px;

  background: #f7f7f7;

  border: 1px solid #eeeeee;
}

.password-rule {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #999;

  font-size: 11px;

  transition: 0.2s;
}

.password-rule.valid {
  color: #287a45;
}

.rule-icon {
  width: 16px;
  height: 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  font-size: 10px;

  font-weight: 800;
}

.password-rule.valid .rule-icon {
  background: #dff6e7;

  color: #287a45;
}


/* =====================================
   BUTTON
===================================== */

.register-button {
  width: 100%;

  height: 56px;

  margin-top: 4px;

  border: none;

  border-radius: 12px;

  background: #171717;

  color: white;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 14px;

  transition: 0.2s ease;
}

.register-button:hover:not(:disabled) {
  background: #2c2c2c;

  transform: translateY(-1px);
}

.register-button:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}

.register-button span:last-child {
  font-size: 20px;
}


/* =====================================
   SPINNER
===================================== */

.spinner {
  width: 16px;
  height: 16px;

  border: 2px solid #777;

  border-top-color: white;

  border-radius: 50%;

  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =====================================
   FOOTER
===================================== */

.register-footer {
  margin-top: 18px;

  text-align: center;
}

.register-footer span {
  color: #aaa;

  font-size: 10px;

  line-height: 1.5;
}


/* =====================================
   SUCCESS PAGE
===================================== */

.success-card {
  width: 520px;

  max-width: 100%;

  padding: 55px 50px;

  background: white;

  border-radius: 24px;

  text-align: center;

  box-shadow:
    0 30px 80px rgba(0,0,0,0.12);
}

.success-icon {
  width: 70px;
  height: 70px;

  margin: 0 auto 25px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #e4f8eb;

  color: #287a45;

  font-size: 32px;

  font-weight: 800;
}

.success-label {
  margin: 0 0 12px;

  color: #287a45;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 2px;
}

.success-card h1 {
  margin: 0;

  font-size: 38px;

  letter-spacing: -1.5px;
}

.success-text {
  margin: 15px auto 20px;

  max-width: 390px;

  color: #777;

  font-size: 14px;

  line-height: 1.6;
}

.email-box {
  padding: 13px;

  margin-bottom: 20px;

  border-radius: 10px;

  background: #f6f6f6;

  color: #171717;

  font-size: 13px;

  font-weight: 600;

  word-break: break-word;
}

.success-warning {
  display: flex;

  align-items: flex-start;

  gap: 12px;

  text-align: left;

  padding: 15px;

  border-radius: 12px;

  background: #fff9e9;

  border: 1px solid #f5e4b5;

  color: #755d20;

  font-size: 12px;
}

.success-warning > span {
  font-size: 18px;
}

.success-warning strong {
  display: block;

  margin-bottom: 4px;
}

.success-warning p {
  margin: 0;

  line-height: 1.5;
}


/* =====================================
   REDIRECT
===================================== */

.redirect-box {
  margin-top: 25px;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 8px;
}

.redirect-box p {
  margin: 0;

  color: #888;

  font-size: 12px;
}

.redirect-box strong {
  color: #171717;
}

.redirect-loader {
  width: 24px;
  height: 24px;

  border: 3px solid #e5e5e5;

  border-top-color: #171717;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}


/* =====================================
   LOGIN BUTTON
===================================== */

.login-now-button {
  width: 100%;

  height: 50px;

  margin-top: 20px;

  border: none;

  border-radius: 10px;

  background: #171717;

  color: white;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;

  transition: 0.2s;
}

.login-now-button:hover {
  background: #333;

  transform: translateY(-1px);
}


/* =====================================
   RESPONSIVE
===================================== */

@media (max-width: 850px) {

  .register-page {
    padding: 15px;
  }

  .register-card {
    grid-template-columns: 1fr;

    max-width: 550px;

    min-height: auto;
  }

  .register-brand {
    display: none;
  }

  .register-form {
    padding: 35px 30px;
  }

  .mobile-brand {
    display: flex;

    margin-bottom: 35px;
  }

  .register-heading {
    margin-top: 0;
  }

}


@media (max-width: 500px) {

  .register-page {
    padding: 0;

    background: white;
  }

  .register-card {
    min-height: 100vh;

    border-radius: 0;

    box-shadow: none;
  }

  .register-form {
    padding: 25px 20px;
  }

  .register-heading h2 {
    font-size: 32px;
  }

  .password-requirements {
    grid-template-columns: 1fr;
  }

  .success-card {
    min-height: 100vh;

    border-radius: 0;

    box-shadow: none;

    padding: 45px 25px;
  }

  .success-card h1 {
    font-size: 32px;
  }

}
`;

export default Register;