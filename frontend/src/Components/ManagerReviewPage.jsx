import React, { useEffect, useMemo, useState } from "react";
import Header from "../SmallComponents/Header";
import { useNavigate } from "react-router-dom";

const css = `

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mr-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 35%, #e0f2fe 65%, #f0f9ff 100%);
    position: relative;
    overflow-x: hidden;
    padding-bottom: 56px;
  }

  .mr-blob { position: fixed; border-radius: 50%; pointer-events: none; animation: mrFloat 10s ease-in-out infinite; }
  .mr-b1 { width: 520px; height: 520px; background: radial-gradient(circle, #93c5fd55, #3b82f645); filter: blur(90px); top: -160px; left: -130px; animation-delay: 0s; }
  .mr-b2 { width: 400px; height: 400px; background: radial-gradient(circle, #bfdbfe50, #60a5fa40); filter: blur(80px); bottom: -110px; right: -90px; animation-delay: 3.5s; }
  .mr-b3 { width: 260px; height: 260px; background: radial-gradient(circle, #e0f2fe55, #38bdf848); filter: blur(65px); top: 40%; left: 55%; animation-delay: 1.8s; }
  @keyframes mrFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

  .mr-inner { max-width: 1160px; margin: 0 auto; padding: 32px 16px 0; }

  /* glass card */
  .mr-card {
    background: rgba(255, 255, 255, 0.58);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255, 255, 255, 0.82);
    border-radius: 22px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.09), 0 2px 0 rgba(255, 255, 255, 0.9) inset;
    animation: mrIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes mrIn { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }

  /* page header */
  .mr-page-head {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
    padding: 26px 30px;
    border-bottom: 1.5px solid rgba(226, 232, 240, 0.6);
    margin-bottom: 0;
  }
  .mr-head-left { display: flex; align-items: center; gap: 16px; }
  .mr-badge {
    width: 58px; height: 58px; border-radius: 18px; flex-shrink: 0;
    background: linear-gradient(140deg, #1e3a8a, #2563eb 60%, #38bdf8);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 18px rgba(37, 99, 235, 0.32);
    animation: mrPop 0.48s 0.14s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes mrPop { from { opacity: 0; transform: scale(0.55); } to { opacity: 1; transform: scale(1); } }
  .mr-head-title { font-size: 21px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.4px; margin: 0 0 3px; }
  .mr-head-sub   { font-size: 13px; color: #64748b; margin: 0; }

  /* back button */
  .mr-back-btn {
    padding: 10px 20px; font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: 600;
    color: #334155; background: rgba(255, 255, 255, 0.7);
    border: 1.5px solid rgba(203, 213, 225, 0.7);
    border-radius: 12px; cursor: pointer;
    display: flex; align-items: center; gap: 7px;
    transition: transform 0.14s, box-shadow 0.2s, background 0.2s;
  }
  .mr-back-btn:hover { background: rgba(255, 255, 255, 0.92); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(59, 130, 246, 0.12); }

  /* two-col layout */
  .mr-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 24px 24px; }
  @media (max-width: 900px) { .mr-cols { grid-template-columns: 1fr; } }

  /* col inner card */
  .mr-col-card {
    background: rgba(255, 255, 255, 0.5);
    border: 1.5px solid rgba(226, 232, 240, 0.7);
    border-radius: 18px;
    overflow: hidden;
  }

  .mr-col-head {
    display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  }
  .mr-col-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }

  /* section label */
  .mr-sec { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }

  /* search + refresh */
  .mr-search-row { padding: 14px 20px; border-bottom: 1px solid rgba(226, 232, 240, 0.5); }
  .mr-input {
    width: 100%; font-family: 'Outfit', sans-serif; font-size: 14px; color: #0f172a;
    background: rgba(255, 255, 255, 0.72); border: 1.5px solid rgba(203, 213, 225, 0.65);
    border-radius: 12px; padding: 10px 14px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mr-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3.5px rgba(59, 130, 246, 0.14); }
  .mr-input::placeholder { color: #94a3b8; }

  .mr-textarea {
    width: 100%; font-family: 'Outfit', sans-serif; font-size: 14px; color: #0f172a;
    background: rgba(255, 255, 255, 0.72); border: 1.5px solid rgba(203, 213, 225, 0.65);
    border-radius: 12px; padding: 11px 14px; outline: none; resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mr-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3.5px rgba(59, 130, 246, 0.14); }
  .mr-textarea::placeholder { color: #94a3b8; }

  .mr-select {
    width: 100%; font-family: 'Outfit', sans-serif; font-size: 14px; color: #0f172a;
    background: rgba(255, 255, 255, 0.72); border: 1.5px solid rgba(203, 213, 225, 0.65);
    border-radius: 12px; padding: 11px 14px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mr-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3.5px rgba(59, 130, 246, 0.14); }

  .mr-label { display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 6px; }

  /* employee list */
  .mr-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; max-height: 520px; overflow-y: auto; }
  .mr-list::-webkit-scrollbar { width: 5px; }
  .mr-list::-webkit-scrollbar-track { background: transparent; }
  .mr-list::-webkit-scrollbar-thumb { background: rgba(203, 213, 225, 0.7); border-radius: 4px; }

  .mr-emp-item {
    border: 1.5px solid rgba(226, 232, 240, 0.7);
    border-radius: 14px; padding: 14px 16px;
    background: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    transition: transform 0.14s, box-shadow 0.2s, border-color 0.2s;
  }
  .mr-emp-item:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(59, 130, 246, 0.10); }
  .mr-emp-item.active { border-color: #3b82f6; background: rgba(239, 246, 255, 0.75); }
  .mr-emp-item.reviewed { border-color: rgba(134, 239, 172, 0.6); background: rgba(240, 253, 244, 0.7); }

  .mr-emp-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .mr-emp-name { font-size: 14.5px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
  .mr-emp-meta { font-size: 12.5px; color: #64748b; line-height: 1.6; }

  /* badges */
  .mr-badge-pill {
    display: inline-block; padding: 4px 12px; border-radius: 999px;
    font-size: 11.5px; font-weight: 700;
  }
  .mr-badge-submitted { background: rgba(219, 234, 254, 0.85); color: #1d4ed8; }
  .mr-badge-reviewed  { background: rgba(220, 252, 231, 0.85); color: #15803d; }

  /* select button */
  .mr-select-btn {
    padding: 7px 14px; font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600;
    color: #fff; background: linear-gradient(135deg, #1e3a8a, #2563eb);
    border: none; border-radius: 10px; cursor: pointer; white-space: nowrap;
    transition: transform 0.14s, box-shadow 0.2s;
    box-shadow: 0 3px 10px rgba(37, 99, 235, 0.25);
  }
  .mr-select-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(37, 99, 235, 0.32); }

  .mr-refresh-btn {
    padding: 8px 16px; font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600;
    color: #334155; background: rgba(255, 255, 255, 0.7);
    border: 1.5px solid rgba(203, 213, 225, 0.7); border-radius: 10px; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: background 0.18s, transform 0.14s;
  }
  .mr-refresh-btn:hover { background: rgba(255, 255, 255, 0.92); transform: translateY(-1px); }
  .mr-refresh-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* right panel */
  .mr-right-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

  /* selected employee card */
  .mr-sel-card {
    background: rgba(239, 246, 255, 0.75);
    border: 1.5px solid rgba(147, 197, 253, 0.5);
    border-radius: 16px; padding: 18px;
  }
  .mr-sel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 600px) { .mr-sel-grid { grid-template-columns: 1fr; } }
  .mr-sel-row { font-size: 13px; color: #334155; padding: 5px 0; border-bottom: 1px solid rgba(226, 232, 240, 0.5); }
  .mr-sel-row:last-child { border-bottom: none; }
  .mr-sel-row.full { grid-column: 1 / -1; }
  .mr-sel-key { font-weight: 700; color: #0f172a; }

  /* stars */
  .mr-stars { display: inline-flex; gap: 2px; margin-left: 4px; }
  .mr-star { font-size: 13px; }

  /* placeholder info */
  .mr-placeholder {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; padding: 32px; text-align: center;
    background: rgba(248, 250, 252, 0.7); border: 1.5px dashed rgba(203, 213, 225, 0.7);
    border-radius: 16px; color: #94a3b8;
  }
  .mr-placeholder p { font-size: 14px; font-weight: 500; margin: 0; }

  /* submit btn */
  .mr-submit-btn {
    width: 100%; padding: 13px; font-family: 'Outfit', sans-serif; font-size: 14.5px; font-weight: 700;
    color: #fff; background: linear-gradient(135deg, #166534, #22c55e);
    border: none; border-radius: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.28);
    transition: transform 0.14s, box-shadow 0.2s;
  }
  .mr-submit-btn:hover:not(:disabled) { transform: translateY(-1.5px); box-shadow: 0 8px 22px rgba(34, 197, 94, 0.36); }
  .mr-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* alerts */
  .mr-alert {
    padding: 11px 15px; border-radius: 12px; font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    animation: mrIn 0.3s ease both;
  }
  .mr-alert-success { background: rgba(220, 252, 231, 0.8); color: #15803d; border: 1px solid rgba(134, 239, 172, 0.5); }
  .mr-alert-danger  { background: rgba(254, 226, 226, 0.8); color: #b91c1c; border: 1px solid rgba(252, 165, 165, 0.5); }

  /* empty state */
  .mr-empty { padding: 36px; text-align: center; color: #94a3b8; font-size: 14px; }

  @media (max-width: 600px) {
    .mr-cols { padding: 16px; }
    .mr-col-head { padding: 14px 16px; }
    .mr-list { padding: 12px 14px; }
    .mr-right-body { padding: 14px; }
  }
`;

function StarRating({ n }) {
  return (
    <span className="mr-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="mr-star" style={{ color: s <= n ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );
}

export default function ManagerReviewPage() {
  const navigate = useNavigate();

  const [appraisals,        setAppraisals]        = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [search,            setSearch]            = useState("");
  const [rating,            setRating]            = useState("5");
  const [comments,          setComments]          = useState("");
  const [loading,           setLoading]           = useState(false);
  const [fetching,          setFetching]          = useState(false);
  const [message,           setMessage]           = useState("");
  const [error,             setError]             = useState("");

  const token = localStorage.getItem("employeeToken") || localStorage.getItem("managerToken");

  const loggedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("employeeUser")) || JSON.parse(localStorage.getItem("managerUser")) || null;
    } catch { return null; }
  })();

  const normalizedRole = String(loggedUser?.role || "").toLowerCase();

  useEffect(() => {
    if (normalizedRole !== "manager") { navigate("/employeedashboard"); return; }
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      setFetching(true); setError("");
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/appraisals/manager`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to fetch appraisals"); setAppraisals([]); return; }
      setAppraisals(Array.isArray(data) ? data : []);
    } catch { setError("Server error while loading employee appraisals"); setAppraisals([]); }
    finally { setFetching(false); }
  };

  const filtered = useMemo(() => {
    const v = search.toLowerCase().trim();
    return appraisals.filter((i) =>
      [i.employeeName, i.employeeId, i.department, i.designation, i.projectName, i.taskTitle, i.reviewPeriod]
        .some((f) => String(f || "").toLowerCase().includes(v))
    );
  }, [appraisals, search]);

  const submitReview = async () => {
    setError(""); setMessage("");
    if (!selectedAppraisal)                                         return setError("Please select an appraisal");
    if (!rating)                                                    return setError("Please select a rating");
    if (selectedAppraisal.status === "Reviewed by Manager")         return setError("This appraisal is already reviewed");
    try {
      setLoading(true);
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/manager-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appraisalId: selectedAppraisal.id, revieweeId: selectedAppraisal.employeeUserId, rating: Number(rating), comments: comments.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to submit review"); return; }
      setMessage(data.message || "Employee appraisal reviewed successfully");
      setComments(""); setRating("5"); setSelectedAppraisal(null);
      fetchAppraisals();
    } catch { setError("Server error while submitting review"); }
    finally { setLoading(false); }
  };

  const isReviewed = (item) => item?.status === "Reviewed by Manager";

  return (
    <>
      <style>{css}</style>
      <Header />
      <div className="mr-root">
        <div className="mr-blob mr-b1" /><div className="mr-blob mr-b2" /><div className="mr-blob mr-b3" />
        <div className="mr-inner">

          {/* ── Page header card ── */}
          <div className="mr-card" style={{ marginBottom: "22px" }}>
            <div className="mr-page-head">
              <div className="mr-head-left">
                <div className="mr-badge">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div>
                  <p className="mr-head-title">Review Employee Appraisals</p>
                  <p className="mr-head-sub">Manager can review only submitted employee appraisals here</p>
                </div>
              </div>
              <button className="mr-back-btn" onClick={() => navigate("/employeedashboard")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back to Dashboard
              </button>
            </div>

            {/* ── Two columns ── */}
            <div className="mr-cols">

              {/* LEFT — appraisal list */}
              <div className="mr-col-card" style={{ animationDelay: "0.06s" }}>
                <div className="mr-col-head">
                  <p className="mr-col-title">Employee Appraisal List</p>
                  <button className="mr-refresh-btn" onClick={fetchAppraisals} disabled={fetching}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ animation: fetching ? "spin 0.8s linear infinite" : "none" }}>
                      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    {fetching ? "Refreshing…" : "Refresh"}
                  </button>
                </div>

                <div className="mr-search-row">
                  <input type="text" className="mr-input"
                    placeholder="Search by name, ID, project, task, department…"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <div className="mr-list">
                  {fetching ? (
                    <p className="mr-empty">Loading employee appraisals…</p>
                  ) : filtered.length === 0 ? (
                    <p className="mr-empty">No employee appraisals found</p>
                  ) : (
                    filtered.map((item) => (
                      <div
                        key={item.id}
                        className={`mr-emp-item${selectedAppraisal?.id === item.id ? " active" : ""}${isReviewed(item) ? " reviewed" : ""}`}
                        onClick={() => setSelectedAppraisal(item)}
                      >
                        <div className="mr-emp-row">
                          <div style={{ flex: 1 }}>
                            <p className="mr-emp-name">{item.employeeName || "No Name"}</p>
                            <p className="mr-emp-meta">
                              ID: {item.employeeId || "N/A"} &nbsp;·&nbsp; {item.department || "N/A"}<br />
                              {item.designation || "N/A"} &nbsp;·&nbsp; {item.projectName || "N/A"}<br />
                              <em style={{ color: "#94a3b8" }}>{item.taskTitle || "N/A"}</em>
                            </p>
                            <span className={`mr-badge-pill ${isReviewed(item) ? "mr-badge-reviewed" : "mr-badge-submitted"}`} style={{ marginTop: 8, display: "inline-block" }}>
                              {item.status || "Submitted"}
                            </span>
                          </div>
                          <button className="mr-select-btn" onClick={(e) => { e.stopPropagation(); setSelectedAppraisal(item); }}>
                            Select
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT — review form */}
              <div className="mr-col-card" style={{ animationDelay: "0.12s" }}>
                <div className="mr-col-head">
                  <p className="mr-col-title">Submit Employee Review</p>
                  {selectedAppraisal && (
                    <span className={`mr-badge-pill ${isReviewed(selectedAppraisal) ? "mr-badge-reviewed" : "mr-badge-submitted"}`}>
                      {selectedAppraisal.status}
                    </span>
                  )}
                </div>

                <div className="mr-right-body">

                  {/* selected appraisal detail */}
                  {selectedAppraisal ? (
                    <div className="mr-sel-card">
                      <p className="mr-sec">Appraisal Details</p>
                      <div className="mr-sel-grid">
                        {[
                          ["Name",        selectedAppraisal.employeeName],
                          ["Employee ID", selectedAppraisal.employeeId],
                          ["Department",  selectedAppraisal.department],
                          ["Designation", selectedAppraisal.designation],
                          ["Review Period", selectedAppraisal.reviewPeriod],
                          ["Project",     selectedAppraisal.projectName],
                        ].map(([k, v]) => (
                          <div className="mr-sel-row" key={k}>
                            <span className="mr-sel-key">{k}:</span> {v || "N/A"}
                          </div>
                        ))}
                        <div className="mr-sel-row full"><span className="mr-sel-key">Task Title:</span> {selectedAppraisal.taskTitle || "N/A"}</div>
                        <div className="mr-sel-row full"><span className="mr-sel-key">Task Description:</span> {selectedAppraisal.taskDescription || "N/A"}</div>
                        <div className="mr-sel-row full"><span className="mr-sel-key">Achievements:</span> {selectedAppraisal.achievements || "N/A"}</div>
                        <div className="mr-sel-row full"><span className="mr-sel-key">Challenges:</span> {selectedAppraisal.challenges || "N/A"}</div>
                        <div className="mr-sel-row full"><span className="mr-sel-key">Skills Improved:</span> {selectedAppraisal.skillsImproved || "N/A"}</div>
                        <div className="mr-sel-row full"><span className="mr-sel-key">Support Needed:</span> {selectedAppraisal.managerSupport || "N/A"}</div>
                        <div className="mr-sel-row full"><span className="mr-sel-key">Goals:</span> {selectedAppraisal.goals || "N/A"}</div>
                        <div className="mr-sel-row">
                          <span className="mr-sel-key">Self Rating:</span>
                          <StarRating n={Number(selectedAppraisal.rating)} /> {selectedAppraisal.rating}/5
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mr-placeholder">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      <p>Select an employee appraisal from the list to review it</p>
                    </div>
                  )}

                  {/* manager rating */}
                  <div>
                    <label className="mr-label">Manager Rating</label>
                    <select className="mr-select" value={rating} onChange={(e) => setRating(e.target.value)}>
                      <option value="5">5 — Excellent</option>
                      <option value="4">4 — Good</option>
                      <option value="3">3 — Average</option>
                      <option value="2">2 — Needs Improvement</option>
                      <option value="1">1 — Poor</option>
                    </select>
                  </div>

                  {/* comments */}
                  <div>
                    <label className="mr-label">Manager Comments</label>
                    <textarea
                      className="mr-textarea" rows="5"
                      placeholder="Write your review comments…"
                      value={comments} onChange={(e) => setComments(e.target.value)}
                    />
                  </div>

                  {/* submit */}
                  <button
                    className="mr-submit-btn"
                    onClick={submitReview}
                    disabled={loading || !selectedAppraisal || isReviewed(selectedAppraisal)}
                  >
                    {loading ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ animation: "spin 0.7s linear infinite" }}>
                          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                        </svg>
                        Submitting…
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Submit Review
                      </>
                    )}
                  </button>

                  {error   && <div className="mr-alert mr-alert-danger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                  {message && <div className="mr-alert mr-alert-success"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>{message}</div>}
                </div>
              </div>

            </div>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </>
  );
}
