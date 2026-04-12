import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

    /* PERFORMANCE BOOST */
    contain: layout paint;
  }

  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(30px);
    opacity: 0.45;
    pointer-events: none;

    /* GPU OPTIMIZATION */
    will-change: transform, opacity;
    transform: translate3d(0,0,0);

    animation: floatBlob 8s ease-in-out infinite;
    animation-play-state: paused;
  }

  .loaded .blob {
    animation-play-state: running;
  }

  .blob-1 { width: 420px; height: 420px; background: radial-gradient(circle, #93c5fd, #3b82f6); top: -120px; left: -100px; }
  .blob-2 { width: 350px; height: 350px; background: radial-gradient(circle, #bfdbfe, #60a5fa); bottom: -100px; right: -80px; animation-delay: 3s; }
  .blob-3 { width: 250px; height: 250px; background: radial-gradient(circle, #e0f2fe, #38bdf8); top: 50%; left: 60%; animation-delay: 1.5s; }

  @keyframes floatBlob {
    0%, 100% { transform: translate3d(0,0,0) scale(1); }
    50% { transform: translate3d(0,-15px,0) scale(1.03); }
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

    /* OPTIMIZED SHADOW */
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.12);

    padding: 44px 40px 40px;

    /* GPU */
    will-change: transform, opacity;
    transform: translate3d(0,0,0);

    animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
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

    will-change: transform, opacity;
    transform: translate3d(0,0,0);

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
    border-radius: 10px;
    padding: 10px 14px;
    color: #b91c1c;
    margin-bottom: 18px;

    backdrop-filter: blur(6px);

    animation: shake 0.3s ease;
  }

  @keyframes shake {
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .field { margin-bottom: 18px; }

  .field-label {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 7px;
  }

  .input-wrap { position: relative; }

  .field-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 14.5px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;

    backdrop-filter: blur(6px);

    transition: 0.2s;
  }

  .field-input:focus {
    box-shadow: 0 0 0 3px rgba(59,130,246,0.13);
  }

  .eye-btn {
    position: absolute; right: 13px; top: 50%;
    transform: translateY(-50%);
  }

  .submit-btn {
    width: 100%;
    padding: 13px;
    border-radius: 12px;

    background: linear-gradient(135deg, #1e3a8a, #2563eb);
    color: #fff;

    will-change: transform;
  }

  .spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
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

  // 🚀 inject styles only once
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    // start animations after load
    document.body.classList.add("loaded");

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const handleLogin = async (e) => {
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

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      if (!data?.user || !data?.token) {
        setError("Invalid login response from server");
        return;
      }

      localStorage.setItem("employeeToken", data.token);
      localStorage.setItem("employeeUser", JSON.stringify(data.user));
      navigate("/employeedashboard", { replace: true });

    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="glass-card">
        <h2 className="card-title">Welcome Back</h2>
        <p className="card-subtitle">Sign in to your employee portal</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="field">
            <input
              type="email"
              className="field-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <input
              type={showPassword ? "text" : "password"}
              className="field-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="submit-btn">
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}