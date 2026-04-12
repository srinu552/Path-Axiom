import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  .login-root {
    font-family: 'Outfit', system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #e5e9ee 0%, #e8eaec 40%, #cacdcf 70%, #babec0 100%);
    position: relative;
    overflow: hidden;
    contain: layout paint;
  }

  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(30px);
    opacity: 0.45;
    pointer-events: none;
    animation: floatBlob 8s ease-in-out infinite;
    will-change: transform;
    transform: translate3d(0,0,0);
  }

  .blob-1 { width: 420px; height: 420px; background: radial-gradient(circle, #93c5fd, #3b82f6); top: -120px; left: -100px; animation-delay: 0s; }
  .blob-2 { width: 350px; height: 350px; background: radial-gradient(circle, #bfdbfe, #60a5fa); bottom: -100px; right: -80px; animation-delay: 3s; }
  .blob-3 { width: 250px; height: 250px; background: radial-gradient(circle, #e0f2fe, #38bdf8); top: 50%; left: 60%; animation-delay: 1.5s; }

  @keyframes floatBlob {
    0%, 100% { transform: translate3d(0,0,0) scale(1); }
    50% { transform: translate3d(0,-20px,0) scale(1.04); }
  }

  .glass-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    min-height: 480px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 24px;
    border: 1.5px solid rgba(255, 255, 255, 0.75);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.10), 0 1.5px 0 rgba(255,255,255,0.8) inset, 0 32px 64px rgba(30, 58, 138, 0.08);
    padding: 44px 40px 40px;
    animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    will-change: transform, opacity;
    transform: translateZ(0);
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translate3d(0,28px,0) scale(0.97); }
    to   { opacity: 1; transform: translate3d(0,0,0) scale(1); }
  }

  .icon-badge {
    width: 60px; height: 60px;
    border-radius: 18px;
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 22px;
    box-shadow: 0 6px 20px rgba(59,130,246,0.35);
    animation: badgePop 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    will-change: transform, opacity;
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
    from { opacity: 0; transform: translate3d(0,12px,0); }
    to   { opacity: 1; transform: translate3d(0,0,0); }
  }

  .field-label {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 7px;
  }

  .input-wrap { position: relative; }

  .field-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 14.5px;
    color: #1e293b;
    background: rgba(255, 255, 255, 0.7);
    border: 1.5px solid rgba(203, 213, 225, 0.7);
    border-radius: 12px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    backdrop-filter: blur(8px);
  }

  .field-input:focus {
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 3.5px rgba(59, 130, 246, 0.13);
  }

  .field-input.has-icon { padding-right: 46px; }

  .eye-btn {
    position: absolute; right: 13px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer; color: #94a3b8;
  }

  .submit-btn {
    width: 100%;
    padding: 13px;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.15s;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
    margin-top: 6px;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .spinner {
    display: inline-block;
    width: 15px; height: 15px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .forgot-wrap { text-align: right; margin-top: 14px; }

  .forgot-link {
    font-size: 13px;
    color: #2563eb;
    background: none;
    border: none;
    cursor: pointer;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(203,213,225,0.6), transparent);
    margin-top: 24px;
  }
`;

async function parseJsonSafely(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: response.ok ? "" : "Unexpected server response" };
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Inject CSS after render (performance boost)
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "employee" }),
      });

      const data = await parseJsonSafely(res);

      if (!res.ok) return setError(data.message || "Login failed");
      if (!data?.user || !data?.token) return setError("Invalid login response");

      localStorage.setItem("employeeToken", data.token);
      localStorage.setItem("employeeUser", JSON.stringify(data.user));
      navigate("/employeedashboard", { replace: true });

    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  return (
    <div className="login-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="glass-card">
        <div className="icon-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        <h2 className="card-title">Welcome Back</h2>
        <p className="card-subtitle">Sign in to your employee portal</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="field-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input type={showPassword ? "text" : "password"} className="field-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}