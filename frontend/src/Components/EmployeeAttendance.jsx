import React, { useEffect, useState } from "react";
import Header from "../SmallComponents/Header";

/* ─── Shared design tokens (match AdminLogin theme) ──────── */
const css = `

  .ea-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 35%, #e0f2fe 65%, #f0f9ff 100%);
    position: relative;
    overflow-x: hidden;
    padding-bottom: 48px;
  }

  /* blobs */
  .ea-blob { position: fixed; border-radius: 50%; pointer-events: none; animation: eaFloat 10s ease-in-out infinite; }
  .ea-b1 { width:500px;height:500px;background:radial-gradient(circle,#93c5fd60,#3b82f650);filter:blur(90px);top:-160px;left:-130px;animation-delay:0s; }
  .ea-b2 { width:380px;height:380px;background:radial-gradient(circle,#bfdbfe55,#60a5fa45);filter:blur(80px);bottom:-100px;right:-80px;animation-delay:4s; }
  @keyframes eaFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }

  .ea-inner { max-width: 860px; margin: 0 auto; padding: 32px 16px 0; }

  /* page header */
  .ea-page-header {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.8);
    border-radius: 22px;
    padding: 28px 32px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 2px 0 rgba(255,255,255,0.9) inset;
    animation: eaCardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes eaCardIn { from{opacity:0;transform:translateY(18px) scale(0.98)} to{opacity:1;transform:none} }

  .ea-avatar {
    width: 64px; height: 64px; border-radius: 20px;
    background: linear-gradient(140deg,#1e3a8a,#2563eb 60%,#38bdf8);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 20px rgba(37,99,235,0.35);
    flex-shrink: 0;
  }
  .ea-page-title { font-size: 22px; font-weight: 700; color: #1e3a8a; letter-spacing: -0.4px; margin: 0 0 2px; }
  .ea-page-sub   { font-size: 13px; color: #64748b; margin: 0; }

  /* glass card */
  .ea-card {
    background: rgba(255,255,255,0.58);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.8);
    border-radius: 22px;
    padding: 28px 28px;
    box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 2px 0 rgba(255,255,255,0.9) inset;
    margin-bottom: 20px;
    animation: eaCardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
    animation-delay: 0.1s;
  }

  .ea-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: #94a3b8; margin-bottom: 16px;
  }

  /* clock buttons */
  .ea-btn-row { display: flex; gap: 12px; flex-wrap: wrap; }

  .ea-btn {
    flex: 1; min-width: 130px;
    padding: 13px 20px;
    font-family: 'Outfit', sans-serif; font-size: 14.5px; font-weight: 600;
    border: none; border-radius: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.14s, box-shadow 0.2s;
  }
  .ea-btn:hover { transform: translateY(-1.5px); }
  .ea-btn:active { transform: translateY(0); }

  .ea-btn-in  { background: linear-gradient(135deg,#1e3a8a,#2563eb); color:#fff; box-shadow: 0 4px 16px rgba(37,99,235,0.30); }
  .ea-btn-out { background: linear-gradient(135deg,#0f766e,#0d9488); color:#fff; box-shadow: 0 4px 16px rgba(13,148,136,0.28); }
  .ea-btn-in:hover  { box-shadow: 0 8px 24px rgba(37,99,235,0.38); }
  .ea-btn-out:hover { box-shadow: 0 8px 24px rgba(13,148,136,0.36); }

  /* message */
  .ea-msg {
    padding: 11px 16px; border-radius: 12px; font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 8px; margin-bottom: 20px;
    animation: eaCardIn 0.3s ease both;
  }
  .ea-msg-info    { background:rgba(219,234,254,0.7); color:#1d4ed8; border:1px solid rgba(147,197,253,0.5); }
  .ea-msg-danger  { background:rgba(254,226,226,0.7); color:#b91c1c; border:1px solid rgba(252,165,165,0.5); }
  .ea-msg-neutral { background:rgba(241,245,249,0.8); color:#475569; border:1px solid rgba(203,213,225,0.6); }

  /* attendance table */
  .ea-table-wrap { overflow-x: auto; border-radius: 16px; }
  .ea-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13.5px; }
  .ea-table thead th {
    padding: 11px 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
    text-transform: uppercase; color: #64748b; background: rgba(248,250,252,0.8);
    border-bottom: 1.5px solid rgba(226,232,240,0.8); white-space: nowrap;
  }
  .ea-table thead th:first-child { border-radius: 12px 0 0 0; }
  .ea-table thead th:last-child  { border-radius: 0 12px 0 0; }
  .ea-table tbody td { padding: 13px 14px; color: #0f172a; border-bottom: 1px solid rgba(226,232,240,0.5); }
  .ea-table tbody tr:last-child td { border-bottom: none; }
  .ea-table tbody tr:hover td { background: rgba(239,246,255,0.5); }

  .ea-badge {
    display: inline-block; padding: 4px 12px; border-radius: 999px;
    font-size: 11.5px; font-weight: 700;
  }
  .ea-badge-present { background:rgba(220,252,231,0.8); color:#15803d; }
  .ea-badge-absent  { background:rgba(254,226,226,0.8); color:#b91c1c; }
  .ea-badge-late    { background:rgba(254,243,199,0.8); color:#b45309; }
  .ea-badge-default { background:rgba(226,232,240,0.8); color:#475569; }

  @media (max-width: 600px) {
    .ea-page-header { padding: 20px 20px; }
    .ea-card { padding: 20px 18px; }
    .ea-btn  { min-width: 100%; }
  }
`;

function getBadgeClass(status = "") {
  const s = status.toLowerCase();
  if (s.includes("present")) return "ea-badge ea-badge-present";
  if (s.includes("absent"))  return "ea-badge ea-badge-absent";
  if (s.includes("late"))    return "ea-badge ea-badge-late";
  return "ea-badge ea-badge-default";
}

function getMsgClass(msg = "") {
  if (msg.includes("❌") || msg.toLowerCase().includes("error") || msg.toLowerCase().includes("forbidden"))
    return "ea-msg ea-msg-danger";
  if (msg.toLowerCase().includes("success") || msg.toLowerCase().includes("clock"))
    return "ea-msg ea-msg-info";
  return "ea-msg ea-msg-neutral";
}

function EmployeeAttendance() {
  const [employeeName, setEmployeeName] = useState("");
  const [message, setMessage]           = useState("");
  const [attendance, setAttendance]     = useState(null);

  /* ─── auth check ─── */
  useEffect(() => {
    const storedUser = localStorage.getItem("employeeUser");
    const token      = localStorage.getItem("employeeToken");
    if (!token) { window.location.href = "/login"; return; }
    if (storedUser) setEmployeeName(JSON.parse(storedUser).name);
    fetchTodayAttendance();
  }, []);

  /* ─── common fetch ─── */
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("employeeToken");
    if (!token) { window.location.href = "/login"; return null; }
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      localStorage.removeItem("employeeToken");
      localStorage.removeItem("employeeUser");
      window.location.href = "/login";
      return null;
    }
    if (res.status === 403) { setMessage("Access forbidden ❌"); return null; }
    return res;
  };

  /* ─── today ─── */
  const fetchTodayAttendance = async () => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/attendance/today`);
      if (!res) return;
      const data = await res.json();
      if (res.ok) setAttendance(data.attendance);
    } catch { setMessage("Server Error ❌"); }
  };

  /* ─── clock in ─── */
  const handleLogin = async () => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/attendance/clock-in`, { method: "POST" });
      if (!res) return;
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) fetchTodayAttendance();
    } catch { setMessage("Server Error ❌"); }
  };

  /* ─── clock out ─── */
  const handleLogout = async () => {
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/attendance/clock-out`, { method: "POST" });
      if (!res) return;
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) fetchTodayAttendance();
    } catch { setMessage("Server Error ❌"); }
  };

  return (
    <>
      <style>{css}</style>
      <Header />
      <div className="ea-root">
        <div className="ea-blob ea-b1" />
        <div className="ea-blob ea-b2" />

        <div className="ea-inner">

          {/* Page header */}
          <div className="ea-page-header">
            <div className="ea-avatar">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="ea-page-title">Attendance</p>
              <p className="ea-page-sub">Path Axiom &nbsp;·&nbsp; <strong style={{color:"#1e3a8a"}}>{employeeName || "—"}</strong></p>
            </div>
          </div>

          {/* Clock buttons */}
          <div className="ea-card">
            <p className="ea-section-label">Clock Actions</p>
            <div className="ea-btn-row">
              <button className="ea-btn ea-btn-in" onClick={handleLogin}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Clock In
              </button>
              <button className="ea-btn ea-btn-out" onClick={handleLogout}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Clock Out
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={getMsgClass(message)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {message}
            </div>
          )}

          {/* Attendance table */}
          {attendance && (
            <div className="ea-card" style={{animationDelay:"0.18s"}}>
              <p className="ea-section-label">Today's Attendance</p>
              <div className="ea-table-wrap">
                <table className="ea-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Date</th><th>Clock In</th>
                      <th>Clock Out</th><th>Duration</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>{employeeName}</strong></td>
                      <td>{attendance.date}</td>
                      <td>{attendance.login  ? new Date(attendance.login).toLocaleTimeString()  : "—"}</td>
                      <td>{attendance.logout ? new Date(attendance.logout).toLocaleTimeString() : "—"}</td>
                      <td>{attendance.duration || "—"}</td>
                      <td><span className={getBadgeClass(attendance.status)}>{attendance.status}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default EmployeeAttendance;
