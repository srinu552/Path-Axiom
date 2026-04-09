import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Dashboard", path: "/employeedashboard", icon: "⬡" },
  { label: "Payroll", path: "/employeepayroll", icon: "◈" },
  { label: "Attendance", path: "/employeeattendance", icon: "◎" },
  { label: "Leave", path: "/leaveapplication", icon: "◇" },
  { label: "Appraisal", path: "/employeeappraisal", icon: "◉" },
];

const SunIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

function Header({ dark = false, onToggleTheme = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const isControlled = typeof onToggleTheme === "function";
  const [internalDark, setInternalDark] = useState(
    () => localStorage.getItem("empDash_theme") === "dark"
  );

  const themeDark = isControlled ? dark : internalDark;

  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    ["token", "adminToken", "employeeToken", "managerToken", "employeeUser", "managerUser", "user"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate("/login");
    setProfileOpen(false);
  };

  const handleThemeToggle = () => {
    if (isControlled) {
      onToggleTheme();
      return;
    }

    setInternalDark((prev) => {
      const next = !prev;
      localStorage.setItem("empDash_theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    const storageHandler = (e) => {
      if (e.key === "empDash_theme") {
        setInternalDark(e.newValue === "dark");
      }
    };

    document.addEventListener("mousedown", handler);
    window.addEventListener("storage", storageHandler);

    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const d = themeDark;

  return (
    <>
      <style>{`
        .ph-header * {
          box-sizing: border-box;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .ph-shell {
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .ph-bar {
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
        }

        .ph-bar.light {
          background: rgba(255,255,255,0.94);
          border-bottom: 1px solid rgba(15,23,42,0.07);
          box-shadow: 0 2px 20px rgba(0,0,0,0.045);
          backdrop-filter: blur(18px);
        }

        .ph-bar.dark {
          background: rgba(9,12,22,0.92);
          border-bottom: 1px solid rgba(99,102,241,0.14);
          box-shadow: 0 4px 30px rgba(0,0,0,0.4);
          backdrop-filter: blur(18px);
        }

        .ph-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
          flex-shrink: 0;
        }

        .ph-brand-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #1e40af, #4f46e5);
          color: #fff;
          box-shadow: 0 4px 12px rgba(79,70,229,0.3);
          transition: transform 0.2s;
        }

        .ph-brand:hover .ph-brand-mark {
          transform: scale(1.07) rotate(-3deg);
        }

        .ph-brand-name {
          font-family: 'Clash Display', 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.03em;
          transition: color 0.3s;
        }

        .light .ph-brand-name { color: #0f172a; }
        .dark .ph-brand-name { color: #e8eeff; }

        .ph-nav {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        @media (max-width: 960px) {
          .ph-nav { display: none; }
        }

        .ph-nav-link {
          position: relative;
          padding: 7px 14px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
          text-decoration: none;
          display: block;
        }

        .light .ph-nav-link { color: #475569; }
        .light .ph-nav-link:hover { color: #1e40af; background: rgba(30,64,175,0.06); }
        .light .ph-nav-link.ph-active {
          color: #1e40af;
          background: rgba(30,64,175,0.08);
          font-weight: 600;
        }

        .dark .ph-nav-link { color: #94a3b8; }
        .dark .ph-nav-link:hover { color: #a5b4fc; background: rgba(99,102,241,0.1); }
        .dark .ph-nav-link.ph-active {
          color: #818cf8;
          background: rgba(99,102,241,0.12);
          font-weight: 600;
        }

        .ph-nav-link.ph-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2.5px;
          border-radius: 99px;
          background: linear-gradient(90deg, #1e40af, #6366f1);
        }

        .dark .ph-nav-link.ph-active::after {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
        }

        .ph-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ph-theme-icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: all 0.22s ease;
          flex-shrink: 0;
        }

        .light .ph-theme-icon-btn {
          background: #f1f5f9;
          color: #475569;
          box-shadow: 0 2px 8px rgba(15,23,42,0.08);
        }

        .light .ph-theme-icon-btn:hover {
          background: #dbeafe;
          color: #1d4ed8;
          transform: translateY(-1px) rotate(10deg);
        }

        .dark .ph-theme-icon-btn {
          background: rgba(30,41,59,0.78);
          color: #f8fafc;
          box-shadow: 0 4px 16px rgba(0,0,0,0.28);
        }

        .dark .ph-theme-icon-btn:hover {
          background: rgba(99,102,241,0.16);
          color: #facc15;
          transform: translateY(-1px) rotate(10deg);
        }

        .ph-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          border: none;
          font-size: 17px;
          transition: background 0.2s, transform 0.15s;
          flex-shrink: 0;
        }

        .light .ph-icon-btn {
          background: #f1f5f9;
          color: #475569;
        }

        .light .ph-icon-btn:hover {
          background: #dbeafe;
          color: #1e40af;
          transform: translateY(-1px);
        }

        .dark .ph-icon-btn {
          background: rgba(30,41,59,0.7);
          color: #94a3b8;
        }

        .dark .ph-icon-btn:hover {
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
          transform: translateY(-1px);
        }

        .ph-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #ef4444;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 2px solid transparent;
          animation: ph-pulse 2s ease infinite;
        }

        .light .ph-badge { border-color: #fff; }
        .dark .ph-badge { border-color: #090c16; }

        @keyframes ph-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
        }

        .ph-notif-panel {
          position: absolute;
          top: 48px;
          right: 0;
          width: 300px;
          border-radius: 16px;
          overflow: hidden;
          z-index: 2000;
          animation: ph-drop 0.22s cubic-bezier(.34,1.56,.64,1);
        }

        .light .ph-notif-panel {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }

        .dark .ph-notif-panel {
          background: #0f1629;
          border: 1px solid rgba(99,102,241,0.18);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }

        .ph-notif-header {
          padding: 14px 16px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ph-notif-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .light .ph-notif-title { color: #0f172a; }
        .dark .ph-notif-title { color: #e2e8ff; }

        .ph-notif-clear {
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #6366f1;
        }

        .ph-notif-item {
          padding: 11px 16px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          cursor: pointer;
          transition: background 0.15s;
        }

        .light .ph-notif-item:hover { background: #f8faff; }
        .dark .ph-notif-item:hover { background: rgba(99,102,241,0.06); }

        .ph-notif-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .ph-notif-text {
          font-size: 13px;
          line-height: 1.5;
        }

        .light .ph-notif-text { color: #374151; }
        .dark .ph-notif-text { color: #94a3b8; }

        .ph-notif-time {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .ph-notif-divider {
          height: 1px;
          margin: 0 16px;
        }

        .light .ph-notif-divider { background: #f1f5f9; }
        .dark .ph-notif-divider { background: rgba(255,255,255,0.05); }

        .ph-avatar-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          transition: box-shadow 0.2s, transform 0.15s;
        }

        .light .ph-avatar-btn { box-shadow: 0 0 0 2px #e0e7ff; }
        .dark .ph-avatar-btn { box-shadow: 0 0 0 2px rgba(99,102,241,0.35); }

        .ph-avatar-btn:hover { transform: translateY(-1px); }
        .light .ph-avatar-btn:hover { box-shadow: 0 0 0 3px #c7d2fe; }
        .dark .ph-avatar-btn:hover { box-shadow: 0 0 0 3px rgba(99,102,241,0.55); }

        .ph-avatar-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ph-profile-drop {
          position: absolute;
          top: 48px;
          right: 0;
          width: 200px;
          border-radius: 14px;
          overflow: hidden;
          z-index: 2000;
          animation: ph-drop 0.22s cubic-bezier(.34,1.56,.64,1);
        }

        .light .ph-profile-drop {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }

        .dark .ph-profile-drop {
          background: #0f1629;
          border: 1px solid rgba(99,102,241,0.18);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }

        .ph-profile-info {
          padding: 14px 16px 10px;
          border-bottom: 1px solid;
        }

        .light .ph-profile-info { border-color: #f1f5f9; }
        .dark .ph-profile-info { border-color: rgba(255,255,255,0.05); }

        .ph-profile-name {
          font-size: 14px;
          font-weight: 700;
        }

        .light .ph-profile-name { color: #0f172a; }
        .dark .ph-profile-name { color: #e2e8ff; }

        .ph-profile-role {
          font-size: 12px;
          margin-top: 2px;
        }

        .light .ph-profile-role { color: #6b7280; }
        .dark .ph-profile-role { color: #6b7280; }

        .ph-drop-item {
          padding: 11px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.15s;
          border: none;
          background: transparent;
          width: 100%;
        }

        .light .ph-drop-item { color: #374151; }
        .light .ph-drop-item:hover { background: #f8faff; color: #1e40af; }
        .dark .ph-drop-item { color: #94a3b8; }
        .dark .ph-drop-item:hover { background: rgba(99,102,241,0.08); color: #a5b4fc; }

        .light .ph-drop-item.danger:hover { background: #fff1f2; color: #dc2626; }
        .dark .ph-drop-item.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; }

        .ph-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 6px;
          border: none;
          background: transparent;
        }

        @media (max-width: 960px) {
          .ph-hamburger { display: flex; }
        }

        .ph-ham-line {
          width: 22px;
          height: 2px;
          border-radius: 99px;
          transition: all 0.3s;
        }

        .light .ph-ham-line { background: #475569; }
        .dark .ph-ham-line { background: #94a3b8; }

        .ph-hamburger.open .ph-ham-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .ph-hamburger.open .ph-ham-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .ph-hamburger.open .ph-ham-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .ph-mobile-drawer {
          position: absolute;
          top: 68px;
          left: 0;
          right: 0;
          padding: 16px 20px 20px;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 18px;
          animation: ph-drop 0.25s cubic-bezier(.34,1.2,.64,1);
          z-index: 999;
        }

        .light .ph-mobile-drawer {
          background: rgba(255,255,255,0.97);
          border: 1px solid rgba(15,23,42,0.07);
          border-top: none;
          box-shadow: 0 12px 40px rgba(0,0,0,0.1);
        }

        .dark .ph-mobile-drawer {
          background: rgba(9,12,22,0.97);
          border: 1px solid rgba(99,102,241,0.14);
          border-top: none;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }

        .ph-mobile-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 4px;
        }

        .light .ph-mobile-link { color: #475569; }
        .light .ph-mobile-link:hover { background: rgba(30,64,175,0.06); color: #1e40af; }
        .light .ph-mobile-link.ph-active { background: rgba(30,64,175,0.08); color: #1e40af; font-weight: 600; }

        .dark .ph-mobile-link { color: #94a3b8; }
        .dark .ph-mobile-link:hover { background: rgba(99,102,241,0.08); color: #a5b4fc; }
        .dark .ph-mobile-link.ph-active { background: rgba(99,102,241,0.12); color: #818cf8; font-weight: 600; }

        .ph-mobile-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }

        .light .ph-mobile-link .ph-mobile-icon { background: #f1f5f9; }
        .light .ph-mobile-link.ph-active .ph-mobile-icon { background: #dbeafe; }
        .dark .ph-mobile-link .ph-mobile-icon { background: rgba(30,41,59,0.8); }
        .dark .ph-mobile-link.ph-active .ph-mobile-icon { background: rgba(99,102,241,0.18); }

        @keyframes ph-drop {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className={`ph-header ${d ? "dark" : "light"}`}>
        <div className="ph-shell">
          <div className={`ph-bar ${d ? "dark" : "light"}`}>
            <div className="ph-brand" onClick={() => navigate("/employeedashboard")}>
              <div className="ph-brand-mark">PA</div>
              <span className="ph-brand-name">Path Axiom</span>
            </div>

            <nav className="ph-nav">
              {NAV_LINKS.map(({ label, path }) => (
                <span
                  key={path}
                  className={`ph-nav-link ${isActive(path) ? "ph-active" : ""}`}
                  onClick={() => handleNavClick(path)}
                >
                  {label}
                </span>
              ))}
            </nav>

            <div className="ph-right">
              <button
                className="ph-theme-icon-btn"
                onClick={handleThemeToggle}
                aria-label={d ? "Switch to light mode" : "Switch to dark mode"}
                title={d ? "Light mode" : "Dark mode"}
              >
                {d ? <SunIcon /> : <MoonIcon />}
              </button>

              <div ref={profileRef} style={{ position: "relative" }}>
                <div
                  className="ph-avatar-btn"
                  onClick={() => {
                    setProfileOpen((o) => !o);
                    setNotifOpen(false);
                  }}
                >
                  <img
                    src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    alt="profile"
                  />
                </div>

                {profileOpen && (
                  <div className={`ph-profile-drop ${d ? "dark" : "light"}`}>
                   

                    <button
                      className="ph-drop-item"
                      onClick={() => {
                        navigate("/update");
                        setProfileOpen(false);
                      }}
                    >
                      <span>👤</span> My Profile
                    </button>

                    <button className="ph-drop-item danger" onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>

              <button
                className={`ph-hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menu"
              >
                <div className="ph-ham-line" />
                <div className="ph-ham-line" />
                <div className="ph-ham-line" />
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className={`ph-mobile-drawer ${d ? "dark" : "light"}`}>
              {NAV_LINKS.map(({ label, path, icon }) => (
                <div
                  key={path}
                  className={`ph-mobile-link ${isActive(path) ? "ph-active" : ""}`}
                  onClick={() => handleNavClick(path)}
                >
                  <div className="ph-mobile-icon">{icon}</div>
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
