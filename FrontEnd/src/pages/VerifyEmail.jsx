import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  const [status, setStatus] = useState("loading"); // loading | success | expired | invalid | already | error
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", text: string }
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/verify-email/${token}`);
        const msg = response.data.message;

        if (msg === "Email verified successfully") {
          setStatus("success");
          setToast({ type: "success", text: "Email verified successfully" });
        } else if (msg === "Email is already verified") {
          setStatus("already");
          setToast({ type: "success", text: "Your email is already verified" });
        } else {
          setStatus("invalid");
          setToast({ type: "error", text: msg || "This link is invalid" });
        }
      } catch (error) {
        const msg = error.response?.data?.message;
        if (msg === "Verification link has expired") {
          setStatus("expired");
          setToast({ type: "error", text: "This verification link has expired" });
        } else if (msg === "Email is already verified") {
          setStatus("already");
          setToast({ type: "success", text: "Your email is already verified" });
        } else if (error.request && !error.response) {
          setStatus("error");
          setToast({ type: "error", text: "Couldn't reach the server" });
        } else {
          setStatus("invalid");
          setToast({ type: "error", text: msg || "This link is invalid" });
        }
      }
    };
    verify();
  }, [token]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (status !== "success" && status !== "already") return;
    if (countdown <= 0) {
      navigate("/login");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;

    setResendLoading(true);
    setResendSuccess(false);
    try {
      await axios.post("http://localhost:3000/user/resend-verification", { email });
      setResendSuccess(true);
      setToast({ type: "success", text: "New verification link sent" });
    } catch (error) {
      setToast({ type: "error", text: error.response?.data?.message || "Failed to resend" });
    } finally {
      setResendLoading(false);
    }
  };

  const seal = status === "loading" ? "pending" : status === "success" || status === "already" ? "check" : status === "expired" ? "crack" : "cross";

  return (
    <div className="ve-page">
      <style>{`
        .ve-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #201a16;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .ve-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: #2b241e;
          border: 1px solid #4a3f34;
          border-radius: 6px;
          padding: 48px 36px 36px;
          text-align: center;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
          animation: veFadeUp 0.35s ease;
        }
        @keyframes veFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ve-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          border: 1.5px solid #6b5a45;
        }
        .ve-corner.tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
        .ve-corner.tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
        .ve-corner.bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
        .ve-corner.br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

        .ve-seal-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .ve-seal {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: #3a3128;
          border: 2px solid #c79a4b;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .ve-seal.state-cross { border-color: #c58b7a; }
        .ve-seal.state-crack { border-color: #c58b7a; }
        .ve-seal::before {
          content: "";
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          border: 1px solid #6b5a45;
        }
        .ve-seal svg {
          width: 32px;
          height: 32px;
          position: relative;
          z-index: 1;
        }
        @media (prefers-reduced-motion: no-preference) {
          .ve-seal.settle { animation: veSettle 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
          .ve-seal.pending svg { animation: veSpin 1.1s linear infinite; transform-origin: center; }
        }
        @keyframes veSettle {
          0% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes veSpin {
          to { transform: rotate(360deg); }
        }

        .ve-heading {
          font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
          font-size: 24px;
          font-weight: 500;
          color: #f1e9dd;
          margin: 0 0 10px;
          letter-spacing: 0.2px;
        }
        .ve-text {
          font-size: 14px;
          line-height: 1.6;
          color: #a79885;
          margin: 0 0 28px;
        }
        .ve-eyebrow {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #8a7a63;
          margin: 0 0 6px;
        }
        .ve-countdown {
          font-size: 13px;
          color: #9fb87a;
          margin-top: 4px;
        }

        .ve-button {
          width: 100%;
          padding: 13px 20px;
          background: transparent;
          border: 1px solid #c79a4b;
          color: #ecd8a8;
          font-size: 14px;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .ve-button:hover:not(:disabled) { background: #c79a4b; color: #201a16; }
        .ve-button:focus-visible { outline: 2px solid #c79a4b; outline-offset: 2px; }
        .ve-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .ve-button-ghost {
          width: 100%;
          margin-top: 10px;
          padding: 11px 20px;
          background: transparent;
          border: 1px solid #4a3f34;
          color: #a79885;
          font-size: 13px;
          border-radius: 4px;
          cursor: pointer;
        }
        .ve-button-ghost:hover { border-color: #6b5a45; color: #f1e9dd; }

        .ve-form { text-align: left; margin-top: 4px; }
        .ve-label { display: block; font-size: 12px; color: #a79885; margin-bottom: 6px; }
        .ve-input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 14px;
          margin-bottom: 16px;
          background: #201a16;
          border: 1px solid #4a3f34;
          border-radius: 4px;
          color: #f1e9dd;
          font-size: 14px;
        }
        .ve-input::placeholder { color: #6b5a45; }
        .ve-input:focus-visible { outline: 2px solid #c79a4b; outline-offset: 1px; }

        .ve-toast-stack {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ve-toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 13px;
          color: #201a16;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
          animation: veToastIn 0.25s ease;
          max-width: 300px;
        }
        .ve-toast.success { background: #cfe0a8; }
        .ve-toast.error { background: #e3ab9e; }
        @keyframes veToastIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @media (max-width: 420px) {
          .ve-card { padding: 40px 24px 28px; }
          .ve-seal { width: 72px; height: 72px; }
          .ve-toast-stack { left: 20px; right: 20px; }
          .ve-toast { max-width: none; }
        }
      `}</style>

      {toast && (
        <div className="ve-toast-stack">
          <div className={`ve-toast ${toast.type}`}>{toast.text}</div>
        </div>
      )}

      <div className="ve-card">
        <span className="ve-corner tl" aria-hidden="true" />
        <span className="ve-corner tr" aria-hidden="true" />
        <span className="ve-corner bl" aria-hidden="true" />
        <span className="ve-corner br" aria-hidden="true" />

        <div className="ve-seal-wrap">
          <div className={`ve-seal state-${seal} ${status === "loading" ? "pending" : "settle"}`}>
            {seal === "pending" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="#c79a4b" strokeWidth="2">
                <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
              </svg>
            )}
            {seal === "check" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="#c79a4b" strokeWidth="2.2">
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {seal === "cross" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="#c58b7a" strokeWidth="2.2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            )}
            {seal === "crack" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="#c58b7a" strokeWidth="1.6">
                <path d="M9 4l2 4-2.5 3L11 14l-1.5 6M15 5l-1.5 4L16 12l-2 3.5L15 20" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>

        {status === "loading" && (
          <>
            <p className="ve-eyebrow">Email authentication</p>
            <h2 className="ve-heading">Verifying your email</h2>
            <p className="ve-text">This only takes a moment.</p>
          </>
        )}

        {(status === "success" || status === "already") && (
          <>
            <p className="ve-eyebrow">Email authentication</p>
            <h2 className="ve-heading">
              {status === "success" ? "Email verified" : "Already verified"}
            </h2>
            <p className="ve-text">
              {status === "success"
                ? "Your account is ready to go."
                : "This email was already confirmed."}
            </p>
            <p className="ve-countdown">Redirecting to login in {countdown}s…</p>
          </>
        )}

        {status === "expired" && (
          <>
            <p className="ve-eyebrow">Link expired</p>
            <h2 className="ve-heading">This link has expired</h2>
            <p className="ve-text">Enter your email and we'll send a fresh verification link.</p>
            <form onSubmit={handleResend} className="ve-form">
              <label className="ve-label" htmlFor="ve-email">Email address</label>
              <input
                id="ve-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ve-input"
              />
              <button type="submit" disabled={resendLoading} className="ve-button">
                {resendLoading ? "Sending…" : "Resend verification link"}
              </button>
            </form>
            {resendSuccess && <p className="ve-countdown">Check your inbox for the new link.</p>}
          </>
        )}

        {(status === "invalid" || status === "error") && (
          <>
            <p className="ve-eyebrow">Email authentication</p>
            <h2 className="ve-heading">
              {status === "error" ? "Couldn't reach the server" : "This link is invalid"}
            </h2>
            <p className="ve-text">
              {status === "error"
                ? "Check your connection and try again."
                : "Request a new verification link from the login page."}
            </p>
            <button className="ve-button-ghost" onClick={() => navigate("/login")}>
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;