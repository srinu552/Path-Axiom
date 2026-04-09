import React, { useEffect, useMemo, useState } from "react";
import Header from "../SmallComponents/Header";

const css = `

  .eap-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 35%, #e0f2fe 65%, #f0f9ff 100%);
    position: relative;
    overflow-x: hidden;
    padding-bottom: 48px;
  }

  .eap-blob { position:fixed;border-radius:50%;pointer-events:none;animation:eapFloat 10s ease-in-out infinite; }
  .eap-b1 { width:520px;height:520px;background:radial-gradient(circle,#93c5fd55,#3b82f645);filter:blur(90px);top:-160px;left:-130px;animation-delay:0s; }
  .eap-b2 { width:400px;height:400px;background:radial-gradient(circle,#bfdbfe50,#60a5fa40);filter:blur(80px);bottom:-100px;right:-80px;animation-delay:4s; }
  @keyframes eapFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }

  .eap-inner { max-width: 1000px; margin: 0 auto; padding: 32px 16px 0; }

  /* card */
  .eap-card {
    background: rgba(255,255,255,0.58);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.8);
    border-radius: 22px;
    box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 2px 0 rgba(255,255,255,0.9) inset;
    animation: eapIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
    margin-bottom: 22px;
  }
  @keyframes eapIn { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:none} }
  .eap-card-body { padding: 28px 32px; }
  @media (max-width: 600px) { .eap-card-body { padding: 20px 18px; } }

  /* page header */
  .eap-page-header {
    display: flex; align-items: center; gap: 18px;
    padding: 26px 32px;
    border-bottom: 1.5px solid rgba(226,232,240,0.6);
  }
  .eap-ph-avatar {
    width:58px;height:58px;border-radius:18px;flex-shrink:0;
    background:linear-gradient(140deg,#1e3a8a,#2563eb 60%,#38bdf8);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 6px 18px rgba(37,99,235,0.32);
  }
  .eap-ph-title { font-size:22px;font-weight:800;color:#1e3a8a;letter-spacing:-0.5px;margin:0 0 3px; }
  .eap-ph-sub   { font-size:13px;color:#64748b;margin:0; }

  /* section label */
  .eap-sec { font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#94a3b8;margin-bottom:16px; }

  /* form grid */
  .eap-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
  .eap-grid-1 { grid-column: 1 / -1; }
  @media (max-width: 640px) { .eap-grid-2 { grid-template-columns: 1fr; } .eap-grid-1 { grid-column: auto; } }

  .eap-divider { height:1.5px;background:rgba(226,232,240,0.65);margin:24px 0; }

  /* labels + inputs */
  .eap-label { display:block;font-size:12.5px;font-weight:600;color:#334155;margin-bottom:6px;letter-spacing:0.1px; }

  .eap-input, .eap-select, .eap-textarea {
    width:100%; font-family:'Outfit',sans-serif; font-size:14px; color:#0f172a;
    background:rgba(255,255,255,0.72); border:1.5px solid rgba(203,213,225,0.65);
    border-radius:12px; padding:11px 14px; outline:none;
    transition:border-color 0.2s,box-shadow 0.2s,background 0.2s; resize:vertical;
  }
  .eap-input::placeholder, .eap-select::placeholder, .eap-textarea::placeholder { color:#94a3b8; }
  .eap-input:focus, .eap-select:focus, .eap-textarea:focus {
    border-color:#3b82f6; background:rgba(255,255,255,0.92);
    box-shadow:0 0 0 3.5px rgba(59,130,246,0.14);
  }
  .eap-input-readonly { background:rgba(248,250,252,0.85); color:#64748b; cursor:default; }

  /* form buttons */
  .eap-form-actions { display:flex;gap:12px;flex-wrap:wrap;margin-top:4px; }
  .eap-btn {
    padding:12px 22px; font-family:'Outfit',sans-serif; font-size:14px; font-weight:600;
    border:none; border-radius:12px; cursor:pointer;
    display:flex;align-items:center;gap:8px;
    transition:transform 0.14s,box-shadow 0.2s;
  }
  .eap-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .eap-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .eap-btn-primary { background:linear-gradient(135deg,#1e3a8a,#2563eb); color:#fff; box-shadow:0 4px 16px rgba(37,99,235,0.28); }
  .eap-btn-primary:hover:not(:disabled) { box-shadow:0 8px 22px rgba(37,99,235,0.36); }
  .eap-btn-secondary { background:rgba(15,23,42,0.07); color:#334155; border:1.5px solid rgba(203,213,225,0.8); }
  .eap-btn-secondary:hover:not(:disabled) { background:rgba(15,23,42,0.11); }
  .eap-btn-warn   { background:linear-gradient(135deg,#d97706,#f59e0b); color:#fff; box-shadow:0 3px 10px rgba(217,119,6,0.25); font-size:13px; padding:8px 16px; }
  .eap-btn-danger { background:linear-gradient(135deg,#dc2626,#ef4444); color:#fff; box-shadow:0 3px 10px rgba(220,38,38,0.25); font-size:13px; padding:8px 16px; }
  .eap-btn-sm { padding:8px 16px; font-size:13px; }

  /* search */
  .eap-search-row { display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:20px; }
  .eap-search-title { font-size:17px;font-weight:700;color:#0f172a; }

  /* record card */
  .eap-rec {
    border:1.5px solid rgba(226,232,240,0.7);
    border-radius:18px; padding:20px 24px; margin-bottom:14px;
    background:rgba(255,255,255,0.65);
    transition:box-shadow 0.2s;
  }
  .eap-rec:hover { box-shadow:0 6px 20px rgba(59,130,246,0.10); }
  .eap-rec-header { display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:16px; }
  .eap-rec-title  { font-size:16px;font-weight:700;color:#0f172a;margin:0 0 4px; }
  .eap-rec-meta   { font-size:12.5px;color:#64748b;margin:0 0 8px; }
  .eap-rec-actions { display:flex;gap:8px;flex-shrink:0; }

  .eap-badge {
    display:inline-block;padding:4px 12px;border-radius:999px;font-size:11.5px;font-weight:700;
    background:rgba(219,234,254,0.8);color:#1d4ed8;
  }
  .eap-badge-reviewed { background:rgba(220,252,231,0.8);color:#15803d; }

  .eap-rec-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px 20px; }
  @media (max-width:600px) { .eap-rec-grid { grid-template-columns:1fr; } }

  .eap-rec-row { font-size:13px;color:#334155;padding:4px 0;border-bottom:1px solid rgba(226,232,240,0.4); }
  .eap-rec-row:last-child { border-bottom:none; }
  .eap-rec-key { font-weight:700;color:#0f172a; }
  .eap-rec-full { grid-column:1/-1; }
  .eap-rec-muted { font-size:12px;color:#94a3b8;margin-top:2px; }

  /* alerts */
  .eap-alert { padding:12px 16px;border-radius:12px;font-size:13.5px;font-weight:500;margin-bottom:16px;text-align:center; }
  .eap-alert-muted { color:#94a3b8; padding:32px;text-align:center; }

  /* rating stars preview */
  .eap-stars { display:inline-flex;gap:2px; }
  .eap-star  { font-size:13px; }
`;

// ─── Extracted outside the main component to prevent remount on every render ───

const StarRating = ({ n }) => (
  <span className="eap-stars">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className="eap-star" style={{ color: s <= n ? "#f59e0b" : "#d1d5db" }}>
        ★
      </span>
    ))}
  </span>
);

const Field = ({ label, name, value, readOnly, placeholder, onChange }) => (
  <div>
    <label className="eap-label">{label}</label>
    <input
      type="text"
      className={`eap-input${readOnly ? " eap-input-readonly" : ""}`}
      name={name}
      value={value}
      readOnly={readOnly}
      placeholder={placeholder}
      onChange={onChange}
    />
  </div>
);

const TextArea = ({ label, name, value, placeholder, rows = 3, onChange }) => (
  <div>
    <label className="eap-label">{label}</label>
    <textarea
      className="eap-textarea"
      rows={rows}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  </div>
);

// ────────────────────────────────────────────────────────────────────────────────

export default function EmployeeAppraisal() {
  const BLANK = {
    employeeName: "",
    employeeId: "",
    department: "",
    designation: "",
    reviewPeriod: "",
    projectName: "",
    taskTitle: "",
    taskDescription: "",
    achievements: "",
    challenges: "",
    skillsImproved: "",
    managerSupport: "",
    rating: "",
    goals: "",
    status: "Submitted",
  };

  const [formData, setFormData] = useState(BLANK);
  const [appraisals, setAppraisals] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const token =
    localStorage.getItem("employeeToken") || localStorage.getItem("managerToken");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setFormData((p) => ({
      ...p,
      reviewPeriod: "",
      projectName: "",
      taskTitle: "",
      taskDescription: "",
      achievements: "",
      challenges: "",
      skillsImproved: "",
      managerSupport: "",
      rating: "",
      goals: "",
      status: "Submitted",
    }));
    setEditId(null);
  };

  const fetchLoggedUserDetails = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appraisals/my-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load employee details");
        return;
      }
      setFormData((p) => ({
        ...p,
        employeeName: data.name || "",
        employeeId: data.employee_id || "",
        department: data.department || "",
        designation: data.designation || "",
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyAppraisals = async () => {
    try {
      setPageLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appraisals/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load appraisals");
        setAppraisals([]);
        return;
      }
      setAppraisals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAppraisals([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchLoggedUserDetails();
    fetchMyAppraisals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const req = [
      "employeeName",
      "employeeId",
      "department",
      "designation",
      "reviewPeriod",
      "projectName",
      "taskTitle",
      "taskDescription",
      "achievements",
      "rating",
      "goals",
    ];
    if (req.some((k) => !formData[k])) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      setLoading(true);
      const url = editId
        ? `${import.meta.env.VITE_API_URL}/api/appraisals/${editId}`
        : `${import.meta.env.VITE_API_URL}/api/appraisals`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to save appraisal");
        return;
      }
      alert(data.message || (editId ? "Appraisal updated." : "Appraisal submitted."));
      resetForm();
      fetchMyAppraisals();
    } catch (e) {
      console.error(e);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      employeeName: item.employeeName || "",
      employeeId: item.employeeId || "",
      department: item.department || "",
      designation: item.designation || "",
      reviewPeriod: item.reviewPeriod || "",
      projectName: item.projectName || "",
      taskTitle: item.taskTitle || "",
      taskDescription: item.taskDescription || "",
      achievements: item.achievements || "",
      challenges: item.challenges || "",
      skillsImproved: item.skillsImproved || "",
      managerSupport: item.managerSupport || "",
      rating: String(item.rating || ""),
      goals: item.goals || "",
      status: item.status || "Submitted",
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appraisal?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appraisals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete");
        return;
      }
      alert(data.message || "Deleted.");
      if (editId === id) resetForm();
      fetchMyAppraisals();
    } catch (e) {
      console.error(e);
      alert("Server error");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return appraisals.filter((i) =>
      [i.employeeName, i.employeeId, i.department, i.projectName, i.taskTitle, i.reviewPeriod].some(
        (v) => String(v || "").toLowerCase().includes(q)
      )
    );
  }, [appraisals, search]);

  return (
    <>
      <style>{css}</style>
      <Header />
      <div className="eap-root">
        <div className="eap-blob eap-b1" />
        <div className="eap-blob eap-b2" />
        <div className="eap-inner">

          {/* ── Form card ── */}
          <div className="eap-card" style={{ animationDelay: "0s" }}>
            {/* header */}
            <div className="eap-page-header">
              <div className="eap-ph-avatar">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <p className="eap-ph-title">
                  {editId ? "Edit Appraisal" : "Employee Appraisal Form"}
                </p>
                <p className="eap-ph-sub">
                  Submit your work summary, achievements, challenges &amp; goals
                </p>
              </div>
            </div>

            <div className="eap-card-body">
              <form onSubmit={handleSubmit}>

                {/* Employee details */}
                <p className="eap-sec">Employee Details</p>
                <div className="eap-grid-2">
                  <Field label="Employee Name" name="employeeName" value={formData.employeeName} readOnly />
                  <Field label="Employee ID"   name="employeeId"   value={formData.employeeId}   readOnly />
                  <Field label="Department"    name="department"   value={formData.department}    readOnly />
                  <Field label="Designation"   name="designation"  value={formData.designation}   readOnly />
                  <Field
                    label="Review Period"
                    name="reviewPeriod"
                    value={formData.reviewPeriod}
                    placeholder="e.g. Jan 2026 – Mar 2026"
                    onChange={handleChange}
                  />
                  <Field
                    label="Project Name"
                    name="projectName"
                    value={formData.projectName}
                    placeholder="Enter project name"
                    onChange={handleChange}
                  />
                </div>

                <div className="eap-divider" />

                {/* Performance details */}
                <p className="eap-sec">Performance Details</p>
                <div className="eap-grid-2">
                  <Field
                    label="Task Title"
                    name="taskTitle"
                    value={formData.taskTitle}
                    placeholder="Enter task title"
                    onChange={handleChange}
                  />

                  <div>
                    <label className="eap-label">Self Rating</label>
                    <select
                      className="eap-select"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                    >
                      <option value="">Select Rating</option>
                      <option value="1">1 — Poor</option>
                      <option value="2">2 — Average</option>
                      <option value="3">3 — Good</option>
                      <option value="4">4 — Very Good</option>
                      <option value="5">5 — Excellent</option>
                    </select>
                  </div>

                  <div className="eap-grid-1">
                    <TextArea
                      label="Task Description"
                      name="taskDescription"
                      value={formData.taskDescription}
                      placeholder="Describe the work completed"
                      onChange={handleChange}
                    />
                  </div>
                  <TextArea
                    label="Achievements"
                    name="achievements"
                    value={formData.achievements}
                    placeholder="Mention achievements"
                    onChange={handleChange}
                  />
                  <TextArea
                    label="Challenges Faced"
                    name="challenges"
                    value={formData.challenges}
                    placeholder="Mention challenges"
                    onChange={handleChange}
                  />
                  <TextArea
                    label="Skills Improved"
                    name="skillsImproved"
                    value={formData.skillsImproved}
                    placeholder="Mention improved skills"
                    onChange={handleChange}
                  />
                  <TextArea
                    label="Manager / Company Support Needed"
                    name="managerSupport"
                    value={formData.managerSupport}
                    placeholder="Mention support needed"
                    onChange={handleChange}
                  />
                  <div className="eap-grid-1">
                    <TextArea
                      label="Future Goals"
                      name="goals"
                      value={formData.goals}
                      placeholder="Mention future goals"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="eap-divider" />

                <div className="eap-form-actions">
                  <button
                    type="submit"
                    className="eap-btn eap-btn-primary"
                    disabled={loading}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {loading ? "Saving…" : editId ? "Update Appraisal" : "Submit Appraisal"}
                  </button>
                  <button
                    type="button"
                    className="eap-btn eap-btn-secondary"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Records card ── */}
          <div className="eap-card" style={{ animationDelay: "0.1s" }}>
            <div className="eap-card-body">
              <div className="eap-search-row">
                <p className="eap-search-title">Submitted Appraisals</p>
                <input
                  type="text"
                  className="eap-input"
                  style={{ maxWidth: "300px" }}
                  placeholder="Search by name, ID, project…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {pageLoading ? (
                <p className="eap-alert-muted">Loading appraisals…</p>
              ) : filtered.length === 0 ? (
                <p className="eap-alert-muted">No appraisal records found.</p>
              ) : (
                filtered.map((item) => {
                  const isReviewed = item.status === "Reviewed by Manager";
                  return (
                    <div className="eap-rec" key={item.id}>
                      <div className="eap-rec-header">
                        <div>
                          <p className="eap-rec-title">{item.taskTitle}</p>
                          <p className="eap-rec-meta">
                            {item.employeeName} &nbsp;·&nbsp; {item.employeeId} &nbsp;·&nbsp;{" "}
                            {item.department}
                          </p>
                          <span
                            className={`eap-badge${isReviewed ? " eap-badge-reviewed" : ""}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="eap-rec-actions">
                          <button
                            className="eap-btn eap-btn-warn eap-btn-sm"
                            onClick={() => handleEdit(item)}
                            disabled={isReviewed}
                          >
                            Edit
                          </button>
                          <button
                            className="eap-btn eap-btn-danger eap-btn-sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={isReviewed}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="eap-rec-grid">
                        {[
                          ["Review Period", item.reviewPeriod],
                          ["Project", item.projectName],
                          ["Designation", item.designation],
                        ].map(([k, v]) => (
                          <div className="eap-rec-row" key={k}>
                            <span className="eap-rec-key">{k}:</span> {v}
                          </div>
                        ))}
                        <div className="eap-rec-row">
                          <span className="eap-rec-key">Self Rating:</span>{" "}
                          <StarRating n={Number(item.rating)} /> &nbsp;{item.rating}/5
                        </div>
                        <div className="eap-rec-row eap-rec-full">
                          <span className="eap-rec-key">Task Description:</span>{" "}
                          {item.taskDescription}
                        </div>
                        <div className="eap-rec-row">
                          <span className="eap-rec-key">Achievements:</span> {item.achievements}
                        </div>
                        <div className="eap-rec-row">
                          <span className="eap-rec-key">Challenges:</span>{" "}
                          {item.challenges || "N/A"}
                        </div>
                        <div className="eap-rec-row">
                          <span className="eap-rec-key">Skills Improved:</span>{" "}
                          {item.skillsImproved || "N/A"}
                        </div>
                        <div className="eap-rec-row">
                          <span className="eap-rec-key">Support Needed:</span>{" "}
                          {item.managerSupport || "N/A"}
                        </div>
                        <div className="eap-rec-row eap-rec-full">
                          <span className="eap-rec-key">Goals:</span> {item.goals}
                        </div>
                        <div className="eap-rec-row eap-rec-muted">
                          Created:{" "}
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
                        </div>
                        <div className="eap-rec-row eap-rec-muted">
                          Updated:{" "}
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
