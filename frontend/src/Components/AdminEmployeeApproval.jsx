import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminEmployeeApproval() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/pending-employees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payload = res.data;
      const employeeList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
        ? payload.data
        : [];
      setEmployees(employeeList);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/approve-employee/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Employee approved successfully");
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, approval_status: "approved" } : emp
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionId(id);
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/reject-employee/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Employee rejected successfully");
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, approval_status: "rejected" } : emp
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    } finally {
      setActionId(null);
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const pendingCount = employees.filter(
    (e) => !e.approval_status || e.approval_status === "pending"
  ).length;
  const approvedCount = employees.filter(
    (e) => e.approval_status === "approved"
  ).length;
  const rejectedCount = employees.filter(
    (e) => e.approval_status === "rejected"
  ).length;

  return (
    <>
      <style>{`
        

        .apr-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: transparent;
        }

        .apr-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.55;
        }

        .apr-wrapper {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
        }

        .apr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 24px;
        }

        .apr-title {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: clamp(1.3rem, 2vw, 1.75rem);
          background: linear-gradient(135deg, #1e3a8a 0%, #4f46e5 50%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .apr-subtitle {
          color: #64748b;
          font-size: 13.5px;
          margin: 4px 0 0;
        }

        .btn-refresh {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 12px;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.5);
          color: #4f46e5;
          box-shadow: 0 4px 16px rgba(79,70,229,0.12), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.22s ease;
          white-space: nowrap;
        }

        .btn-refresh:hover {
          background: rgba(255,255,255,0.78);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(79,70,229,0.2), inset 0 1px 0 rgba(255,255,255,0.95);
          color: #3730a3;
        }

        .apr-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .apr-stat {
          flex: 1;
          min-width: 130px;
          background: rgba(255,255,255,0.52);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.42);
          border-radius: 18px;
          padding: 18px 20px;
          box-shadow: 0 8px 28px rgba(15,23,80,0.07), inset 0 1px 0 rgba(255,255,255,0.88);
          position: relative;
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .apr-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(15,23,80,0.12), inset 0 1px 0 rgba(255,255,255,0.95);
        }

        .apr-stat::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 80px; height: 80px;
          border-radius: 50%;
          opacity: 0.15;
        }

        .apr-stat.total::before  { background: transparent; }
        .apr-stat.pending::before { background: transparent; }
        .apr-stat.approved::before { background: transparent; }
        .apr-stat.rejected::before { background: transparent; }

        .apr-stat-label {
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
          margin-bottom: 8px;
        }

        .apr-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 1.9rem;
          font-weight: 700;
          line-height: 1;
        }

        .apr-stat.total .apr-stat-value {
          background: linear-gradient(135deg,#4f46e5,#818cf8);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }

        .apr-stat.pending .apr-stat-value {
          background: linear-gradient(135deg,#d97706,#fbbf24);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }

        .apr-stat.approved.apr-stat .apr-stat-value {
          background: linear-gradient(135deg,#059669,#34d399);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }

        .apr-stat.rejected .apr-stat-value {
          background: linear-gradient(135deg,#dc2626,#f87171);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }

        .apr-card {
          background: rgba(255,255,255,0.50);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.42);
          box-shadow:
            0 16px 48px rgba(15,23,80,0.10),
            inset 0 1px 0 rgba(255,255,255,0.85),
            inset 0 -1px 0 rgba(255,255,255,0.2);
          overflow: hidden;
          position: relative;
        }

        .apr-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%);
        }

        .apr-card-header {
          padding: 18px 22px;
          border-bottom: 1px solid rgba(226,232,240,0.5);
          background: rgba(255,255,255,0.32);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .apr-card-header h5 {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #0f172a;
          margin: 0;
        }

        .apr-count-pill {
          background: rgba(241,245,249,0.8);
          border: 1px solid rgba(226,232,240,0.6);
          border-radius: 999px;
          font-size: 12.5px;
          color: #64748b;
          padding: 4px 14px;
          backdrop-filter: blur(6px);
        }

        .apr-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .apr-table thead th {
          background: linear-gradient(135deg, #49458f 0%, #3a377f 100%);
          color: #ffffff;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          padding: 20px 18px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          vertical-align: middle;
          border: none;
          white-space: nowrap;
          text-align: left;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .apr-table thead th:first-child {
          border-top-left-radius: 0;
        }

        .apr-table thead th:last-child {
          border-right: none;
          border-top-right-radius: 0;
        }

        .apr-table tbody td {
          font-family: 'DM Sans', sans-serif;
          padding: 13px 14px;
          vertical-align: middle;
          border-color: rgba(226,232,240,0.4);
          font-size: 13.5px;
          color: #1e293b;
          background: transparent;
        }

        .apr-table tbody tr {
          transition: background 0.18s ease;
        }

        .apr-table tbody tr:hover td {
          background: rgba(99,102,241,0.04);
        }

        .emp-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .emp-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f8ef7, #818cf8);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 12px;
          flex-shrink: 0;
          box-shadow: 0 6px 16px rgba(79,142,247,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
          border: 1.5px solid rgba(255,255,255,0.6);
        }

        .emp-name {
          font-weight: 600;
          font-size: 13.5px;
          color: #0f172a;
        }

        .emp-id {
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 1px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 13px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          text-transform: capitalize;
          backdrop-filter: blur(6px);
          border: 1px solid transparent;
        }

        .status-badge::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .status-approved {
          background: rgba(209,250,229,0.65);
          color: #065f46;
          border-color: rgba(110,231,183,0.4);
        }

        .status-approved::before {
          background: #10b981;
          box-shadow: 0 0 5px rgba(16,185,129,0.6);
        }

        .status-pending {
          background: rgba(254,243,199,0.65);
          color: #92400e;
          border-color: rgba(251,191,36,0.4);
        }

        .status-pending::before {
          background: #f59e0b;
          box-shadow: 0 0 5px rgba(245,158,11,0.6);
        }

        .status-rejected {
          background: rgba(254,226,226,0.65);
          color: #991b1b;
          border-color: rgba(252,165,165,0.4);
        }

        .status-rejected::before {
          background: #ef4444;
          box-shadow: 0 0 5px rgba(239,68,68,0.6);
        }

        .btn-approve, .btn-reject, .btn-done {
          font-family: 'Sora', sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(6px);
          white-space: nowrap;
        }

        .btn-approve {
          background: rgba(209,250,229,0.55);
          color: #065f46;
          border-color: rgba(110,231,183,0.5);
        }

        .btn-approve:hover:not(:disabled) {
          background: rgba(167,243,208,0.75);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(16,185,129,0.25);
          color: #064e3b;
        }

        .btn-reject {
          background: rgba(254,226,226,0.55);
          color: #991b1b;
          border-color: rgba(252,165,165,0.5);
        }

        .btn-reject:hover:not(:disabled) {
          background: rgba(254,202,202,0.75);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(239,68,68,0.22);
          color: #7f1d1d;
        }

        .btn-done {
          background: rgba(241,245,249,0.6);
          color: #94a3b8;
          border-color: rgba(226,232,240,0.5);
          cursor: not-allowed;
        }

        .btn-approve:disabled,
        .btn-reject:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .apr-empty, .apr-error {
          padding: 48px 24px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }

        .apr-error {
          color: #dc2626;
        }

        .apr-loading {
          padding: 48px 24px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        .apr-mobile {
          display: none;
        }

        .apr-mobile-card {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.45);
          border-radius: 18px;
          padding: 18px;
          margin-bottom: 14px;
          box-shadow: 0 8px 28px rgba(15,23,80,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: transform 0.2s ease;
        }

        .apr-mobile-card:hover {
          transform: translateY(-2px);
        }

        .apr-mob-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .apr-mob-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-bottom: 14px;
        }

        .apr-mob-field {
          background: rgba(241,245,249,0.55);
          border: 1px solid rgba(226,232,240,0.5);
          border-radius: 10px;
          padding: 9px 11px;
        }

        .apr-mob-field small {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        .apr-mob-field strong {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          word-break: break-word;
        }

        .apr-mob-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .apr-mob-actions button {
          width: 100%;
          padding: 9px;
          font-size: 13px;
        }

        @media (max-width: 767.98px) {
          .apr-desktop { display: none; }
          .apr-mobile  { display: block; }
          .apr-page    { padding: 16px 12px; }
          .apr-stat    { min-width: 120px; padding: 14px 16px; }
          .apr-stat-value { font-size: 1.5rem; }
        }

        @media (max-width: 575.98px) {
          .apr-stats { gap: 9px; }
          .apr-mob-grid { grid-template-columns: 1fr; }
          .apr-mob-actions { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="apr-page">
        <div className="apr-wrapper">
          <div className="apr-header">
            <div>
              <h2 className="apr-title">Employee Approval</h2>
              <p className="apr-subtitle">
                Review and manage pending employee registrations.
              </p>
            </div>
            <button className="btn-refresh" onClick={fetchEmployees}>
              ↻ Refresh
            </button>
          </div>

          <div className="apr-stats">
            <div className="apr-stat total">
              <div className="apr-stat-label">Total</div>
              <div className="apr-stat-value">{employees.length}</div>
            </div>
            <div className="apr-stat pending">
              <div className="apr-stat-label">Pending</div>
              <div className="apr-stat-value">{pendingCount}</div>
            </div>
            <div className="apr-stat approved">
              <div className="apr-stat-label">Approved</div>
              <div className="apr-stat-value">{approvedCount}</div>
            </div>
            <div className="apr-stat rejected">
              <div className="apr-stat-label">Rejected</div>
              <div className="apr-stat-value">{rejectedCount}</div>
            </div>
          </div>

          <div className="apr-card">
            <div className="apr-card-header">
              <h5>Employee Records</h5>
              <span className="apr-count-pill">
                {employees.length} employee{employees.length !== 1 ? "s" : ""}
              </span>
            </div>

            {error ? (
              <div className="apr-error">{error}</div>
            ) : loading ? (
              <div className="apr-loading">Loading employees…</div>
            ) : employees.length === 0 ? (
              <div className="apr-empty">No employees found.</div>
            ) : (
              <>
                <div className="table-responsive apr-desktop">
                  <table className="apr-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Employee</th>
                        <th>Email</th>
                        <th>Job Title</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, index) => (
                        <tr key={emp.id}>
                          <td style={{ color: "#94a3b8", fontWeight: 500 }}>
                            {index + 1}
                          </td>

                          <td>
                            <div className="emp-cell">
                              <div className="emp-avatar">
                                {getInitials(emp.name)}
                              </div>
                              <div>
                                <div className="emp-name">{emp.name || "N/A"}</div>
                                <div className="emp-id">
                                  {emp.employee_id || "No ID"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ color: "#475569" }}>
                            {emp.email || "N/A"}
                          </td>
                          <td>{emp.job_title || "N/A"}</td>
                          <td style={{ color: "#475569" }}>
                            {emp.phone || "N/A"}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                emp.approval_status === "approved"
                                  ? "status-approved"
                                  : emp.approval_status === "rejected"
                                  ? "status-rejected"
                                  : "status-pending"
                              }`}
                            >
                              {emp.approval_status || "pending"}
                            </span>
                          </td>

                          <td>
                            {emp.approval_status === "approved" ? (
                              <button className="btn-done" disabled>
                                ✓ Approved
                              </button>
                            ) : emp.approval_status === "rejected" ? (
                              <button className="btn-done" disabled>
                                ✕ Rejected
                              </button>
                            ) : (
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  className="btn-approve"
                                  onClick={() => handleApprove(emp.id)}
                                  disabled={actionId === emp.id}
                                >
                                  {actionId === emp.id ? "…" : "✓ Approve"}
                                </button>
                                <button
                                  className="btn-reject"
                                  onClick={() => handleReject(emp.id)}
                                  disabled={actionId === emp.id}
                                >
                                  {actionId === emp.id ? "…" : "✕ Reject"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="apr-mobile" style={{ padding: "16px" }}>
                  {employees.map((emp) => (
                    <div key={emp.id} className="apr-mobile-card">
                      <div className="apr-mob-top">
                        <div className="emp-avatar">{getInitials(emp.name)}</div>
                        <div>
                          <div className="emp-name">{emp.name || "N/A"}</div>
                          <div className="emp-id">{emp.email || "No email"}</div>
                        </div>
                      </div>

                      <div className="apr-mob-grid">
                        <div className="apr-mob-field">
                          <small>Employee ID</small>
                          <strong>{emp.employee_id || "N/A"}</strong>
                        </div>
                        <div className="apr-mob-field">
                          <small>Job Title</small>
                          <strong>{emp.job_title || "N/A"}</strong>
                        </div>
                        <div className="apr-mob-field">
                          <small>Phone</small>
                          <strong>{emp.phone || "N/A"}</strong>
                        </div>
                        <div
                          className="apr-mob-field"
                          style={{ gridColumn: "1 / -1" }}
                        >
                          <small>Status</small>
                          <span
                            className={`status-badge ${
                              emp.approval_status === "approved"
                                ? "status-approved"
                                : emp.approval_status === "rejected"
                                ? "status-rejected"
                                : "status-pending"
                            }`}
                            style={{ marginTop: 4, display: "inline-flex" }}
                          >
                            {emp.approval_status || "pending"}
                          </span>
                        </div>
                      </div>

                      <div className="apr-mob-actions">
                        {emp.approval_status === "approved" ? (
                          <button
                            className="btn-done"
                            disabled
                            style={{ gridColumn: "1 / -1" }}
                          >
                            ✓ Approved
                          </button>
                        ) : emp.approval_status === "rejected" ? (
                          <button
                            className="btn-done"
                            disabled
                            style={{ gridColumn: "1 / -1" }}
                          >
                            ✕ Rejected
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => handleApprove(emp.id)}
                              disabled={actionId === emp.id}
                            >
                              {actionId === emp.id
                                ? "Processing…"
                                : "✓ Approve"}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleReject(emp.id)}
                              disabled={actionId === emp.id}
                            >
                              {actionId === emp.id
                                ? "Processing…"
                                : "✕ Reject"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminEmployeeApproval;
