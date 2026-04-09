import React, { useEffect, useMemo, useState } from "react";

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .apr-root {
    min-height: 100vh;
    background: transparent;
    font-family: 'Sora', sans-serif;
    padding: 32px 24px;
    position: relative;
    overflow-x: hidden;
  }

  .apr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .apr-title-wrap { display: flex; flex-direction: column; gap: 6px; }
  .apr-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e1b4b;
    letter-spacing: -0.6px;
  }
  .apr-title span {
    background: linear-gradient(90deg, #7c3aed, #2563eb);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .apr-subtitle {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
  }

  .apr-refresh-btn {
    background: rgba(255,255,255,0.58);
    border: 1px solid rgba(124,58,237,0.22);
    color: #5b21b6;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.22s;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 4px 18px rgba(124,58,237,0.08);
  }
  .apr-refresh-btn:hover {
    background: rgba(124,58,237,0.08);
    border-color: rgba(124,58,237,0.4);
    color: #4c1d95;
    transform: translateY(-1px);
  }

  .apr-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  @media (max-width: 1100px) {
    .apr-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .apr-kpi-grid { grid-template-columns: 1fr; }
  }

  .kpi-card {
    background: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.72);
    border-radius: 22px;
    padding: 18px 18px 16px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow:
      0 6px 24px rgba(99,60,200,0.08),
      0 1px 0 rgba(255,255,255,0.8) inset;
    position: relative;
    overflow: hidden;
  }
  .kpi-card::before {
    content: "";
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #7c3aed, #2563eb, #06b6d4);
    opacity: 0.95;
  }
  .kpi-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 10px;
  }
  .kpi-value {
    font-size: 28px;
    font-weight: 700;
    color: #1e1b4b;
    line-height: 1;
    margin-bottom: 8px;
  }
  .kpi-sub {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }

  .apr-filters-shell {
    background: rgba(255,255,255,0.34);
    border: 1px solid rgba(255,255,255,0.72);
    border-radius: 24px;
    padding: 18px;
    margin-bottom: 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 6px 24px rgba(99,60,200,0.07);
  }

  .apr-filters-top {
    display: grid;
    grid-template-columns: 1.3fr repeat(4, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }
  @media (max-width: 1200px) {
    .apr-filters-top { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .apr-filters-top { grid-template-columns: 1fr; }
  }

  .apr-search, .apr-select {
    width: 100%;
    background: rgba(255,255,255,0.48);
    border: 1px solid rgba(124,58,237,0.18);
    border-radius: 14px;
    padding: 12px 16px;
    color: #1e1b4b;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    outline: none;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .apr-search::placeholder { color: #a78bfa; opacity: 0.72; }

  .apr-search:focus, .apr-select:focus {
    border-color: rgba(124,58,237,0.42);
    background: rgba(255,255,255,0.7);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }

  .apr-select {
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    padding-right: 40px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237c3aed' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .apr-filter-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .meta-chip {
    font-size: 11px;
    font-weight: 600;
    color: #4c1d95;
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.14);
    border-radius: 999px;
    padding: 7px 12px;
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .review-card {
    background: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow:
      0 8px 28px rgba(99,60,200,0.08),
      0 1px 0 rgba(255,255,255,0.78) inset;
    transition: all 0.22s ease;
  }

  .review-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 12px 34px rgba(99,60,200,0.13),
      0 1px 0 rgba(255,255,255,0.78) inset;
  }

  .review-card-strip {
    width: 100%;
    height: 4px;
  }
  .strip-admin { background: linear-gradient(90deg, #7c3aed, #2563eb); }
  .strip-manager { background: linear-gradient(90deg, #059669, #0891b2); }

  .review-card-body { padding: 22px; }

  .review-card-head {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: start;
    margin-bottom: 18px;
  }
  @media (max-width: 760px) {
    .review-card-head { grid-template-columns: 1fr; }
  }

  .head-left { display: flex; flex-direction: column; gap: 8px; }

  .type-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .review-type-badge,
  .status-badge,
  .team-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    border: 1px solid;
  }

  .badge-admin {
    background: rgba(124,58,237,0.12);
    border-color: rgba(124,58,237,0.24);
    color: #6d28d9;
  }

  .badge-manager {
    background: rgba(5,150,105,0.12);
    border-color: rgba(5,150,105,0.24);
    color: #065f46;
  }

  .status-pending {
    background: rgba(245,158,11,0.12);
    border-color: rgba(245,158,11,0.26);
    color: #b45309;
  }
  .status-approved {
    background: rgba(34,197,94,0.12);
    border-color: rgba(34,197,94,0.26);
    color: #15803d;
  }
  .status-rejected {
    background: rgba(239,68,68,0.12);
    border-color: rgba(239,68,68,0.26);
    color: #b91c1c;
  }
  .status-default {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.24);
    color: #4338ca;
  }

  .team-badge {
    background: rgba(14,165,233,0.1);
    border-color: rgba(14,165,233,0.22);
    color: #0369a1;
  }

  .review-main-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e1b4b;
    line-height: 1.4;
  }

  .review-subline {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
    color: #6b7280;
  }

  .mono {
    font-family: 'JetBrains Mono', monospace;
  }

  .rating-box {
    min-width: 150px;
    background: rgba(255,255,255,0.46);
    border: 1px solid rgba(255,255,255,0.76);
    border-radius: 18px;
    padding: 14px 16px;
    text-align: right;
  }

  .rating-label-top {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #9ca3af;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .rating-stars {
    display: flex;
    justify-content: flex-end;
    gap: 2px;
    margin-bottom: 6px;
  }

  .star-filled { color: #f59e0b; font-size: 16px; }
  .star-empty { color: #d1d5db; font-size: 16px; }

  .rating-number {
    font-size: 13px;
    font-weight: 700;
    color: #4c1d95;
  }

  .review-people {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: center;
    margin-bottom: 18px;
  }
  @media (max-width: 760px) {
    .review-people { grid-template-columns: 1fr; }
    .people-arrow { transform: rotate(90deg); }
  }

  .person-card {
    background: rgba(255,255,255,0.48);
    border: 1px solid rgba(255,255,255,0.76);
    border-radius: 18px;
    padding: 16px;
  }

  .person-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 10px;
  }

  .person-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .person-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .avatar-purple { background: linear-gradient(135deg, #7c3aed, #4f46e5); }
  .avatar-teal { background: linear-gradient(135deg, #059669, #0891b2); }
  .avatar-slate { background: linear-gradient(135deg, #64748b, #94a3b8); }

  .person-name {
    font-size: 14px;
    font-weight: 700;
    color: #1e1b4b;
    margin-bottom: 2px;
  }

  .person-small {
    font-size: 11.5px;
    color: #6b7280;
    line-height: 1.6;
  }

  .people-arrow {
    font-size: 18px;
    color: #c4b5fd;
    text-align: center;
    user-select: none;
  }

  .review-top-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }
  @media (max-width: 1100px) {
    .review-top-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 640px) {
    .review-top-grid { grid-template-columns: 1fr; }
  }

  .mini-card {
    background: rgba(255,255,255,0.46);
    border: 1px solid rgba(255,255,255,0.76);
    border-radius: 16px;
    padding: 14px;
  }

  .mini-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 6px;
  }

  .mini-value {
    font-size: 13px;
    font-weight: 600;
    color: #1e1b4b;
    line-height: 1.55;
    word-break: break-word;
  }

  .summary-panel {
    background: rgba(255,255,255,0.42);
    border: 1px solid rgba(255,255,255,0.76);
    border-radius: 18px;
    padding: 16px;
    margin-bottom: 14px;
  }

  .summary-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #6d28d9;
    margin-bottom: 10px;
  }

  .summary-text {
    font-size: 13px;
    color: #374151;
    line-height: 1.75;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .summary-empty {
    color: #9ca3af;
    font-style: italic;
  }

  .expand-btn {
    width: 100%;
    border: 1px solid rgba(124,58,237,0.16);
    background: rgba(255,255,255,0.44);
    color: #5b21b6;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 600;
    border-radius: 14px;
    padding: 12px 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .expand-btn:hover {
    background: rgba(124,58,237,0.08);
    border-color: rgba(124,58,237,0.28);
  }

  .expanded-section {
    margin-top: 14px;
    border-top: 1px solid rgba(124,58,237,0.1);
    padding-top: 14px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }
  @media (max-width: 760px) {
    .detail-grid { grid-template-columns: 1fr; }
  }

  .detail-block {
    background: rgba(255,255,255,0.42);
    border: 1px solid rgba(255,255,255,0.76);
    border-radius: 16px;
    padding: 14px;
  }

  .detail-block-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #6d28d9;
    margin-bottom: 8px;
  }

  .detail-block-text {
    font-size: 13px;
    color: #374151;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .alert {
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 13px;
    margin-bottom: 18px;
    border: 1px solid rgba(239,68,68,0.25);
    background: rgba(254,226,226,0.5);
    color: #b91c1c;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .state-card {
    background: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 22px;
    padding: 54px 24px;
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .state-icon {
    font-size: 36px;
    margin-bottom: 10px;
    opacity: 0.35;
  }
`;

const getInitials = (name = "") =>
  String(name)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "No date";

const StarRow = ({ rating }) => (
  <div className="rating-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? "star-filled" : "star-empty"}>
        ★
      </span>
    ))}
  </div>
);

const safe = (value, fallback = "Not available") => {
  if (value === undefined || value === null) return fallback;
  const v = String(value).trim();
  return v ? v : fallback;
};

const getStatusClass = (status = "") => {
  const s = String(status).toLowerCase();
  if (s === "pending") return "status-pending";
  if (s === "approved") return "status-approved";
  if (s === "rejected") return "status-rejected";
  return "status-default";
};

const normalizeReview = (r) => {
  const type = r.review_type || "manager_review";

  return {
    id: r.id,
    type,
    createdAt: r.created_at || r.createdAt,
    rating: Number(r.rating || 0),
    comments: r.comments || "",
    reviewerName: r.reviewer_name || r.reviewerName || "N/A",
    reviewerEmployeeId: r.reviewer_employee_id || r.reviewerEmployeeId || "N/A",
    reviewerRole: r.reviewer_role || r.reviewerRole || "N/A",
    revieweeName: r.reviewee_name || r.revieweeName || "N/A",
    revieweeEmployeeId: r.reviewee_employee_id || r.revieweeEmployeeId || "N/A",
    revieweeRole: r.reviewee_role || r.revieweeRole || "N/A",

    teamName:
      r.team_name ||
      r.reviewee_team_name ||
      r.reviewer_team_name ||
      r.team ||
      r.dept ||
      r.reviewee_dept ||
      "Unassigned Team",

    department:
      r.department ||
      r.dept ||
      r.reviewee_dept ||
      r.reviewee_department ||
      "Not available",

    designation:
      r.designation ||
      r.job_title ||
      r.reviewee_designation ||
      r.reviewee_job_title ||
      "Not available",

    reviewPeriod:
      r.review_period || r.reviewPeriod || "Current Cycle",

    projectName:
      r.project_name || r.projectName || "Not available",

    appraisalStatus:
      r.appraisal_status || r.status || "Pending",

    appraisalSummary:
      r.appraisal_summary ||
      r.summary ||
      r.comments ||
      "",

    achievements:
      r.achievements || "",

    challenges:
      r.challenges || "",

    goals:
      r.goals || "",

    skillsImproved:
      r.skills_improved || r.skillsImproved || "",

    managerSupport:
      r.manager_support || r.managerSupport || "",

    taskTitle:
      r.task_title || r.taskTitle || "",

    taskDescription:
      r.task_description || r.taskDescription || "",

    updatedAt: r.updated_at || r.updatedAt || null,
  };
};

export default function AdminPerformanceReviews() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch reviews");
        setReviews([]);
        return;
      }

      const normalized = Array.isArray(data)
        ? data.map(normalizeReview)
        : [];

      setReviews(normalized);
    } catch {
      setError("Server error while fetching reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const teamOptions = useMemo(() => {
    return [...new Set(reviews.map((r) => safe(r.teamName)).filter(Boolean))].sort();
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const v = search.toLowerCase().trim();

    return reviews.filter((r) => {
      const matchSearch = [
        r.reviewerName,
        r.revieweeName,
        r.reviewerEmployeeId,
        r.revieweeEmployeeId,
        r.teamName,
        r.department,
        r.designation,
        r.projectName,
        r.reviewPeriod,
        r.comments,
        r.achievements,
        r.goals,
      ]
        .some((f) => String(f || "").toLowerCase().includes(v));

      const matchType = typeFilter === "all" || r.type === typeFilter;
      const matchTeam = teamFilter === "all" || r.teamName === teamFilter;
      const matchStatus =
        statusFilter === "all" ||
        String(r.appraisalStatus).toLowerCase() === statusFilter.toLowerCase();
      const matchRating =
        ratingFilter === "all" || Number(r.rating) >= Number(ratingFilter);

      return matchSearch && matchType && matchTeam && matchStatus && matchRating;
    });
  }, [reviews, search, typeFilter, teamFilter, statusFilter, ratingFilter]);

  const totalCount = filteredReviews.length;
  const avgRating = totalCount
    ? (
        filteredReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalCount
      ).toFixed(1)
    : "—";

  const teamsCovered = [...new Set(filteredReviews.map((r) => r.teamName))].length;

  const pendingCount = filteredReviews.filter(
    (r) => String(r.appraisalStatus).toLowerCase() === "pending"
  ).length;

  const reviewTypeCount = {
    admin: filteredReviews.filter((r) => r.type === "admin_review").length,
    manager: filteredReviews.filter((r) => r.type === "manager_review").length,
  };

  return (
    <>
      <style>{styles}</style>

      <div className="apr-root">
        <div className="apr-header">
          <div className="apr-title-wrap">
            <div className="apr-title">
              Team Performance <span>Review Center</span>
            </div>
            <div className="apr-subtitle">
              Enterprise-style appraisal intelligence dashboard for teams, reviewers, reviewees, and detailed performance signals.
            </div>
          </div>

          <button className="apr-refresh-btn" onClick={fetchReviews}>
            {loading ? "↻ Refreshing…" : "↻ Refresh Dashboard"}
          </button>
        </div>

        <div className="apr-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Reviews</div>
            <div className="kpi-value">{totalCount}</div>
            <div className="kpi-sub">All reviews matching your current filters.</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Average Rating</div>
            <div className="kpi-value">{avgRating}</div>
            <div className="kpi-sub">Weighted across team and leadership review records.</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Teams Covered</div>
            <div className="kpi-value">{teamsCovered}</div>
            <div className="kpi-sub">Distinct teams represented in the current view.</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Pending Appraisals</div>
            <div className="kpi-value">{pendingCount}</div>
            <div className="kpi-sub">Records still waiting for final closure or decision.</div>
          </div>
        </div>

        <div className="apr-filters-shell">
          <div className="apr-filters-top">
            <input
              className="apr-search"
              placeholder="Search by team, reviewer, reviewee, project, department, comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="apr-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Review Types</option>
              <option value="manager_review">Manager → Employee</option>
              <option value="admin_review">Admin → Manager</option>
            </select>

            <select
              className="apr-select"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option value="all">All Teams</option>
              {teamOptions.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>

            <select
              className="apr-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              className="apr-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 & up</option>
              <option value="4">4 & up</option>
              <option value="3">3 & up</option>
              <option value="2">2 & up</option>
              <option value="1">1 & up</option>
            </select>
          </div>

          <div className="apr-filter-meta">
            <div className="meta-chip">{reviewTypeCount.admin} Admin Reviews</div>
            <div className="meta-chip">{reviewTypeCount.manager} Manager Reviews</div>
            <div className="meta-chip">{teamsCovered} Teams Visible</div>
            <div className="meta-chip">{pendingCount} Pending Status</div>
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        {loading ? (
          <div className="state-card">
            <div className="state-icon">⏳</div>
            Loading enterprise review dashboard...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="state-card">
            <div className="state-icon">🔍</div>
            No team reviews found for the selected filters.
          </div>
        ) : (
          <div className="reviews-list">
            {filteredReviews.map((review) => {
              const isAdmin = review.type === "admin_review";
              const isExpanded = expandedId === review.id;

              return (
                <div className="review-card" key={review.id}>
                  <div
                    className={`review-card-strip ${
                      isAdmin ? "strip-admin" : "strip-manager"
                    }`}
                  />

                  <div className="review-card-body">
                    <div className="review-card-head">
                      <div className="head-left">
                        <div className="type-row">
                          <div
                            className={`review-type-badge ${
                              isAdmin ? "badge-admin" : "badge-manager"
                            }`}
                          >
                            {isAdmin ? "🛡 Admin → Manager" : "👤 Manager → Employee"}
                          </div>

                          <div className={`status-badge ${getStatusClass(review.appraisalStatus)}`}>
                            {safe(review.appraisalStatus)}
                          </div>

                          <div className="team-badge">🏢 {safe(review.teamName)}</div>
                        </div>

                        <div className="review-main-title">
                          {safe(review.revieweeName)} Performance Review Snapshot
                        </div>

                        <div className="review-subline">
                          <span className="mono">{formatDate(review.createdAt)}</span>
                          <span>Period: {safe(review.reviewPeriod)}</span>
                          <span>Project: {safe(review.projectName)}</span>
                        </div>
                      </div>

                      <div className="rating-box">
                        <div className="rating-label-top">Review Rating</div>
                        <StarRow rating={review.rating} />
                        <div className="rating-number">{review.rating || 0} / 5</div>
                      </div>
                    </div>

                    <div className="review-people">
                      <div className="person-card">
                        <div className="person-tag">Reviewer</div>
                        <div className="person-row">
                          <div className={`person-avatar ${isAdmin ? "avatar-purple" : "avatar-teal"}`}>
                            {getInitials(review.reviewerName)}
                          </div>
                          <div>
                            <div className="person-name">{safe(review.reviewerName)}</div>
                            <div className="person-small mono">{safe(review.reviewerEmployeeId)}</div>
                            <div className="person-small">{safe(review.reviewerRole)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="people-arrow">→</div>

                      <div className="person-card">
                        <div className="person-tag">Reviewee</div>
                        <div className="person-row">
                          <div className="person-avatar avatar-slate">
                            {getInitials(review.revieweeName)}
                          </div>
                          <div>
                            <div className="person-name">{safe(review.revieweeName)}</div>
                            <div className="person-small mono">{safe(review.revieweeEmployeeId)}</div>
                            <div className="person-small">{safe(review.revieweeRole)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="review-top-grid">
                      <div className="mini-card">
                        <div className="mini-label">Department</div>
                        <div className="mini-value">{safe(review.department)}</div>
                      </div>

                      <div className="mini-card">
                        <div className="mini-label">Designation</div>
                        <div className="mini-value">{safe(review.designation)}</div>
                      </div>

                      <div className="mini-card">
                        <div className="mini-label">Review Period</div>
                        <div className="mini-value">{safe(review.reviewPeriod)}</div>
                      </div>

                      <div className="mini-card">
                        <div className="mini-label">Appraisal Status</div>
                        <div className="mini-value">{safe(review.appraisalStatus)}</div>
                      </div>
                    </div>

                    <div className="summary-panel">
                      <div className="summary-title">Review Comments / Appraisal Summary</div>
                      <div className={`summary-text ${!(review.comments || review.appraisalSummary) ? "summary-empty" : ""}`}>
                        {review.comments || review.appraisalSummary || "No comments or summary available."}
                      </div>
                    </div>

                    <button
                      className="expand-btn"
                      onClick={() => setExpandedId(isExpanded ? null : review.id)}
                    >
                      {isExpanded ? "Hide Detailed Review Intelligence" : "View Detailed Review Intelligence"}
                    </button>

                    {isExpanded && (
                      <div className="expanded-section">
                        <div className="detail-grid">
                          <div className="detail-block">
                            <div className="detail-block-title">Task Title</div>
                            <div className="detail-block-text">
                              {safe(review.taskTitle)}
                            </div>
                          </div>

                          <div className="detail-block">
                            <div className="detail-block-title">Task Description</div>
                            <div className="detail-block-text">
                              {safe(review.taskDescription)}
                            </div>
                          </div>

                          <div className="detail-block">
                            <div className="detail-block-title">Achievements</div>
                            <div className="detail-block-text">
                              {safe(review.achievements)}
                            </div>
                          </div>

                          <div className="detail-block">
                            <div className="detail-block-title">Challenges</div>
                            <div className="detail-block-text">
                              {safe(review.challenges)}
                            </div>
                          </div>

                          <div className="detail-block">
                            <div className="detail-block-title">Skills Improved</div>
                            <div className="detail-block-text">
                              {safe(review.skillsImproved)}
                            </div>
                          </div>

                          <div className="detail-block">
                            <div className="detail-block-title">Manager Support</div>
                            <div className="detail-block-text">
                              {safe(review.managerSupport)}
                            </div>
                          </div>

                          <div className="detail-block">
                            <div className="detail-block-title">Goals / Next Cycle Objectives</div>
                            <div className="detail-block-text">
                              {safe(review.goals)}
                            </div>
                          </div>

                          <div className="detail-block">
                            <div className="detail-block-title">Last Updated</div>
                            <div className="detail-block-text">
                              {review.updatedAt ? formatDate(review.updatedAt) : "Not available"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}