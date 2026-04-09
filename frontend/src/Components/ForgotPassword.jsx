import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!email) { setError("Please enter your email address"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong");
      } else {
        setSuccess(data.message);
        setEmail("");
      }
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', system-ui, sans-serif;
          padding: 24px;
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #edf1f6 0%, #e8e8eb 50%, #ffffff 100%);
        }

        .fp-blob {
          position: absolute; border-radius: 50%;
          pointer-events: none; filter: blur(60px);
        }
        .fp-blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(147,197,253,0.55), transparent 70%);
          top: -160px; left: -160px;
        }
        .fp-blob-2 {
          width: 440px; height: 440px;
          background: radial-gradient(circle, rgba(196,181,253,0.5), transparent 70%);
          bottom: -120px; right: -100px;
        }
        .fp-blob-3 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(249,168,212,0.38), transparent 70%);
          top: 40%; left: 60%;
        }
        .fp-blob-4 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(125,211,252,0.35), transparent 70%);
          bottom: 10%; left: 5%;
        }

        .fp-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .fp-shape {
          position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.7);
          pointer-events: none;
          background: rgba(255,255,255,0.1);
        }
        @keyframes fp-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-16px) rotate(8deg); }
        }

        /* Card */
        .fp-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.88);
          border-radius: 28px;
          padding: 48px 40px 40px;
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          box-shadow:
            0 2px 0 rgba(255,255,255,0.95) inset,
            0 32px 80px rgba(99,102,241,0.13),
            0 8px 32px rgba(0,0,0,0.06);
          animation: fp-rise 0.6s cubic-bezier(.34,1.2,.64,1) both;
        }
        .fp-card::before {
          content: '';
          position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent);
        }
        @keyframes fp-rise {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Icon */
        .fp-icon-wrap {
          width: 68px; height: 68px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.65));
          border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 8px 24px rgba(99,102,241,0.14), 0 2px 0 rgba(255,255,255,0.8) inset;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 26px;
          font-size: 28px;
        }

        .fp-heading {
          text-align: center;
          font-size: 26px; font-weight: 800;
          letter-spacing: -0.03em; color: #1e1b4b;
          margin-bottom: 10px; line-height: 1.2;
        }
        .fp-heading span {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fp-sub {
          text-align: center; font-size: 14px;
          line-height: 1.65; color: #6b7280; margin-bottom: 32px;
        }

        .fp-divider {
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
        }
        .fp-divider-line { flex: 1; height: 1px; background: rgba(99,102,241,0.12); }
        .fp-divider-text {
          font-size: 11px; color: #9ca3af;
          white-space: nowrap; font-weight: 600; letter-spacing: 0.08em;
        }

        /* Alerts */
        .fp-alert {
          border-radius: 12px; padding: 12px 14px;
          margin-bottom: 20px; font-size: 13.5px; font-weight: 500;
          display: flex; align-items: flex-start; gap: 10px;
          animation: fp-rise 0.3s ease both; line-height: 1.4;
          backdrop-filter: blur(8px);
        }
        .fp-alert-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
        .fp-alert.error {
          background: rgba(254,226,226,0.75);
          border: 1px solid rgba(252,165,165,0.5); color: #b91c1c;
        }
        .fp-alert.success {
          background: rgba(209,250,229,0.75);
          border: 1px solid rgba(110,231,183,0.5); color: #065f46;
        }

        /* Input */
        .fp-field { margin-bottom: 20px; }
        .fp-label {
          display: block; font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #6b7280; margin-bottom: 8px;
        }
        .fp-input-wrap { position: relative; }
        .fp-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 16px; pointer-events: none;
          opacity: 0.4; transition: opacity 0.2s;
        }
        .fp-input-wrap.focused .fp-input-icon { opacity: 1; }
        .fp-input {
          width: 100%;
          padding: 13px 14px 13px 44px;
          border-radius: 14px;
          border: 1.5px solid rgba(209,213,219,0.7);
          background: rgba(255,255,255,0.65);
          color: #1e1b4b; font-size: 14.5px;
          font-family: 'Outfit', sans-serif; font-weight: 400;
          outline: none;
          backdrop-filter: blur(8px);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .fp-input::placeholder { color: #9ca3af; }
        .fp-input:focus {
          border-color: rgba(99,102,241,0.55);
          background: rgba(255,255,255,0.85);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.1), 0 4px 16px rgba(99,102,241,0.06);
        }

        /* Button */
        .fp-btn {
          width: 100%; padding: 14px;
          border: none; border-radius: 14px;
          font-size: 15px; font-weight: 700;
          font-family: 'Outfit', sans-serif;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #fff;
          box-shadow: 0 6px 24px rgba(99,102,241,0.35), 0 1px 0 rgba(255,255,255,0.2) inset;
          margin-top: 4px;
        }
        .fp-btn::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.18), transparent);
          border-radius: 14px 14px 0 0;
        }
        .fp-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(99,102,241,0.45), 0 1px 0 rgba(255,255,255,0.2) inset;
        }
        .fp-btn:not(:disabled):active { transform: translateY(0); }
        .fp-btn:disabled {
          opacity: 0.6; cursor: not-allowed;
          background: linear-gradient(135deg, #9ca3af, #6b7280); box-shadow: none;
        }
        .fp-btn-inner {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          position: relative; z-index: 1;
        }
        .fp-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff;
          animation: fp-spin 0.7s linear infinite;
        }
        @keyframes fp-spin { to { transform: rotate(360deg); } }

        .fp-footer {
          text-align: center; margin-top: 22px;
          font-size: 13.5px; color: #9ca3af;
        }
        .fp-footer a {
          color: #4f46e5; font-weight: 600;
          text-decoration: none; cursor: pointer; transition: color 0.2s;
        }
        .fp-footer a:hover { color: #7c3aed; text-decoration: underline; }

        /* Trust row */
        .fp-trust {
          display: flex; align-items: center; justify-content: center; gap: 16px;
          margin-top: 26px; padding-top: 20px;
          border-top: 1px solid rgba(99,102,241,0.1);
          flex-wrap: wrap;
        }
        .fp-trust-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 11.5px; color: #9ca3af; font-weight: 500;
        }

        @media (max-width: 480px) {
          .fp-card { padding: 36px 22px 30px; border-radius: 22px; }
          .fp-heading { font-size: 22px; }
        }
      `}</style>

      <div className="fp-root">
        <div className="fp-blob fp-blob-1" />
        <div className="fp-blob fp-blob-2" />
        <div className="fp-blob fp-blob-3" />
        <div className="fp-blob fp-blob-4" />
        <div className="fp-grid" />
        <div className="fp-shape fp-shape-1" />
        <div className="fp-shape fp-shape-2" />
        <div className="fp-shape fp-shape-3" />

        <div className="fp-card">
          <div className="fp-icon-wrap">🔑</div>

          <h1 className="fp-heading">
            Forgot your <span>password?</span>
          </h1>
          <p className="fp-sub">
            Enter your registered email and we'll send you a secure reset link instantly.
          </p>

          <div className="fp-divider">
            <div className="fp-divider-line" />
            <span className="fp-divider-text">ENTER YOUR EMAIL</span>
            <div className="fp-divider-line" />
          </div>

          {error && (
            <div className="fp-alert error">
              <span className="fp-alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="fp-alert success">
              <span className="fp-alert-icon">✅</span>
              <span>{success}</span>
            </div>
          )}

          <div className="fp-field">
            <label className="fp-label">Email Address</label>
            <div className={`fp-input-wrap ${focused ? "focused" : ""}`}>
              <span className="fp-input-icon">✉️</span>
              <input
                className="fp-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoComplete="email"
              />
            </div>
          </div>

          <button className="fp-btn" onClick={handleSubmit} disabled={loading}>
            <div className="fp-btn-inner">
              {loading
                ? <><div className="fp-spinner" /> Sending link…</>
                : <>Send Reset Link →</>
              }
            </div>
          </button>

          <div className="fp-footer">
            Remember your password?&nbsp;
            <a onClick={() => window.history.back()}>Back to login</a>
          </div>

         
        </div>
      </div>
    </>
  );
}
