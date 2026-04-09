import React, { useEffect, useState } from "react";

export default function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true); setErrorMsg("");
      const token = localStorage.getItem("adminToken");
      if (!token) { setErrorMsg("Admin token not found. Please login again."); setLeaves([]); setLoading(false); return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/admin/all`, { method: "GET", headers: { Authorization: `Bearer ${token}` } });
      let data;
      try { data = await res.json(); } catch { setErrorMsg("Server did not return valid JSON."); setLeaves([]); setLoading(false); return; }
      if (!res.ok) { setErrorMsg(data.message || "Failed to fetch leave requests."); setLeaves([]); setLoading(false); return; }
      setLeaves(Array.isArray(data) ? data : []);
      if (!Array.isArray(data)) setErrorMsg("API response is not an array.");
      setLoading(false);
    } catch { setErrorMsg("Something went wrong while fetching leave requests."); setLeaves([]); setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id + status);
      const token = localStorage.getItem("adminToken");
      if (!token) { alert("Admin token not found."); return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/admin/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, admin_remark: `${status} by admin` }),
      });
      let data;
      try { data = await res.json(); } catch { alert("Server did not return valid JSON"); return; }
      if (!res.ok) { alert(data.message || "Failed to update"); return; }
      alert(data.message || `Leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch { alert("Something went wrong while updating status"); }
    finally { setActionLoading(null); }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const counts = {
    All: leaves.length,
    Pending: leaves.filter(l => !l.status || l.status === "Pending").length,
    Approved: leaves.filter(l => l.status === "Approved").length,
    Rejected: leaves.filter(l => l.status === "Rejected").length,
  };

  const filtered = filter === "All" ? leaves : leaves.filter(l =>
    filter === "Pending" ? (!l.status || l.status === "Pending") : l.status === filter
  );

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const avatarGradients = [
    "linear-gradient(135deg,#a78bfa,#6366f1)",
    "linear-gradient(135deg,#f472b6,#ec4899)",
    "linear-gradient(135deg,#34d399,#059669)",
    "linear-gradient(135deg,#fb923c,#f59e0b)",
    "linear-gradient(135deg,#38bdf8,#0ea5e9)",
    "linear-gradient(135deg,#f87171,#ef4444)",
    "linear-gradient(135deg,#a3e635,#65a30d)",
  ];
  const getAvatar = (name) => avatarGradients[(name || "").charCodeAt(0) % avatarGradients.length];

  return (
    <>
      <style>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .alm-bg {
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow-x: hidden;
          background: transparent;
          padding: 36px 28px 60px;
        }

        .alm-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }
        .alm-blob-1 { width: 550px; height: 550px;  top: -140px; left: -120px; animation: drift 14s ease-in-out infinite alternate; }
        .alm-blob-2 { width: 420px; height: 420px;  top: 35%; right: -100px; animation: drift 18s ease-in-out infinite alternate-reverse; }
        .alm-blob-3 { width: 340px; height: 340px; bottom: 5%; left: 32%; animation: drift 12s ease-in-out infinite alternate; }
        @keyframes drift { from{transform:translate(0,0) scale(1);} to{transform:translate(28px,18px) scale(1.07);} }

        .alm-content { position: relative; z-index: 2; max-width: 1300px; margin: 0 auto; }

        /* ── Header ── */
        .alm-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 30px; flex-wrap: wrap; gap: 16px;
        }
        .alm-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
          color: #a78bfa; margin-bottom: 6px;
        }
        .alm-title {
          font-size: 34px; font-weight: 800; color: #070707; line-height: 1; letter-spacing: -0.5px;
        }
        .alm-subtitle { font-size: 13px; color: rgba(0, 0, 0, 0.38); margin-top: 6px; font-weight: 300; }

        .alm-refresh-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 12px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          color: rgba(196, 11, 11, 0.75); cursor: pointer;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          transition: all 0.2s;
        }
        .alm-refresh-btn:hover { background: rgba(255,255,255,0.14); color: rgba(0, 0, 0, 0.38); border-color:rgba(255,255,255,0.24); }
        .alm-refresh-btn:disabled { opacity:0.4; cursor:not-allowed; }

        /* ── Stats ── */
        .alm-stats {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px;
        }
        .alm-stat {
          padding: 22px 22px 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.12);
          position: relative; overflow: hidden;
          transition: transform 0.2s, background 0.2s;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .alm-stat::after {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
        }
        .alm-stat:hover { transform: translateY(-3px); background: rgba(255,255,255,0.11); }
        .alm-stat-icon { font-size:24px; margin-bottom:12px; }
        .alm-stat-label { font-size:11px; font-weight:500; letter-spacing:0.13em; text-transform:uppercase; color:rgba(0, 0, 0, 0.9); margin-bottom:4px; }
        .alm-stat-count { font-size:38px; font-weight:800; line-height:1; }
        .alm-stat-count.total    {color: rgba(0, 0, 0, 0.38); }
        .alm-stat-count.pending  { color: rgba(0, 0, 0, 0.38); text-shadow:0 0 20px rgba(251,191,36,0.4); }
        .alm-stat-count.approved {color: rgba(0, 0, 0, 0.38); text-shadow:0 0 20px rgba(52,211,153,0.4); }
        .alm-stat-count.rejected { color: rgba(0, 0, 0, 0.38); text-shadow:0 0 20px rgba(248,113,113,0.4); }

        /* ── Tabs ── */
        .alm-tabs { display:flex; gap:6px; margin-bottom:20px; flex-wrap:wrap; }
        .alm-tab {
          display:flex; align-items:center; gap:8px;
          padding:9px 18px; border-radius:50px;
          font-family:'Outfit',sans-serif; font-size:13px; font-weight:500;
          cursor:pointer;
          border:1px solid rgba(255,255,255,0.09);
          background:rgba(255,255,255,0.04);
          color:rgba(0, 0, 0, 0.87);
          backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
          transition:all 0.18s;
        }
        .alm-tab:hover { color:rgba(102, 52, 52, 0.8); background:rgba(255,255,255,0.09); }
        .alm-tab.active {
          background:rgba(167,139,250,0.18);
          color: rgba(0, 0, 0, 0.38);
          border-color:rgba(11, 4, 33, 0.35);
          box-shadow:0 0 18px rgba(139,92,246,0.22);
        }
        .alm-tab-badge {
          font-size:11px; font-weight:700; padding:1px 8px; border-radius:999px;
          background:rgba(255,255,255,0.07); color:rgba(5, 5, 5, 0.38);
        }
        .alm-tab.active .alm-tab-badge { background:rgba(139,92,246,0.3); color:#c4b5fd; }

        /* ── State boxes ── */
        .alm-state-box {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:64px 24px; text-align:center; gap:12px;
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(15, 15, 15, 0.09);
          border-radius:20px;
          box-shadow:0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .alm-state-icon { font-size:42px; }
        .alm-state-title { font-size:17px; font-weight:700; color:rgba(255,255,255,0.82); }
        .alm-state-desc { font-size:13px; color:rgba(255,255,255,0.33); max-width:260px; font-weight:300; }

        .alm-spinner {
          width:30px; height:30px;
          border:3px solid rgba(255,255,255,0.08);
          border-top-color:#a78bfa;
          border-radius:50%;
          animation:spin 0.7s linear infinite;
        }
        @keyframes spin { to{transform:rotate(360deg);} }

        /* ── Table ── */
        .alm-table-card {
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(28px) saturate(1.6); -webkit-backdrop-filter:blur(28px) saturate(1.6);
          border:1px solid rgba(3, 3, 3, 0.11);
          border-radius:20px; overflow:hidden;
          box-shadow:0 24px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12);
        }

        .alm-table-scroll { overflow-x:auto; }
        .alm-table-scroll::-webkit-scrollbar { height:4px; }
        .alm-table-scroll::-webkit-scrollbar-track { background:transparent; }
        .alm-table-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:99px; }

        table.alm-table { width:100%; border-collapse:collapse; min-width:920px; }

        .alm-table thead tr {
          background:rgba(255,255,255,0.04);
          border-bottom:1px solid rgba(3, 3, 3, 0.07);
        }
        .alm-table thead th {
          padding:15px 18px; text-align:left;
          font-size:11px; font-weight:600; letter-spacing:0.13em; text-transform:uppercase;
          color:rgba(0, 0, 0, 0.7);
        }

        .alm-table tbody tr {
          border-bottom:1px solid rgba(3, 3, 3, 0.56);
          transition:background 0.15s;
          animation:rowIn 0.35s ease both;
        }
        .alm-table tbody tr:last-child { border-bottom:none; }
        .alm-table tbody tr:hover { background:rgba(255,255,255,0.04); }
        @keyframes rowIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }

        .alm-table td { padding:15px 18px; font-size:13.5px; color:rgba(0, 0, 0, 0.76); vertical-align:middle; }

        /* Person */
        .alm-person { display:flex; align-items:center; gap:12px; }
        .alm-avatar {
          width:36px; height:36px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:700; color:#fff; flex-shrink:0;
          box-shadow:0 4px 14px rgba(0,0,0,0.35);
        }
        .alm-person-name { font-size:14px; font-weight:600; color:rgba(0, 0, 0, 0.73); }
        .alm-person-email { font-size:11.5px; color:rgba(0, 0, 0, 0.76); margin-top:2px; }

        /* Type */
        .alm-type-chip {
          display:inline-block; padding:4px 11px; border-radius:7px;
          font-size:12px; font-weight:600;
          background:rgba(139,92,246,0.14); color:#c4b5fd;
          border:1px solid rgba(139,92,246,0.22);
        }

        .alm-reason { max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .alm-dur { font-size:17px; font-weight:700; color:rgba(5, 5, 5, 0.47); }
        .alm-dur-unit { font-size:11px; color:rgba(0, 0, 0, 0.66); }
        .alm-date { font-size:12.5px; color:rgba(0, 0, 0, 0.64); white-space:nowrap; }

        /* Badge */
        .alm-badge {
          display:inline-flex; align-items:center; gap:6px;
          padding:5px 12px; border-radius:999px;
          font-size:12px; font-weight:600; white-space:nowrap;
          backdrop-filter:blur(8px);
        }
        .alm-badge-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
        .alm-badge.pending  { background:rgba(251,191,36,0.1);  color:#fcd34d; border:1px solid rgba(251, 190, 36, 0.67); }
        .alm-badge.pending  .alm-badge-dot { background:#f59e0b; box-shadow:0 0 7px #f59e0b; }
        .alm-badge.approved { background:rgba(52,211,153,0.1);  color:#6ee7b7; border:1px solid rgba(52, 211, 153, 0.65); }
        .alm-badge.approved .alm-badge-dot { background:#10b981; box-shadow:0 0 7px #10b981; }
        .alm-badge.rejected { background:rgba(248,113,113,0.1); color:#fca5a5; border:1px solid rgba(248, 113, 113, 0.66); }
        .alm-badge.rejected .alm-badge-dot { background:#ef4444; box-shadow:0 0 7px #ef4444; }

        /* Buttons */
        .alm-actions { display:flex; gap:8px; flex-wrap:wrap; }
        .alm-btn {
          display:flex; align-items:center; gap:5px;
          padding:7px 14px; border-radius:9px;
          font-family:'Outfit',sans-serif; font-size:12.5px; font-weight:600;
          cursor:pointer; border:1px solid transparent;
          backdrop-filter:blur(10px); transition:all 0.18s; white-space:nowrap;
        }
        .alm-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .alm-btn-approve {
          background:rgba(52,211,153,0.1); color:#6ee7b7; border-color:rgba(52,211,153,0.22);
        }
        .alm-btn-approve:hover:not(:disabled) {
          background:rgba(52,211,153,0.22); color:#fff; box-shadow:0 0 18px rgba(16,185,129,0.28);
        }
        .alm-btn-reject {
          background:rgba(248,113,113,0.09); color:#fca5a5; border-color:rgba(248,113,113,0.2);
        }
        .alm-btn-reject:hover:not(:disabled) {
          background:rgba(248,113,113,0.2); color:#fff; box-shadow:0 0 18px rgba(239,68,68,0.28);
        }

        .alm-done { font-size:12px; font-weight:500; color:rgba(0, 0, 0, 0.63); display:flex; align-items:center; gap:5px; }

       
        @media(max-width:900px){.alm-stats{grid-template-columns:repeat(2,1fr);}.alm-bg{padding:20px 14px 40px;}.alm-title{font-size:26px;}}
        @media(max-width:500px){.alm-stats{grid-template-columns:1fr 1fr;}}
      `}</style>

      <div className="alm-bg">
        <div className="alm-blob alm-blob-1" />
        <div className="alm-blob alm-blob-2" />
        <div className="alm-blob alm-blob-3" />

        <div className="alm-content">

          {/* Header */}
          <div className="alm-header">
            <div>
              
              <div className="alm-title">Leave Management</div>
              <div className="alm-subtitle">Review and manage employee leave requests</div>
            </div>
            <button className="alm-refresh-btn" onClick={fetchLeaves} disabled={loading}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M14 8A6 6 0 1 1 8 2a6 6 0 0 1 4.243 1.757L14 2v4h-4l1.5-1.5A4 4 0 1 0 12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="alm-stats">
            {[
              { label:"Total",    key:"All",      cls:"total",    icon:"📋" },
              { label:"Pending",  key:"Pending",  cls:"pending",  icon:"⏳" },
              { label:"Approved", key:"Approved", cls:"approved", icon:"✅" },
              { label:"Rejected", key:"Rejected", cls:"rejected", icon:"❌" },
            ].map(s => (
              <div className="alm-stat" key={s.key}>
                <div className="alm-stat-icon">{s.icon}</div>
                <div className="alm-stat-label">{s.label}</div>
                <div className={`alm-stat-count ${s.cls}`}>{counts[s.key]}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="alm-tabs">
            {["All","Pending","Approved","Rejected"].map(tab => (
              <button key={tab} className={`alm-tab ${filter===tab?"active":""}`} onClick={()=>setFilter(tab)}>
                {tab}
                <span className="alm-tab-badge">{counts[tab]}</span>
              </button>
            ))}
          </div>

          {/* States */}
          {loading && (
            <div className="alm-state-box">
              <div className="alm-spinner" />
              <div className="alm-state-title">Loading requests…</div>
              <div className="alm-state-desc">Pulling the latest data from the server</div>
            </div>
          )}
          {!loading && errorMsg && (
            <div className="alm-state-box">
              <div className="alm-state-icon">⚠️</div>
              <div className="alm-state-title">Something went wrong</div>
              <div className="alm-state-desc">{errorMsg}</div>
            </div>
          )}
          {!loading && !errorMsg && filtered.length === 0 && (
            <div className="alm-state-box">
              <div className="alm-state-icon">🗂️</div>
              <div className="alm-state-title">No requests found</div>
              <div className="alm-state-desc">
                {filter==="All" ? "No leave requests yet." : `No ${filter.toLowerCase()} requests at the moment.`}
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && !errorMsg && filtered.length > 0 && (
            <div className="alm-table-card">
              <div className="alm-table-scroll">
                <table className="alm-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Days</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, i) => {
                      const isPending = !item.status || item.status === "Pending";
                      const statusKey = isPending ? "pending" : item.status==="Approved" ? "approved" : "rejected";
                      return (
                        <tr key={item.id} style={{ animationDelay:`${i*40}ms` }}>
                          <td>
                            <div className="alm-person">
                              <div className="alm-avatar" style={{ background: getAvatar(item.name) }}>
                                {getInitials(item.name)}
                              </div>
                              <div>
                                <div className="alm-person-name">{item.name||"—"}</div>
                                <div className="alm-person-email">{item.email||"—"}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="alm-type-chip">{item.leave_type||"—"}</span></td>
                          <td><span className="alm-reason" title={item.reason}>{item.reason||"—"}</span></td>
                          <td>
                            {item.duration!=null
                              ? <><span className="alm-dur">{item.duration}</span><span className="alm-dur-unit"> d</span></>
                              : "—"}
                          </td>
                          <td><span className="alm-date">{formatDate(item.start_date)}</span></td>
                          <td><span className="alm-date">{formatDate(item.end_date)}</span></td>
                          <td>
                            <span className={`alm-badge ${statusKey}`}>
                              <span className="alm-badge-dot"/>
                              {item.status||"Pending"}
                            </span>
                          </td>
                          <td>
                            {isPending ? (
                              <div className="alm-actions">
                                <button
                                  className="alm-btn alm-btn-approve"
                                  onClick={()=>updateStatus(item.id,"Approved")}
                                  disabled={actionLoading===item.id+"Approved"}
                                >
                                  {actionLoading===item.id+"Approved" ? "…" : "✓ Approve"}
                                </button>
                                <button
                                  className="alm-btn alm-btn-reject"
                                  onClick={()=>updateStatus(item.id,"Rejected")}
                                  disabled={actionLoading===item.id+"Rejected"}
                                >
                                  {actionLoading===item.id+"Rejected" ? "…" : "✕ Reject"}
                                </button>
                              </div>
                            ) : (
                              <span className="alm-done">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                  <circle cx="8" cy="8" r="7" stroke="rgba(0, 0, 0, 0.71)" strokeWidth="1.5"/>
                                  <path d="M5 8l2 2 4-4" stroke="rgba(31, 28, 28, 0.88)" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                Resolved
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
