import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

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

      const role = String(data.user.role || "").toLowerCase();

      if (!["employee", "manager"].includes(role)) {
        setError("This login is only for employees and managers");
        return;
      }

      if (data.user.approval_status && data.user.approval_status !== "approved") {
        setError("Your account is not approved yet");
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
    <main className="login-root">
      <div className="login-card">

        <div className="login-icon-badge" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your employee portal</p>

        {error && (
          <div className="login-error" role="alert">{error}</div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="login-field">
            <label htmlFor="login-email">Email Address</label>
            <div className="login-input-wrap">
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="login-input has-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.73 1.88-3.41 3.32-4.82" />
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.8 11.8 0 0 1-1.67 2.68" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="login-divider" />
          <div className="login-forgot-wrap">
            <button type="button" className="login-forgot-btn" onClick={() => navigate("/forget")}>
              Forgot Password?
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}