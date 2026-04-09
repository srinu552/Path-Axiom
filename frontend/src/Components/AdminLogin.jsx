import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const styles = `

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .admin-login-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #e5e9ee 0%, #e8eaec 40%, #cacdcf 70%, #babec0 100%);
    position: relative;
    overflow: hidden;
  }

  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.45;
    pointer-events: none;
    animation: floatBlob 8s ease-in-out infinite;
  }
  .blob-1 { width: 420px; height: 420px; background: radial-gradient(circle, #93c5fd, #3b82f6); top: -120px; left: -100px; animation-delay: 0s; }
  .blob-2 { width: 350px; height: 350px; background: radial-gradient(circle, #bfdbfe, #60a5fa); bottom: -100px; right: -80px; animation-delay: 3s; }
  .blob-3 { width: 250px; height: 250px; background: radial-gradient(circle, #e0f2fe, #38bdf8); top: 50%; left: 60%; animation-delay: 1.5s; }

  @keyframes floatBlob {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.04); }
  }

  .glass-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-radius: 24px;
    border: 1.5px solid rgba(255, 255, 255, 0.75);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.10), 0 1.5px 0 rgba(255,255,255,0.8) inset, 0 32px 64px rgba(30, 58, 138, 0.08);
    padding: 44px 40px 40px;
    animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .icon-badge {
    width: 60px; height: 60px;
    border-radius: 18px;
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 22px;
    box-shadow: 0 6px 20px rgba(59,130,246,0.35);
    animation: badgePop 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes badgePop {
    from { opacity: 0; transform: scale(0.6); }
    to   { opacity: 1; transform: scale(1); }
  }
  .icon-badge svg { color: white; }

  .card-title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: #1e3a8a;
    letter-spacing: -0.3px;
    margin-bottom: 4px;
  }
  .card-subtitle {
    text-align: center;
    font-size: 13.5px;
    color: #64748b;
    font-weight: 400;
    margin-bottom: 28px;
  }

  .error-box {
    background: rgba(254, 226, 226, 0.7);
    border: 1px solid rgba(252, 165, 165, 0.6);
    border-radius: 10px;
    padding: 10px 14px;
    color: #b91c1c;
    font-size: 13.5px;
    text-align: center;
    margin-bottom: 18px;
    backdrop-filter: blur(8px);
    animation: shake 0.3s ease;
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }

  .field { margin-bottom: 18px; animation: fieldIn 0.5s ease both; }
  .field:nth-child(1) { animation-delay: 0.25s; }
  .field:nth-child(2) { animation-delay: 0.35s; }
  @keyframes fieldIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .field-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 7px;
    letter-spacing: 0.2px;
  }
  .input-wrap { position: relative; }

  .field-input {
    width: 100%;
    padding: 12px 16px;
    font-family: 'Outfit', sans-serif;
    font-size: 14.5px;
    color: #1e293b;
    background: rgba(255, 255, 255, 0.7);
    border: 1.5px solid rgba(203, 213, 225, 0.7);
    border-radius: 12px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    backdrop-filter: blur(8px);
  }
  .field-input::placeholder { color: #94a3b8; }
  .field-input:focus {
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 3.5px rgba(59, 130, 246, 0.13);
  }
  .field-input.has-icon { padding-right: 46px; }

  .eye-btn {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #94a3b8;
    display: flex; align-items: center; padding: 2px;
    transition: color 0.2s; border-radius: 6px;
  }
  .eye-btn:hover { color: #3b82f6; }

  .submit-btn {
    width: 100%;
    padding: 13px;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    letter-spacing: 0.2px;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
    margin-top: 6px;
    animation: fieldIn 0.5s 0.45s ease both;
  }
  .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4); }
  .submit-btn:active:not(:disabled) { transform: translateY(0px); }
  .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .spinner {
    display: inline-block; width: 15px; height: 15px;
    border: 2.5px solid rgba(255,255,255,0.35); border-top-color: #fff;
    border-radius: 50%; animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .forgot-wrap { text-align: right; margin-top: 14px; animation: fieldIn 0.5s 0.5s ease both; }
  .forgot-link { font-size: 13px; font-weight: 500; color: #2563eb; cursor: pointer; transition: color 0.2s; }
  .forgot-link:hover { color: #1e3a8a; text-decoration: underline; }

  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(203,213,225,0.6), transparent); margin: 24px 0 0; }

  @media (max-width: 480px) {
    .glass-card { padding: 36px 24px 32px; border-radius: 20px; }
    .card-title { font-size: 20px; }
  }
  @media (max-width: 360px) {
    .glass-card { padding: 28px 18px 26px; }
  }
`;

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email, password, role: "admin",
      });
      const data = response.data;
      if (data.user.role !== "admin") { setError("This login is only for admin"); return; }
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      
      navigate("/admindashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="admin-login-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="glass-card">
          <div className="icon-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          <h2 className="card-title">Admin Portal</h2>
          <p className="card-subtitle">Sign in to your HR dashboard</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Email Address</label>
              <div className="input-wrap">
                <input type="email" className="field-input" placeholder="admin@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div className="input-wrap">
                <input type={showPassword ? "text" : "password"} className="field-input has-icon"
                  placeholder="Enter your password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.73 1.88-3.41 3.32-4.82"/>
                      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.8 11.8 0 0 1-1.67 2.68"/>
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                      <path d="M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><span className="spinner" />Signing in...</> : "Sign In"}
            </button>

            <div className="divider" />
            <div className="forgot-wrap">
              <span className="forgot-link" onClick={() => navigate("/forget")}>Forgot Password?</span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;
