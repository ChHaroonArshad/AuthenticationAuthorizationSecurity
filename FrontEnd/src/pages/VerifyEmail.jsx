import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Auth.css";

function VerifyEmail() {
  const { token } = useParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  // =========================
  // VERIFY EMAIL
  // =========================

  const verifyEmail = async () => {
    try {
      setStatus("verifying");

      const response = await fetch(
        `http://localhost:3000/user/verify-email/${token}`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Verification failed");
        setStatus("error");
        return;
      }

      setMessage(
        data.message || "Email verified successfully"
      );

      setStatus("success");

    } catch (error) {

      console.error(error);

      setMessage("Unable to connect to the server");
      setStatus("error");
    }
  };


  // =========================
  // RESEND VERIFICATION
  // =========================

  const handleResend = async (e) => {

    e.preventDefault();

    if (!email) {
      setResendMessage("Please enter your email address.");
      return;
    }

    try {

      setResendLoading(true);
      setResendMessage("");

      const response = await fetch(
        "http://localhost:3000/user/resend-verification",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setResendMessage(
          data.message || "Unable to resend verification email"
        );

        return;
      }

      setResendMessage(
        "New verification link has been sent to your email. Check your inbox."
      );

    } catch (error) {

      console.error(error);

      setResendMessage(
        "Unable to connect to the server."
      );

    } finally {

      setResendLoading(false);

    }
  };


  // =========================
  // VERIFY WHEN PAGE LOADS
  // =========================

  useEffect(() => {

    verifyEmail();

  }, [token]);


  return (
    <div className="auth-page">

      <div className="auth-container">

        <div className="auth-form-section">

          <div className="auth-form-wrapper">


            {/* =========================
                VERIFYING
            ========================= */}

            {status === "verifying" && (

              <div className="form-header">

                <p className="form-eyebrow">
                  EMAIL VERIFICATION
                </p>

                <h2>
                  Verifying your email...
                </h2>

                <p>
                  Please wait while we verify your account.
                </p>

              </div>

            )}


            {/* =========================
                SUCCESS
            ========================= */}

            {status === "success" && (

              <div className="form-header">

                <p className="form-eyebrow">
                  EMAIL VERIFIED
                </p>

                <h2>
                  Email verified ✅
                </h2>

                <p>
                  Your email has been successfully verified.
                </p>

                <Link
                  to="/login"
                  className="auth-button"
                  style={{
                    marginTop: "25px",
                    textDecoration: "none",
                  }}
                >
                  Go to Login
                </Link>

              </div>

            )}


            {/* =========================
                ERROR
            ========================= */}

            {status === "error" && (

              <div className="form-header">

                <p className="form-eyebrow">
                  VERIFICATION FAILED
                </p>

                <h2>
                  Verification failed ❌
                </h2>

                <div className="auth-error">
                  {message}
                </div>


                {/* =========================
                    RESEND FORM
                ========================= */}

                {message ===
                  "Verification link has expired" && (

                  <form onSubmit={handleResend}>

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
                        required
                      />

                    </div>


                    <button
                      type="submit"
                      className="auth-button"
                      disabled={resendLoading}
                    >

                      {resendLoading
                        ? "Sending..."
                        : "Resend verification link"}

                    </button>


                    {resendMessage && (

                      <div
                        className={
                          resendMessage.includes("sent")
                            ? "auth-success"
                            : "auth-error"
                        }
                        style={{
                          marginTop: "15px",
                        }}
                      >
                        {resendMessage}
                      </div>

                    )}

                  </form>

                )}


                <Link
                  to="/login"
                  style={{
                    display: "block",
                    marginTop: "20px",
                    textAlign: "center",
                    color: "#171717",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Go to Login
                </Link>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default VerifyEmail;