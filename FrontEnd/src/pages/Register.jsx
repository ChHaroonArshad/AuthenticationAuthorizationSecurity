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

  // Registration success
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(12);

  // =========================================
  // PASSWORD VALIDATION RULES
  // =========================================

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


  // =========================================
  // AUTO REDIRECT AFTER SUCCESS
  // =========================================

  useEffect(() => {
    if (!success) return;

    if (countdown <= 0) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);

  }, [success, countdown, navigate]);


  // =========================================
  // HANDLE INPUT
  // =========================================

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


  // =========================================
  // FRONTEND VALIDATION
  // =========================================

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must contain at least 2 characters.";
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


  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't submit again after success
    if (success) return;

    setErrors({});

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setLoading(true);

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


      // =========================================
      // BACKEND ERROR
      // =========================================

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
              "Registration failed. Please try again.",
          });
        }

        return;
      }


      // =========================================
      // SUCCESS
      // =========================================

      setSuccess(true);
      setCountdown(12);

    } catch (error) {
      console.error("Registration error:", error);

      setErrors({
        general:
          "Unable to connect to the server. Please try again.",
      });

    } finally {
      setLoading(false);
    }
  };


  // =========================================
  // PASSWORD RULE COMPONENT
  // =========================================

  const PasswordRule = ({ valid, children }) => (
    <div className={`password-rule ${valid ? "valid" : ""}`}>
      <span className="rule-icon">
        {valid ? "✓" : "○"}
      </span>

      <span>{children}</span>
    </div>
  );


  return (
    <>
      <style>{`

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


        /* =========================================
           PAGE
        ========================================= */

        .register-page {
          min-height: 100vh;
          padding: 30px;

          display: flex;
          align-items: center;
          justify-content: center;
        }


        /* =========================================
           MAIN CARD
        ========================================= */

        .register-card {
          width: 100%;
          max-width: 1120px;
          min-height: 720px;

          display: grid;
          grid-template-columns: 44% 56%;

          background: #ffffff;

          border-radius: 28px;
          overflow: hidden;

          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.12);
        }


        /* =========================================
           LEFT BRAND
        ========================================= */

        .register-brand {
          position: relative;

          padding: 48px;

          background:
            radial-gradient(
              circle at 20% 20%,
              #343434,
              #171717 50%,
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

          width: 450px;
          height: 450px;

          border-radius: 50%;

          border: 1px solid rgba(255, 255, 255, 0.08);

          right: -220px;
          top: -120px;
        }


        .register-brand::after {
          content: "";

          position: absolute;

          width: 300px;
          height: 300px;

          border-radius: 50%;

          border: 1px solid rgba(255, 255, 255, 0.06);

          left: -170px;
          bottom: -130px;
        }


        /* =========================================
           LOGO
        ========================================= */

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

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: #d7ff5f;
          color: #171717;

          font-weight: 900;
        }


        /* =========================================
           BRAND CONTENT
        ========================================= */

        .brand-content {
          position: relative;
          z-index: 2;

          max-width: 410px;
        }


        .brand-badge {
          display: inline-block;

          margin-bottom: 22px;

          color: #d7ff5f;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 2px;
        }


        .brand-content h1 {
          margin: 0;

          font-size: clamp(48px, 5vw, 64px);

          line-height: 0.96;

          letter-spacing: -4px;
        }


        .brand-content h1 span {
          color: #d7ff5f;
        }


        .brand-content p {
          margin-top: 28px;

          max-width: 370px;

          color: #a8a8a8;

          font-size: 15px;
          line-height: 1.7;
        }


        /* =========================================
           BRAND BOTTOM
        ========================================= */

        .brand-bottom {
          display: flex;
          align-items: center;
          gap: 16px;

          position: relative;
          z-index: 2;
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
          color: #888;

          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }


        .stat-line {
          width: 30px;
          height: 1px;
          background: #444;
        }


        /* =========================================
           FORM SIDE
        ========================================= */

        .register-form {
          padding: 45px 65px;

          display: flex;
          flex-direction: column;
        }


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


        /* =========================================
           HEADING
        ========================================= */

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

          color: #171717;

          font-size: 40px;
          line-height: 1;

          letter-spacing: -2px;
        }


        .register-heading > p:last-child {
          margin-top: 12px;

          color: #888;

          font-size: 14px;
        }


        .mobile-brand {
          display: none;
        }


        /* =========================================
           GENERAL ERROR
        ========================================= */

        .register-error {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 20px;

          padding: 13px 15px;

          border: 1px solid #ffd1ce;
          border-radius: 10px;

          background: #fff2f1;

          color: #c62828;

          font-size: 12px;
        }


        .register-error-icon {
          width: 20px;
          height: 20px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #c62828;
          color: white;

          font-size: 11px;
          font-weight: 700;
        }


        /* =========================================
           SUCCESS
        ========================================= */

        .register-success {
          margin-bottom: 24px;

          padding: 17px;

          border: 1px solid #b7e4c7;
          border-radius: 12px;

          background: #f0fff4;

          color: #287a45;

          animation: successAppear 0.35s ease;
        }


        @keyframes successAppear {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        .success-title {
          margin-bottom: 5px;

          font-size: 14px;
          font-weight: 700;
        }


        .success-text {
          margin: 0;

          font-size: 13px;
          line-height: 1.5;
        }


        .success-countdown {
          display: block;

          margin-top: 9px;

          color: #57906b;

          font-size: 11px;
        }


        /* =========================================
           INPUT
        ========================================= */

        .register-input {
          margin-bottom: 20px;
        }


        .register-input label,
        .password-label label {
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


        .password-label span {
          color: #aaa;
          font-size: 10px;
        }


        .input-wrapper {
          height: 54px;

          display: flex;
          align-items: center;

          padding: 0 15px;

          border: 1px solid #dedede;
          border-radius: 12px;

          background: #fafafa;

          transition: 0.2s ease;
        }


        .input-wrapper:focus-within {
          border-color: #171717;

          background: white;

          box-shadow:
            0 0 0 4px rgba(23, 23, 23, 0.05);
        }


        .input-wrapper.has-error {
          border-color: #e0524d;
          background: #fffafa;
        }


        .input-icon {
          width: 30px;

          color: #999;

          font-size: 14px;
        }


        .input-wrapper input {
          width: 100%;

          flex: 1;

          border: none;
          outline: none;

          background: transparent;

          color: #171717;

          font-size: 14px;
        }


        .input-wrapper input::placeholder {
          color: #b5b5b5;
        }


        .field-error {
          display: block;

          margin-top: 7px;

          color: #c62828;

          font-size: 11px;
          line-height: 1.4;
        }


        /* =========================================
           PASSWORD REQUIREMENTS
        ========================================= */

        .password-requirements {
          margin-top: 10px;
          padding: 12px 13px;

          border: 1px solid #eeeeee;
          border-radius: 10px;

          background: #fafafa;
        }


        .requirements-title {
          margin-bottom: 8px;

          color: #777;

          font-size: 10px;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: 1px;
        }


        .password-rules {
          display: grid;
          grid-template-columns: 1fr 1fr;

          gap: 6px 10px;
        }


        .password-rule {
          display: flex;
          align-items: center;
          gap: 7px;

          color: #999;

          font-size: 11px;

          transition: 0.2s ease;
        }


        .rule-icon {
          width: 15px;
          height: 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: #aaa;

          font-size: 10px;
        }


        .password-rule.valid {
          color: #287a45;
        }


        .password-rule.valid .rule-icon {
          background: #dff5e7;
          color: #287a45;

          font-weight: 800;
        }


        /* =========================================
           BUTTON
        ========================================= */

        .register-button {
          width: 100%;
          height: 56px;

          border: none;
          border-radius: 12px;

          background: #171717;
          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 13px;

          font-size: 13px;
          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .register-button:hover:not(:disabled) {
          background: #303030;

          transform: translateY(-1px);
        }


        .register-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }


        .register-button-arrow {
          font-size: 20px;
          line-height: 0;
        }


        /* =========================================
           SPINNER
        ========================================= */

        .spinner {
          width: 16px;
          height: 16px;

          border: 2px solid #666;
          border-top-color: white;

          border-radius: 50%;

          animation: spin 0.7s linear infinite;
        }


        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }


        /* =========================================
           FOOTER
        ========================================= */

        .register-footer {
          margin-top: 18px;

          text-align: center;
        }


        .register-footer span {
          color: #aaa;

          font-size: 10px;
          line-height: 1.5;
        }


        /* =========================================
           RESPONSIVE
        ========================================= */

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

            align-items: center;
            gap: 10px;

            margin-bottom: 35px;

            font-size: 20px;
            font-weight: 700;
          }

          .mobile-brand .brand-icon {
            width: 34px;
            height: 34px;

            border-radius: 10px;
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
            font-size: 33px;
          }

          .password-rules {
            grid-template-columns: 1fr;
          }

          .form-top {
            font-size: 10px;
          }
        }

      `}</style>


      {/* =========================================
          PAGE
      ========================================= */}

      <div className="register-page">

        <div className="register-card">


          {/* =====================================
              LEFT BRAND PANEL
          ===================================== */}

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


          {/* =====================================
              FORM
          ===================================== */}

          <div className="register-form">


            {/* TOP LOGIN LINK */}

            <div className="form-top">

              <span>
                ALREADY A MEMBER?
              </span>

              <Link to="/login">
                Sign in →
              </Link>

            </div>


            {/* HEADING */}

            <div className="register-heading">

              <div className="mobile-brand">

                <div className="brand-icon">
                  A
                </div>

                ArtSpace

              </div>

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


            {/* =====================================
                SUCCESS MESSAGE
            ===================================== */}

            {success && (

              <div className="register-success">

                <div className="success-title">
                  Account created successfully! 🎉
                </div>

                <p className="success-text">
                  We've sent a verification link to your
                  email address. Please check your inbox
                  and verify your email.
                </p>

                <small className="success-countdown">
                  Redirecting to login in {countdown} seconds...
                </small>

              </div>

            )}


            {/* =====================================
                GENERAL ERROR
            ===================================== */}

            {errors.general && !success && (

              <div className="register-error">

                <span className="register-error-icon">
                  !
                </span>

                {errors.general}

              </div>

            )}


            {/* =====================================
                FORM
            ===================================== */}

            <form onSubmit={handleSubmit}>


              {/* NAME */}

              <div className="register-input">

                <label htmlFor="name">
                  FULL NAME
                </label>

                <div
                  className={`input-wrapper ${
                    errors.name ? "has-error" : ""
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
                    disabled={success}
                    autoComplete="name"
                  />

                </div>

                {errors.name && (
                  <span className="field-error">
                    {errors.name}
                  </span>
                )}

              </div>


              {/* EMAIL */}

              <div className="register-input">

                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>

                <div
                  className={`input-wrapper ${
                    errors.email ? "has-error" : ""
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
                    disabled={success}
                    autoComplete="email"
                  />

                </div>

                {errors.email && (
                  <span className="field-error">
                    {errors.email}
                  </span>
                )}

              </div>


              {/* PASSWORD */}

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
                    errors.password ? "has-error" : ""
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
                    disabled={success}
                    autoComplete="new-password"
                  />

                </div>


                {/* PASSWORD REQUIREMENTS */}

                <div className="password-requirements">

                  <div className="requirements-title">
                    Password must contain
                  </div>


                  <div className="password-rules">

                    <PasswordRule
                      valid={passwordRules.length}
                    >
                      At least 8 characters
                    </PasswordRule>


                    <PasswordRule
                      valid={passwordRules.uppercase}
                    >
                      One uppercase letter
                    </PasswordRule>


                    <PasswordRule
                      valid={passwordRules.lowercase}
                    >
                      One lowercase letter
                    </PasswordRule>


                    <PasswordRule
                      valid={passwordRules.number}
                    >
                      One number
                    </PasswordRule>


                    <PasswordRule
                      valid={passwordRules.special}
                    >
                      One special character
                    </PasswordRule>

                  </div>

                </div>


                {errors.password && (
                  <span className="field-error">
                    {errors.password}
                  </span>
                )}

              </div>


              {/* =====================================
                  BUTTON
              ===================================== */}

              <button
                type="submit"
                className="register-button"
                disabled={loading || success}
              >

                {loading ? (

                  <>
                    <span className="spinner"></span>
                    Creating account...
                  </>

                ) : success ? (

                  <>
                    Account created ✓
                  </>

                ) : (

                  <>
                    Create my account

                    <span className="register-button-arrow">
                      →
                    </span>
                  </>

                )}

              </button>

            </form>


            {/* FOOTER */}

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

export default Register;