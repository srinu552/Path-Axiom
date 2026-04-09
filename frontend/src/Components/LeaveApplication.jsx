import React, { useEffect, useMemo, useState } from "react";
import Header from "../SmallComponents/Header";
import { useNavigate } from "react-router-dom";

const css = `
  .lv-root {
    font-family:'Outfit',sans-serif;min-height:100vh;
    background:linear-gradient(135deg,#dbeafe 0%,#eff6ff 35%,#e0f2fe 65%,#f0f9ff 100%);
    position:relative;overflow-x:hidden;padding-bottom:48px;
  }
  .lv-blob{position:fixed;border-radius:50%;pointer-events:none;animation:lvFloat 10s ease-in-out infinite;}
  .lv-b1{width:500px;height:500px;background:radial-gradient(circle,#93c5fd55,#3b82f645);filter:blur(90px);top:-150px;left:-120px;animation-delay:0s;}
  .lv-b2{width:380px;height:380px;background:radial-gradient(circle,#bfdbfe50,#60a5fa40);filter:blur(80px);bottom:-100px;right:-80px;animation-delay:3.5s;}
  @keyframes lvFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
  .lv-inner{max-width:1100px;margin:0 auto;padding:32px 16px 0;}
  .lv-card{background:rgba(255,255,255,0.58);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1.5px solid rgba(255,255,255,0.8);border-radius:22px;box-shadow:0 8px 32px rgba(59,130,246,0.09),0 2px 0 rgba(255,255,255,0.9) inset;animation:lvIn 0.5s cubic-bezier(0.22,1,0.36,1) both;}
  @keyframes lvIn{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:none}}
  /* breadcrumb */
  .lv-breadcrumb{font-size:13px;color:#64748b;margin-bottom:18px;display:flex;align-items:center;gap:6px;}
  .lv-breadcrumb-link{color:#2563eb;font-weight:600;cursor:pointer;transition:color 0.18s;}
  .lv-breadcrumb-link:hover{color:#1e3a8a;}
  /* page header */
  .lv-page-head{display:flex;align-items:center;gap:18px;padding:26px 30px;border-bottom:1.5px solid rgba(226,232,240,0.6);}
  .lv-ph-badge{width:58px;height:58px;border-radius:18px;flex-shrink:0;background:linear-gradient(140deg,#1e3a8a,#2563eb 60%,#38bdf8);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(37,99,235,0.32);}
  .lv-ph-title{font-size:22px;font-weight:800;color:#1e3a8a;letter-spacing:-0.4px;margin:0 0 3px;}
  .lv-ph-sub{font-size:13px;color:#64748b;margin:0;}
  /* stat cards */
  .lv-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:24px 30px;border-bottom:1.5px solid rgba(226,232,240,0.5);}
  @media(max-width:640px){.lv-stats{grid-template-columns:1fr;}}
  .lv-stat{background:rgba(248,250,252,0.85);border:1px solid rgba(226,232,240,0.65);border-radius:14px;padding:16px 18px;}
  .lv-stat-label{font-size:11.5px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;}
  .lv-stat-val{font-size:28px;font-weight:800;color:#0f172a;line-height:1;}
  .lv-stat-val.green{color:#15803d;}
  .lv-stat-val.amber{color:#b45309;}
  /* leave type cards */
  .lv-leaves{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:24px 30px;border-bottom:1.5px solid rgba(226,232,240,0.5);}
  @media(max-width:900px){.lv-leaves{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:500px){.lv-leaves{grid-template-columns:1fr;}}
  .lv-leave-card{border-radius:20px;padding:20px;cursor:pointer;position:relative;overflow:hidden;transition:transform 0.22s,box-shadow 0.22s;display:flex;flex-direction:column;justify-content:space-between;min-height:165px;border:none;}
  .lv-leave-card:hover{transform:translateY(-5px);box-shadow:0 16px 36px rgba(15,23,42,0.20);}
  .lv-leave-card.annual{background:linear-gradient(135deg,#1d4ed8,#3b82f6);box-shadow:0 8px 24px rgba(29,78,216,0.28);}
  .lv-leave-card.sick{background:linear-gradient(135deg,#0f766e,#14b8a6);box-shadow:0 8px 24px rgba(15,118,110,0.28);}
  .lv-leave-card.maternity{background:linear-gradient(135deg,#7e22ce,#a855f7);box-shadow:0 8px 24px rgba(126,34,206,0.28);}
  .lv-leave-card.casual{background:linear-gradient(135deg,#c2410c,#f97316);box-shadow:0 8px 24px rgba(194,65,12,0.28);}
  .lv-leave-top{display:flex;justify-content:space-between;align-items:flex-start;}
  .lv-leave-icon{font-size:26px;margin-bottom:8px;}
  .lv-leave-title{font-size:16px;font-weight:700;color:#fff;margin:0 0 4px;}
  .lv-leave-sub{font-size:12px;color:rgba(255,255,255,0.8);margin:0;}
  .lv-leave-circle{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0;backdrop-filter:blur(6px);}
  .lv-apply-btn{background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.35);color:#fff;border-radius:999px;padding:7px 16px;font-size:12.5px;font-weight:700;cursor:pointer;align-self:flex-start;margin-top:12px;transition:background 0.18s;font-family:'Outfit',sans-serif;}
  .lv-apply-btn:hover{background:rgba(255,255,255,0.35);}
  /* history */
  .lv-history-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:22px 30px 16px;}
  .lv-history-title{font-size:17px;font-weight:700;color:#0f172a;margin:0;}
  .lv-hcontrols{display:flex;gap:10px;flex-wrap:wrap;width:100%;margin-top:8px;}
  .lv-input{font-family:'Outfit',sans-serif;font-size:14px;color:#0f172a;background:rgba(255,255,255,0.72);border:1.5px solid rgba(203,213,225,0.65);border-radius:12px;padding:10px 14px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
  .lv-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3.5px rgba(59,130,246,0.14);}
  .lv-input::placeholder{color:#94a3b8;}
  .lv-export-btn{padding:10px 18px;background:linear-gradient(135deg,#166534,#22c55e);color:#fff;border:none;border-radius:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap;transition:transform 0.14s,box-shadow 0.2s;}
  .lv-export-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(34,197,94,0.32);}
  /* table */
  .lv-table-wrap{overflow-x:auto;padding:0 30px 28px;}
  .lv-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13.5px;}
  .lv-table thead th{padding:11px 14px;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:#64748b;background:rgba(248,250,252,0.85);border-bottom:1.5px solid rgba(226,232,240,0.8);white-space:nowrap;}
  .lv-table thead th:first-child{border-radius:12px 0 0 0;}
  .lv-table thead th:last-child{border-radius:0 12px 0 0;}
  .lv-table tbody td{padding:13px 14px;color:#0f172a;border-bottom:1px solid rgba(226,232,240,0.45);vertical-align:middle;}
  .lv-table tbody tr:last-child td{border-bottom:none;}
  .lv-table tbody tr:hover td{background:rgba(239,246,255,0.45);}
  .lv-empty{text-align:center;padding:36px;color:#94a3b8;font-size:14px;}
  .lv-badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:11.5px;font-weight:700;}
  .lv-badge-type{background:rgba(219,234,254,0.8);color:#1d4ed8;}
  .lv-badge-approved{background:rgba(220,252,231,0.85);color:#15803d;}
  .lv-badge-pending{background:rgba(254,243,199,0.85);color:#b45309;}
  .lv-badge-rejected{background:rgba(254,226,226,0.85);color:#b91c1c;}
  .lv-view-btn{padding:7px 16px;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;border:none;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;transition:transform 0.14s,box-shadow 0.2s;white-space:nowrap;}
  .lv-view-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(37,99,235,0.32);}
`;

export default function LeaveApplication() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [summary, setSummary] = useState({ totalApplications:0, approvedCount:0, pendingCount:0 });
  const [balances, setBalances] = useState({ annual_leave:60, sick_leave:20, maternity_leave:60, casual_leave:30 });
  const [loading, setLoading] = useState(true);

  const leaves = [
    { title:"Annual Leave",   path:"/apply-leave/Annual",   icon:"🌴", color:"annual",   days:balances.annual_leave   || 0 },
    { title:"Sick Leave",     path:"/apply-leave/Sick",     icon:"💊", color:"sick",     days:balances.sick_leave     || 0 },
    { title:"Maternity Leave",path:"/apply-leave/Maternity",icon:"👶", color:"maternity",days:balances.maternity_leave|| 0 },
    { title:"Casual Leave",   path:"/apply-leave/Casual",   icon:"☕", color:"casual",   days:balances.casual_leave   || 0 },
  ];

  useEffect(() => { fetchLeaveSummary(); }, []);

  const fetchLeaveSummary = async () => {
    try {
      const token = localStorage.getItem("employeeToken") || localStorage.getItem("adminToken");
      if (!token) { setLoading(false); return; }
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/my-summary`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setLoading(false); return; }
      setLeaveHistory(data.leaveHistory || []);
      setSummary({ totalApplications:data.totalApplications||0, approvedCount:data.approvedCount||0, pendingCount:data.pendingCount||0 });
      setBalances(data.balances || {});
    } catch(e) { console.log(e); }
    finally { setLoading(false); }
  };

  const filteredHistory = useMemo(() =>
    leaveHistory.filter((item) => {
      const v = search.toLowerCase();
      return [item.name,item.type,item.reason,item.status].some((f) => String(f||"").toLowerCase().includes(v));
    }), [leaveHistory, search]);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB");

  const exportToCSV = () => {
    if (!filteredHistory.length) { alert("No leave history to export"); return; }
    const headers = ["Name","Duration","Start Date","End Date","Type","Reason","Status"];
    const rows = filteredHistory.map((i) => [i.name,i.duration,formatDate(i.start_date),formatDate(i.end_date),i.type,i.reason,i.status]);
    const csv  = [headers,...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const url  = window.URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    const a    = document.createElement("a"); a.href=url; a.download="leave-history.csv"; a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusClass = (s) => s==="Approved"?"lv-badge lv-badge-approved":s==="Pending"?"lv-badge lv-badge-pending":"lv-badge lv-badge-rejected";

  return (
    <>
      <style>{css}</style>
      <Header />
      <div className="lv-root">
        <div className="lv-blob lv-b1"/><div className="lv-blob lv-b2"/>
        <div className="lv-inner">
          <div className="lv-card" style={{marginBottom:"22px"}}>
            {/* page header */}
            <div className="lv-page-head">
              <div className="lv-ph-badge">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="lv-ph-title">Leave Application</p>
                <p className="lv-ph-sub">Apply for leave, track requests, and review your leave history</p>
              </div>
            </div>

            {/* stat cards */}
            <div className="lv-stats">
              <div className="lv-stat">
                <p className="lv-stat-label">Total Applications</p>
                <p className="lv-stat-val">{summary.totalApplications}</p>
              </div>
              <div className="lv-stat">
                <p className="lv-stat-label">Approved Leaves</p>
                <p className="lv-stat-val green">{summary.approvedCount}</p>
              </div>
              <div className="lv-stat">
                <p className="lv-stat-label">Pending Requests</p>
                <p className="lv-stat-val amber">{summary.pendingCount}</p>
              </div>
            </div>

            {/* leave type cards */}
            <div className="lv-leaves">
              {leaves.map((item, i) => (
                <div key={i} className={`lv-leave-card ${item.color}`} onClick={() => navigate(item.path)}>
                  <div className="lv-leave-top">
                    <div>
                      <div className="lv-leave-icon">{item.icon}</div>
                      <p className="lv-leave-title">{item.title}</p>
                      <p className="lv-leave-sub">Available up to {item.days} days</p>
                    </div>
                    <div className="lv-leave-circle">{item.days}</div>
                  </div>
                  <button className="lv-apply-btn" onClick={(e) => { e.stopPropagation(); navigate(item.path); }}>
                    Apply Now
                  </button>
                </div>
              ))}
            </div>

            {/* history */}
            <div className="lv-history-head">
              <p className="lv-history-title">Leave History</p>
              <div className="lv-hcontrols">
                <input type="text" className="lv-input" style={{flex:1,minWidth:"200px"}}
                  placeholder="Search by type, reason, status…" value={search}
                  onChange={(e) => setSearch(e.target.value)} />
                <button className="lv-export-btn" onClick={exportToCSV}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle"}}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="lv-table-wrap">
              <table className="lv-table">
                <thead>
                  <tr>
                    {["Name","Duration","Start Date","End Date","Type","Reason","Status","Actions"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="lv-empty">Loading…</td></tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr><td colSpan="8" className="lv-empty">No leave history found</td></tr>
                  ) : filteredHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.duration} day(s)</td>
                      <td>{formatDate(item.start_date)}</td>
                      <td>{formatDate(item.end_date)}</td>
                      <td><span className="lv-badge lv-badge-type">{item.type}</span></td>
                      <td>{item.reason}</td>
                      <td><span className={statusClass(item.status)}>{item.status}</span></td>
                      <td>
                        <button className="lv-view-btn" onClick={() => navigate(`/leave-view/${item.id}`)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
