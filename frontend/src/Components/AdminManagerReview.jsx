import React, { useEffect, useMemo, useState } from "react";

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .amr-root {
    min-height: 100vh;
    background: transparent;
    font-family: 'Sora', sans-serif;
    padding: 32px 24px;
    position: relative;
    overflow-x: hidden;
  }

  .amr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    position: relative;
    z-index: 2;
  }

  .amr-title {
    font-size: 24px;
    font-weight: 700;
    color: #1e1b4b;
    letter-spacing: -0.5px;
  }

  .amr-title span {
    background: linear-gradient(90deg, #7c3aed, #2563eb);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .amr-refresh-btn {
    background: rgba(255,255,255,0.55);
    border: 1px solid rgba(124,58,237,0.25);
    color: #5b21b6;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 9px 20px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .amr-refresh-btn:hover {
    background: rgba(124,58,237,0.1);
    border-color: rgba(124,58,237,0.5);
    color: #4c1d95;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(124,58,237,0.15);
  }

  .amr-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    position: relative;
    z-index: 2;
  }

  @media (max-width: 900px) {
    .amr-grid { grid-template-columns: 1fr; }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid rgba(255, 255, 255, 0.65);
    border-radius: 22px;
    padding: 26px;
    box-shadow:
      0 4px 24px rgba(99,60,200,0.08),
      0 1px 0 rgba(255,255,255,0.8) inset,
      0 -1px 0 rgba(99,60,200,0.06) inset;
  }

  .glass-card-title {
    font-size: 11px;
    font-weight: 700;
    color: #6d28d9;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 18px;
    opacity: 0.75;
  }

  .amr-search {
    width: 100%;
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(124,58,237,0.18);
    border-radius: 12px;
    padding: 10px 16px;
    color: #1e1b4b;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    outline: none;
    margin-bottom: 14px;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .amr-search::placeholder { color: #a78bfa; opacity: 0.7; }

  .amr-search:focus {
    border-color: rgba(124,58,237,0.45);
    background: rgba(255,255,255,0.7);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }

  .manager-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
    max-height: 500px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .manager-list::-webkit-scrollbar { width: 4px; }
  .manager-list::-webkit-scrollbar-track { background: transparent; }
  .manager-list::-webkit-scrollbar-thumb {
    background: rgba(124,58,237,0.2);
    border-radius: 4px;
  }

  .manager-card {
    background: rgba(255,255,255,0.28);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 14px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 13px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .manager-card:hover {
    background: rgba(255,255,255,0.55);
    border-color: rgba(124,58,237,0.3);
    transform: translateX(5px);
    box-shadow: 0 4px 16px rgba(99,60,200,0.1);
  }

  .manager-card.selected {
    background: rgba(124, 58, 237, 0.1);
    border-color: rgba(124, 58, 237, 0.45);
    box-shadow:
      0 4px 20px rgba(124,58,237,0.14),
      0 0 0 1px rgba(124,58,237,0.15) inset;
    transform: translateX(5px);
  }

  .manager-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #2563eb);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 10px rgba(124,58,237,0.3);
  }

  .manager-info { flex: 1; min-width: 0; }

  .manager-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e1b4b;
    margin-bottom: 2px;
  }

  .manager-meta {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.6;
    font-family: 'JetBrains Mono', monospace;
  }

  .manager-dept-badge {
    font-size: 10px;
    padding: 3px 10px;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 50px;
    color: #6d28d9;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .selected-panel {
    background: rgba(255,255,255,0.4);
    border: 1px solid rgba(124,58,237,0.25);
    border-radius: 18px;
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
    animation: slideIn 0.28s ease;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .selected-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2.5px;
    background: linear-gradient(90deg, #7c3aed, #2563eb, #06b6d4);
    border-radius: 2px 2px 0 0;
  }

  .selected-panel::after {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .selected-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .selected-avatar {
    width: 50px;
    height: 50px;
    border-radius: 15px;
    background: linear-gradient(135deg, #7c3aed, #2563eb);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 19px;
    color: #fff;
    box-shadow: 0 4px 16px rgba(124,58,237,0.35);
    flex-shrink: 0;
  }

  .selected-name {
    font-size: 16px;
    font-weight: 700;
    color: #1e1b4b;
  }

  .selected-title-sub {
    font-size: 12px;
    color: #6d28d9;
    margin-top: 2px;
    font-weight: 500;
    opacity: 0.8;
  }

  .selected-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-bottom: 2px;
  }

  .stat-chip {
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.75);
    border-radius: 12px;
    padding: 10px 13px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .stat-label {
    font-size: 9.5px;
    color: #9ca3af;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    margin-bottom: 4px;
    font-weight: 600;
  }

  .stat-value {
    font-size: 12.5px;
    font-weight: 600;
    color: #1e1b4b;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activities-section { margin-top: 14px; }

  .activities-title {
    font-size: 10px;
    font-weight: 700;
    color: #9ca3af;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin-bottom: 9px;
  }

  .activity-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid rgba(0,0,0,0.04);
    font-size: 12px;
    color: #374151;
    font-weight: 400;
  }

  .activity-row:last-child { border-bottom: none; }

  .activity-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .appraisal-section {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgba(124,58,237,0.12);
  }

  .appraisal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }

  @media (max-width: 600px) {
    .appraisal-grid { grid-template-columns: 1fr; }
  }

  .appraisal-card {
    background: rgba(255,255,255,0.45);
    border: 1px solid rgba(255,255,255,0.72);
    border-radius: 12px;
    padding: 12px;
  }

  .appraisal-card .label {
    font-size: 9.5px;
    color: #9ca3af;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 5px;
    font-weight: 700;
  }

  .appraisal-card .value {
    font-size: 12.5px;
    color: #1e1b4b;
    font-weight: 600;
    line-height: 1.5;
    word-break: break-word;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 92px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: capitalize;
    letter-spacing: 0.3px;
  }

  .status-pending {
    background: rgba(245, 158, 11, 0.12);
    color: #b45309;
    border: 1px solid rgba(245, 158, 11, 0.25);
  }

  .status-approved {
    background: rgba(34, 197, 94, 0.12);
    color: #15803d;
    border: 1px solid rgba(34, 197, 94, 0.25);
  }

  .status-rejected {
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .status-default {
    background: rgba(99, 102, 241, 0.1);
    color: #4338ca;
    border: 1px solid rgba(99, 102, 241, 0.2);
  }

  .appraisal-block {
    background: rgba(255,255,255,0.38);
    border: 1px solid rgba(255,255,255,0.72);
    border-radius: 14px;
    padding: 13px 14px;
    margin-bottom: 10px;
  }

  .appraisal-block:last-child { margin-bottom: 0; }

  .appraisal-block-title {
    font-size: 10px;
    font-weight: 700;
    color: #6d28d9;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .appraisal-block-text {
    font-size: 12.5px;
    color: #374151;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .appraisal-empty {
    background: rgba(255,255,255,0.28);
    border: 1px dashed rgba(124,58,237,0.22);
    border-radius: 14px;
    padding: 14px;
    font-size: 12.5px;
    color: #6b7280;
    text-align: center;
  }

  .appraisal-loading {
    font-size: 12.5px;
    color: #6b7280;
    padding: 10px 0;
  }

  .empty-panel {
    background: rgba(255,255,255,0.2);
    border: 1.5px dashed rgba(124,58,237,0.2);
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 20px;
    text-align: center;
  }

  .empty-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.35; }
  .empty-text { font-size: 13px; color: #9ca3af; }

  .form-label {
    font-size: 11px;
    font-weight: 700;
    color: #6d28d9;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: block;
    opacity: 0.75;
  }

  .star-row { display: flex; gap: 7px; margin-bottom: 7px; }

  .star-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid rgba(124,58,237,0.15);
    background: rgba(255,255,255,0.4);
    color: #d1d5db;
    font-size: 17px;
    cursor: pointer;
    transition: all 0.18s;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .star-btn.active {
    background: rgba(251,191,36,0.15);
    border-color: rgba(251,191,36,0.5);
    color: #f59e0b;
    box-shadow: 0 0 10px rgba(251,191,36,0.25);
  }

  .star-btn:hover { transform: scale(1.12); }

  .rating-label {
    font-size: 12.5px;
    color: #6d28d9;
    margin-bottom: 18px;
    display: block;
    font-weight: 500;
    opacity: 0.7;
  }

  .amr-textarea {
    width: 100%;
    background: rgba(255,255,255,0.45);
    border: 1px solid rgba(124,58,237,0.18);
    border-radius: 13px;
    padding: 13px 15px;
    color: #1e1b4b;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    resize: none;
    outline: none;
    margin-bottom: 18px;
    line-height: 1.65;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .amr-textarea::placeholder { color: #a78bfa; opacity: 0.6; }

  .amr-textarea:focus {
    border-color: rgba(124,58,237,0.45);
    background: rgba(255,255,255,0.65);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }

  .submit-btn {
    width: 100%;
    padding: 13px;
    border: none;
    border-radius: 13px;
    background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
    color: #fff;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.22s;
    letter-spacing: 0.3px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 18px rgba(124,58,237,0.3);
  }

  .submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #6d28d9, #1d4ed8);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .submit-btn:hover:not(:disabled)::before { opacity: 1; }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124,58,237,0.38);
  }

  .submit-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  .submit-btn span { position: relative; z-index: 1; }

  .alert {
    border-radius: 12px;
    padding: 11px 15px;
    font-size: 13px;
    margin-top: 13px;
    border: 1px solid;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .alert-danger {
    background: rgba(254,226,226,0.5);
    border-color: rgba(239,68,68,0.3);
    color: #b91c1c;
  }

  .alert-success {
    background: rgba(220,252,231,0.5);
    border-color: rgba(34,197,94,0.35);
    color: #15803d;
  }

  .empty-list {
    text-align: center;
    padding: 36px 20px;
    color: #9ca3af;
    font-size: 13px;
  }

  .loading-text {
    color: #9ca3af;
    font-size: 13px;
    padding: 20px 0;
    text-align: center;
  }
`;

const ratingLabels = {
  5: "Excellent",
  4: "Good",
  3: "Average",
  2: "Needs Improvement",
  1: "Poor",
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";



const pickValue = (obj, keys = [], fallback = "N/A") => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const getStatusClass = (status = "") => {
  const s = String(status).toLowerCase();
  if (s === "pending") return "status-pending";
  if (s === "approved") return "status-approved";
  if (s === "rejected") return "status-rejected";
  return "status-default";
};

export default function AdminManagerReview() {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [appraisalDetails, setAppraisalDetails] = useState(null);
  const [appraisalLoading, setAppraisalLoading] = useState(false);
  const [appraisalError, setAppraisalError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchManagers = async () => {
    try {
      setFetching(true);
      setError("");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/managers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load managers");
        setManagers([]);
        return;
      }

      setManagers(Array.isArray(data) ? data : []);
    } catch {
      setError("Server error while loading managers");
      setManagers([]);
    } finally {
      setFetching(false);
    }
  };

  const fetchAppraisalDetails = async (managerId) => {
    if (!managerId) {
      setAppraisalDetails(null);
      return;
    }

    try {
      setAppraisalLoading(true);
      setAppraisalError("");
      setAppraisalDetails(null);

      // Change this URL only if your backend route name is different
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reviews/manager-appraisal/${managerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setAppraisalDetails(null);
        setAppraisalError(data.message || "No appraisal details found");
        return;
      }

      const normalized = data?.appraisal || data?.data || data || null;
      setAppraisalDetails(normalized);
    } catch {
      setAppraisalDetails(null);
      setAppraisalError("Server error while loading appraisal details");
    } finally {
      setAppraisalLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const filteredManagers = useMemo(() => {
    const v = search.toLowerCase().trim();
    return managers.filter((m) =>
      [m.name, m.email, m.employee_id, m.dept, m.job_title].some((f) =>
        String(f || "").toLowerCase().includes(v)
      )
    );
  }, [managers, search]);

  const submitReview = async () => {
    if (!selectedManager) {
      setError("Please select a manager");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/admin-review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revieweeId: selectedManager.id,
          rating: Number(rating),
          comments: comments.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit review");
        return;
      }

      setMessage(data.message || "Review submitted successfully!");
      setComments("");
      setRating(5);
    } catch {
      setError("Server error while submitting review");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectManager = (manager) => {
    setSelectedManager(manager);
    setMessage("");
    setError("");
    fetchAppraisalDetails(manager.id);
  };

  return (
    <>
      <style>{styles}</style>

      <div className="amr-root">
        <div className="amr-header">
          <div className="amr-title">
            Manager <span>Reviews</span>
          </div>

          <button className="amr-refresh-btn" onClick={fetchManagers}>
            {fetching ? "↻ Refreshing…" : "↻ Refresh"}
          </button>
        </div>

        <div className="amr-grid">
          <div className="glass-card">
            <div className="glass-card-title">All Managers</div>

            <input
              className="amr-search"
              placeholder="Search by name, email, dept, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="manager-list">
              {fetching ? (
                <div className="loading-text">Loading managers…</div>
              ) : filteredManagers.length === 0 ? (
                <div className="empty-list">No managers found</div>
              ) : (
                filteredManagers.map((m) => (
                  <div
                    key={m.id}
                    className={`manager-card ${
                      String(selectedManager?.id) === String(m.id) ? "selected" : ""
                    }`}
                    onClick={() => handleSelectManager(m)}
                  >
                    <div className="manager-avatar">{getInitials(m.name)}</div>

                    <div className="manager-info">
                      <div className="manager-name">{m.name || "No Name"}</div>
                      <div className="manager-meta">
                        {m.employee_id || "N/A"} · {m.email || "N/A"}
                      </div>
                    </div>

                    <div className="manager-dept-badge">{m.dept || "N/A"}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card">
            <div className="glass-card-title">Submit Review</div>

            {selectedManager ? (
              <div className="selected-panel">
                <div className="selected-header">
                  <div className="selected-avatar">
                    {getInitials(selectedManager.name)}
                  </div>

                  <div>
                    <div className="selected-name">
                      {selectedManager.name || "No Name"}
                    </div>
                    <div className="selected-title-sub">
                      {selectedManager.job_title || "Manager"}
                    </div>
                  </div>
                </div>

                <div className="selected-stats">
                  <div className="stat-chip">
                    <div className="stat-label">Employee ID</div>
                    <div className="stat-value">
                      {selectedManager.employee_id || "N/A"}
                    </div>
                  </div>

                  <div className="stat-chip">
                    <div className="stat-label">Department</div>
                    <div className="stat-value">{selectedManager.dept || "N/A"}</div>
                  </div>

                  <div className="stat-chip" style={{ gridColumn: "1 / -1" }}>
                    <div className="stat-label">Email</div>
                    <div className="stat-value" style={{ fontSize: 11.5 }}>
                      {selectedManager.email || "N/A"}
                    </div>
                  </div>
                </div>

                

                <div className="appraisal-section">
                  <div className="activities-title">Appraisal Details</div>

                  {appraisalLoading ? (
                    <div className="appraisal-loading">
                      Loading appraisal details…
                    </div>
                  ) : appraisalDetails ? (
                    <>
                      <div className="appraisal-grid">
                        <div className="appraisal-card">
                          <div className="label">Review Period</div>
                          <div className="value">
                            {pickValue(appraisalDetails, [
                              "reviewPeriod",
                              "review_period",
                            ])}
                          </div>
                        </div>

                        <div className="appraisal-card">
                          <div className="label">Project Name</div>
                          <div className="value">
                            {pickValue(appraisalDetails, [
                              "projectName",
                              "project_name",
                            ])}
                          </div>
                        </div>

                        <div className="appraisal-card">
                          <div className="label">Self Rating</div>
                          <div className="value">
                            {pickValue(appraisalDetails, [
                              "rating",
                              "self_rating",
                              "selfRating",
                            ])}
                          </div>
                        </div>

                        <div className="appraisal-card">
                          <div className="label">Status</div>
                          <div className="value">
                            <span
                              className={`status-badge ${getStatusClass(
                                pickValue(appraisalDetails, ["status"], "pending")
                              )}`}
                            >
                              {pickValue(appraisalDetails, ["status"], "pending")}
                            </span>
                          </div>
                        </div>

                        <div className="appraisal-card">
                          <div className="label">Submitted At</div>
                          <div className="value">
                            {formatDate(
                              pickValue(appraisalDetails, [
                                "createdAt",
                                "created_at",
                                "submitted_at",
                              ], "")
                            )}
                          </div>
                        </div>

                        <div className="appraisal-card">
                          <div className="label">Updated At</div>
                          <div className="value">
                            {formatDate(
                              pickValue(appraisalDetails, [
                                "updatedAt",
                                "updated_at",
                              ], "")
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="appraisal-block">
                        <div className="appraisal-block-title">Task Title</div>
                        <div className="appraisal-block-text">
                          {pickValue(appraisalDetails, [
                            "taskTitle",
                            "task_title",
                          ])}
                        </div>
                      </div>

                      <div className="appraisal-block">
                        <div className="appraisal-block-title">
                          Task Description
                        </div>
                        <div className="appraisal-block-text">
                          {pickValue(appraisalDetails, [
                            "taskDescription",
                            "task_description",
                          ])}
                        </div>
                      </div>

                      <div className="appraisal-block">
                        <div className="appraisal-block-title">Achievements</div>
                        <div className="appraisal-block-text">
                          {pickValue(appraisalDetails, ["achievements"])}
                        </div>
                      </div>

                      <div className="appraisal-block">
                        <div className="appraisal-block-title">Challenges</div>
                        <div className="appraisal-block-text">
                          {pickValue(appraisalDetails, ["challenges"])}
                        </div>
                      </div>

                      <div className="appraisal-block">
                        <div className="appraisal-block-title">
                          Skills Improved
                        </div>
                        <div className="appraisal-block-text">
                          {pickValue(appraisalDetails, [
                            "skillsImproved",
                            "skills_improved",
                          ])}
                        </div>
                      </div>

                      <div className="appraisal-block">
                        <div className="appraisal-block-title">
                          Manager Support
                        </div>
                        <div className="appraisal-block-text">
                          {pickValue(appraisalDetails, [
                            "managerSupport",
                            "manager_support",
                          ])}
                        </div>
                      </div>

                      <div className="appraisal-block">
                        <div className="appraisal-block-title">Goals</div>
                        <div className="appraisal-block-text">
                          {pickValue(appraisalDetails, ["goals"])}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="appraisal-empty">
                      {appraisalError || "No appraisal submitted for this manager yet."}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-panel">
                <div className="empty-icon">👆</div>
                <div className="empty-text">
                  Select a manager from the list to begin review
                </div>
              </div>
            )}

            <label className="form-label">Rating</label>

            <div className="star-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`star-btn ${s <= rating ? "active" : ""}`}
                  onClick={() => setRating(s)}
                >
                  ★
                </button>
              ))}
            </div>

            <span className="rating-label">
              {rating} — {ratingLabels[rating]}
            </span>

            <label className="form-label">Comments</label>

            <textarea
              className="amr-textarea"
              rows={4}
              placeholder="Write your performance review here…"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />

            <button
              className="submit-btn"
              onClick={submitReview}
              disabled={loading || !selectedManager}
            >
              <span>{loading ? "Submitting…" : "Submit Review"}</span>
            </button>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
          </div>
        </div>
      </div>
    </>
  );
}