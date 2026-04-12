import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

async function parseJsonSafely(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: response.ok ? "" : "Unexpected server response",
    };
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

    } catch (err) {
      console.error("Login error:", err);
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-root">
      <section className="card">
        <h1 className="title">Welcome Back</h1>
        <p className="subtitle">Sign in to your employee portal</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="group">
            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn">
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>

        <div className="forgot">
          <button onClick={() => navigate("/forget")}>
            Forgot Password?
          </button>
        </div>
      </section>
    </main>
  );
}