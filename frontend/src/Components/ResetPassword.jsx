import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .rp-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    display: flex; justify-content: center; align-items: center;
    padding: 24px 16px;
    background: linear-gradient(135deg,#dbeafe 0%,#eff6ff 35%,#e0f2fe 65%,#f0f9ff 100%);
    position: relative; overflow: hidden;
  }
  .rp-blob { position:fixed;border-radius:50%;pointer-events:none;animation:rpFloat 9s ease-in-out infinite; }
  .rp-b1 { width:460px;height:460px;background:radial-gradient(circle,#93c5fd80,#3b82f670);filter:blur(88px);top:-150px;left:-110px;animation-delay:0s; }
  .rp-b2 { width:360px;height:360px;background:radial-gradient(circle,#bfdbfe70,#60a5fa60);filter:blur(72px);bottom:-110px;right:-90px;animation-delay:3.2s; }
  .rp-b3 { width:240px;height:240px;background:radial-gradient(circle,#e0f2fe60,#38bdf860);filter:blur(60px);top:45%;left:58%;animation-delay:1.6s; }
  @keyframes rpFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-22px) scale(1.05)} }

  .rp-card {
    position:relative;width:100%;max-width:420px;
    background:rgba(255,255,255,0.58);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
    border:1.5px solid rgba(255,255,255,0.82);border-radius:26px;
    box-shadow:0 8px 40px rgba(59,130,246,0.11),0 2px 0 rgba(255,255,255,0.9) inset,0 28px 56px rgba(30,58,138,0.08);
    padding:44px 40px 38px;
    animation:rpIn 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes rpIn { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:none} }

  .rp-badge {
    width:62px;height:62px;border-radius:18px;
    background:linear-gradient(140deg,#1e3a8a,#2563eb 60%,#38bdf8);
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 20px;
    box-shadow:0 7px 24px rgba(37,99,235,0.40),0 1px 0 rgba(255,255,255,0.22) inset;
    animation:rpPop 0.48s 0.16s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes rpPop { from{opacity:0;transform:scale(0.5) rotate(-8deg)} to{opacity:1;transform:scale(1) rotate(0)} }

  .rp-title { text-align:center;font-size:22px;font-weight:700;color:#1e3a8a;letter-spacing:-0.5px;margin-bottom:4px; }
  .rp-sub   { text-align:center;font-size:13px;color:#64748b;margin-bottom:28px; }

  .rp-error {
    display:flex;align-items:center;gap:8px;
    background:rgba(254,226,226,0.72);border:1px solid rgba(252,165,165,0.55);
    border-radius:11px;padding:10px 14px;color:#b91c1c;font-size:13px;
    margin-bottom:18px;animation:rpShake 0.32s ease;
  }
  @keyframes rpShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}

  .rp-field { margin-bottom:17px; }
  .rp-label { display:block;font-size:12.5px;font-weight:600;color:#334155;margin-bottom:6px;letter-spacing:0.15px; }
  .rp-iw    { position:relative; }

  .rp-input {
    width:100%;padding:12px 46px 12px 15px;font-family:'Outfit',sans-serif;font-size:14px;color:#0f172a;
    background:rgba(255,255,255,0.72);border:1.5px solid rgba(203,213,225,0.65);
    border-radius:12px;outline:none;transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;
  }
  .rp-input::placeholder{color:#94a3b8;}
  .rp-input:focus{border-color:#3b82f6;background:rgba(255,255,255,0.92);box-shadow:0 0 0 3.5px rgba(59,130,246,0.14);}

  .rp-eye {
    position:absolute;right:12px;top:50%;transform:translateY(-50%);
    background:none;border:none;cursor:pointer;color:#94a3b8;
    display:flex;align-items:center;padding:2px;border-radius:6px;transition:color 0.18s;
  }
  .rp-eye:hover{color:#3b82f6;}

  /* strength bar */
  .rp-strength { margin-top:6px; display:flex; gap:4px; }
  .rp-bar { flex:1; height:3px; border-radius:2px; transition:background 0.3s; }

  .rp-btn {
    width:100%;padding:13px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:600;color:#fff;
    background:linear-gradient(135deg,#1e3a8a,#2563eb 70%);border:none;border-radius:12px;
    cursor:pointer;letter-spacing:0.15px;box-shadow:0 4px 18px rgba(37,99,235,0.32);
    transition:transform 0.14s,box-shadow 0.2s;margin-top:6px;
    display:flex;align-items:center;justify-content:center;gap:8px;
  }
  .rp-btn:hover{transform:translateY(-1.5px);box-shadow:0 8px 28px rgba(37,99,235,0.40);}
  .rp-btn:active{transform:translateY(0);}

  .rp-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(203,213,225,0.55),transparent);margin:22px 0 14px;}
  .rp-hint{text-align:center;font-size:12.5px;color:#94a3b8;}

  @media(max-width:480px){.rp-card{padding:36px 24px 32px;border-radius:22px;}}
  @media(max-width:360px){.rp-card{padding:28px 18px 26px;}}
`;

const EyeOn  = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.73 1.88-3.41 3.32-4.82"/>
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.8 11.8 0 0 1-1.67 2.68"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>
  </svg>
);

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8)              s++;
  if (/[A-Z]/.test(pw))           s++;
  if (/[0-9]/.test(pw))           s++;
  if (/[^A-Za-z0-9]/.test(pw))    s++;
  return s;
}

const BAR_COLORS = ["#e2e8f0","#ef4444","#f59e0b","#22c55e","#22c55e"];

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState("");

  const strength = getStrength(password);

  const handleSubmit = async () => {
    setError("");
    if (!password || !confirm)      return setError("All fields are required");
    if (password !== confirm)       return setError("Passwords do not match");
    if (password.length < 6)       return setError("Password must be at least 6 characters");
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset/${token}`, {
        method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully");
        navigate(data.role === "admin" ? "/adminlogin" : "/login");
      } else {
        setError(data.message || "Reset failed");
      }
    } catch { setError("Server error"); }
  };

  return (
    <>
      <style>{css}</style>
      <div className="rp-root">
        <div className="rp-blob rp-b1"/><div className="rp-blob rp-b2"/><div className="rp-blob rp-b3"/>

        <div className="rp-card">
          {/* badge */}
          <div className="rp-badge">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2 className="rp-title">Reset Password</h2>
          <p className="rp-sub">Enter and confirm your new password below</p>

          {error && (
            <div className="rp-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* New password */}
          <div className="rp-field">
            <label className="rp-label">New Password</label>
            <div className="rp-iw">
              <input
                type={showPassword ? "text" : "password"}
                className="rp-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="rp-eye" onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide" : "Show"}>
                {showPassword ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            {/* strength bars */}
            {password && (
              <div className="rp-strength">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="rp-bar"
                    style={{ background: i <= strength ? BAR_COLORS[strength] : "#e2e8f0" }} />
                ))}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="rp-field">
            <label className="rp-label">Confirm Password</label>
            <div className="rp-iw">
              <input
                type={showConfirm ? "text" : "password"}
                className="rp-input"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button type="button" className="rp-eye" onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide" : "Show"}>
                {showConfirm ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
          </div>

          <button className="rp-btn" onClick={handleSubmit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Update Password
          </button>

          <div className="rp-divider" />
          <p className="rp-hint">Remember your password? Return to login</p>
        </div>
      </div>
    </>
  );
}
