import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const css = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  .home-root {
    min-height: 100vh;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    background: linear-gradient(135deg, #e5e9ee 0%, #e8eaec 40%, #cacdcf 70%, #babec0 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: background 0.5s;
  }

  .home-root.dark {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%);
  }

  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.42;
    pointer-events: none;
    animation: blobFloat 9s ease-in-out infinite;
  }

  .blob-1 { width:520px;height:520px;background:radial-gradient(circle,#a5b4fc,#818cf8);top:-160px;left:-120px;animation-delay:0s; }
  .blob-2 { width:400px;height:400px;background:radial-gradient(circle,#fbcfe8,#f9a8d4);bottom:-120px;right:-90px;animation-delay:3s; }
  .blob-3 { width:300px;height:300px;background:radial-gradient(circle,#bfdbfe,#93c5fd);top:50%;left:55%;animation-delay:6s; }

  .home-root.dark .blob-1 { opacity:0.18; }
  .home-root.dark .blob-2 { opacity:0.13; }
  .home-root.dark .blob-3 { opacity:0.10; }

  @keyframes blobFloat {
    0%,100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.04); }
  }

  .nav {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 44px;
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.75);
    box-shadow: 0 2px 16px rgba(99,102,241,0.07);
    transition: background 0.5s, border-color 0.5s;
  }

  .home-root.dark .nav {
    background: rgba(15,23,42,0.55);
    border-bottom-color: rgba(99,102,241,0.18);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 11px;
    font-size: 20px;
    font-weight: 800;
    color: #1e1b4b;
    letter-spacing: -0.3px;
    transition: color 0.4s;
  }

  .home-root.dark .nav-brand { color: #e0e7ff; }

  .brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(99,102,241,0.35);
    flex-shrink: 0;
  }

  .brand-icon svg { color: #fff; }
  .brand-accent { color: #6366f1; }

  .theme-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 20px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.55);
    color: #374151;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 8px rgba(99,102,241,0.08);
    transition: background 0.25s, transform 0.2s, box-shadow 0.25s, color 0.3s, border-color 0.3s;
  }

  .theme-btn:hover {
    background: rgba(255,255,255,0.85);
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(99,102,241,0.15);
  }

  .home-root.dark .theme-btn {
    background: rgba(30,27,75,0.5);
    border-color: rgba(99,102,241,0.3);
    color: #c7d2fe;
  }

  .home-root.dark .theme-btn:hover { background: rgba(99,102,241,0.15); }

  .hero {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px 80px;
    text-align: center;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 16px;
    border-radius: 50px;
    border: 1px solid rgba(99,102,241,0.25);
    background: rgba(99,102,241,0.08);
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6366f1;
    margin-bottom: 28px;
    animation: fadeUp 0.6s ease both;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6366f1;
    animation: blink 2s ease-in-out infinite;
  }

  @keyframes blink {
    0%,100% { opacity:1; }
    50% { opacity:0.25; }
  }

  .hero-title {
    font-size: clamp(36px, 5vw, 58px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -1px;
    color: #1e1b4b;
    margin-bottom: 18px;
    animation: fadeUp 0.6s 0.12s ease both;
    transition: color 0.4s;
  }

  .home-root.dark .hero-title { color: #e0e7ff; }

  .hero-title .hl {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 16px;
    color: #6b7280;
    line-height: 1.7;
    max-width: 420px;
    margin: 0 auto 52px;
    animation: fadeUp 0.6s 0.22s ease both;
    transition: color 0.4s;
  }

  .home-root.dark .hero-sub { color: #94a3b8; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to { opacity:1; transform:translateY(0); }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    width: 100%;
    max-width: 860px;
    animation: fadeUp 0.6s 0.34s ease both;
  }

  @media(max-width: 680px) {
    .cards-grid {
      grid-template-columns: 1fr;
      max-width: 380px;
    }
  }

  .portal-card {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.78);
    border-radius: 22px;
    padding: 32px 24px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
    cursor: pointer;
    transition: transform 0.28s, box-shadow 0.28s, border-color 0.28s, background 0.4s;
    position: relative;
    overflow: hidden;
  }

  .home-root.dark .portal-card {
    background: rgba(30,27,75,0.4);
    border-color: rgba(99,102,241,0.2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .portal-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 22px;
    background: linear-gradient(135deg, rgba(99,102,241,0.07), transparent);
    opacity: 0;
    transition: opacity 0.28s;
  }

  .portal-card:hover::after { opacity: 1; }

  .portal-card:hover {
    transform: translateY(-7px);
    border-color: rgba(99,102,241,0.3);
    box-shadow: 0 22px 50px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.9);
  }

  .home-root.dark .portal-card:hover {
    border-color: rgba(99,102,241,0.45);
    box-shadow: 0 22px 50px rgba(99,102,241,0.25);
  }

  .card-icon {
    width: 58px;
    height: 58px;
    border-radius: 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    box-shadow: 0 8px 20px rgba(99,102,241,0.3);
    transition: transform 0.28s, box-shadow 0.28s;
  }

  .portal-card:hover .card-icon {
    transform: scale(1.1) rotate(-4deg);
    box-shadow: 0 12px 28px rgba(99,102,241,0.42);
  }

  .card-icon svg { color: #fff; }

  .card-title {
    font-size: 18px;
    font-weight: 800;
    color: #1e1b4b;
    margin-bottom: 9px;
    transition: color 0.4s;
  }

  .home-root.dark .card-title { color: #e0e7ff; }

  .card-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 24px;
    flex: 1;
    transition: color 0.4s;
  }

  .home-root.dark .card-desc { color: #94a3b8; }

  .card-btn {
    width: 100%;
    padding: 12px;
    border-radius: 11px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    box-shadow: 0 6px 16px rgba(99,102,241,0.32);
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  }

  .card-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(99,102,241,0.42);
  }

  .card-btn:active { transform: translateY(0); }

  .btn-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.25) 50%,transparent 65%);
    transform: translateX(-100%);
    transition: transform 0.5s;
  }

  .card-btn:hover .btn-shine { transform: translateX(100%); }

  .footer {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 16px 24px;
    font-size: 12.5px;
    color: #9ca3af;
    border-top: 1px solid rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.25);
    backdrop-filter: blur(10px);
    transition: background 0.4s, border-color 0.4s;
  }

  .home-root.dark .footer {
    background: rgba(15,23,42,0.35);
    border-top-color: rgba(99,102,241,0.15);
    color: #64748b;
  }
`;

const portals = [
  {
    route: "/eregister",
    label: "Register",
    title: "New Employee",
    desc: "Create your profile and submit for admin review and approval.",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  },
  {
    route: "/login",
    label: "Sign In",
    title: "Employee Login",
    desc: "Access your dashboard, payslips, leave and attendance records.",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    route: "/adminlogin",
    label: "Admin Access",
    title: "HR Admin",
    desc: "Manage employees, payroll, approvals and organisation data.",
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
];

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  return (
    <>
      <style>{css}</style>

      <div className={`home-root${dark ? " dark" : ""}`}>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <nav className="nav">
          <div className="nav-brand">
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            HR<span className="brand-accent">Portal</span>
          </div>

          <button className="theme-btn" onClick={() => setDark(!dark)}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>

        <section className="hero">
          <div className="hero-badge">
            <div className="badge-dot" />
            Human Resources Management
          </div>

          <h1 className="hero-title">
            Smart
            <br />
            <span className="hl">HR Workspace</span>
          </h1>

          <p className="hero-sub">
            Manage employees, payroll, attendance and leaves — all from one beautifully simple portal.
          </p>

          <div className="cards-grid">
            {portals.map((p) => (
              <div className="portal-card" key={p.route} onClick={() => navigate(p.route)}>
                <div className="card-icon">{p.icon}</div>
                <div className="card-title">{p.title}</div>
                <div className="card-desc">{p.desc}</div>

                <button
                  className="card-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(p.route);
                  }}
                >
                  <span className="btn-shine" />
                  {p.label}
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          © {new Date().getFullYear()} HR Portal · All rights reserved
        </footer>
      </div>
    </>
  );
}
