import { useState } from "react";

export default function AdminRoleManager() {
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("employee");
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchEmployee = async () => {
    if (!employeeId.trim()) {
      setError("Please enter an Employee ID");
      setEmployee(null);
      return;
    }
    try {
      setSearching(true);
      setError("");
      setMessage("");
      setEmployee(null);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/roles/employee/${employeeId.trim()}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Employee not found"); return; }
      setEmployee(data);
      setRole(data.role || "employee");
    } catch {
      setError("Failed to fetch employee details");
    } finally {
      setSearching(false);
    }
  };

  const updateRole = async () => {
    if (!employeeId.trim()) { setError("Please enter an Employee ID"); return; }
    if (!employee) { setError("Search for an employee first"); return; }
    try {
      setLoading(true);
      setError("");
      setMessage("");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/roles/promote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeId: employeeId.trim(), newRole: role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to update role"); return; }
      setMessage(data.message || "Role updated successfully!");
      setEmployee((prev) => (prev ? { ...prev, role } : prev));
    } catch {
      setError("Server error while updating role");
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    employee: { bg: "rgba(219,234,254,0.65)", color: "#1e40af", border: "rgba(147,197,253,0.5)" },
    teamlead: { bg: "rgba(237,233,254,0.65)", color: "#5b21b6", border: "rgba(196,181,253,0.5)" },
    manager:  { bg: "rgba(209,250,229,0.65)", color: "#065f46", border: "rgba(110,231,183,0.5)" },
    hr:       { bg: "rgba(254,243,199,0.65)", color: "#92400e", border: "rgba(251,191,36,0.5)"  },
    admin:    { bg: "rgba(254,226,226,0.65)", color: "#991b1b", border: "rgba(252,165,165,0.5)" },
  };

  const currentRoleStyle = roleColors[employee?.role] || roleColors.employee;

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`

        .rm-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background:transparent;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 20px;
          position: relative;
          box-sizing: border-box;
        }

        .rm-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.55;
        }

        .rm-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 560px;
          background: rgba(255,255,255,0.52);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.45);
          box-shadow:
            0 20px 60px rgba(15,23,80,0.14),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(255,255,255,0.2);
          padding: 32px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* top refraction line */
        .rm-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%);
          border-radius: 28px 28px 0 0;
        }

        /* decorative orbs */
        .rm-card::after {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .rm-title {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 1.65rem;
          text-align: center;
          background: linear-gradient(135deg, #1e3a8a 0%, #4f46e5 55%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .rm-subtitle {
          text-align: center;
          color: #64748b;
          font-size: 13.5px;
          margin: 0 0 28px;
        }

        .rm-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(226,232,240,0.8), transparent);
          margin: 22px 0;
        }

        .rm-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
          margin-bottom: 8px;
        }

        .rm-search-row {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .rm-input, .rm-select {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          padding: 13px 16px;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(203,213,225,0.7);
          border-radius: 14px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
          box-shadow: 0 2px 8px rgba(15,23,80,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.2s ease;
        }

        .rm-input::placeholder { color: #94a3b8; }

        .rm-input:focus, .rm-select:focus {
          background: rgba(255,255,255,0.85);
          border-color: rgba(99,102,241,0.5);
          box-shadow:
            0 0 0 3px rgba(99,102,241,0.12),
            0 2px 10px rgba(99,102,241,0.1),
            inset 0 1px 0 rgba(255,255,255,0.95);
        }

        .rm-select {
          margin-bottom: 20px;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }

        .rm-btn {
          font-family: 'Sora', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          padding: 13px 20px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.22s ease;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .rm-btn-search {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(99,102,241,0.35);
          color: #4f46e5;
          min-width: 110px;
          box-shadow: 0 4px 14px rgba(79,70,229,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .rm-btn-search:hover:not(:disabled) {
          background: rgba(255,255,255,0.82);
          border-color: rgba(99,102,241,0.55);
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(79,70,229,0.18), inset 0 1px 0 rgba(255,255,255,0.95);
        }

        .rm-btn-update {
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          box-shadow: 0 8px 24px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .rm-btn-update:hover:not(:disabled) {
          background: linear-gradient(135deg, #4338ca, #6d28d9);
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(79,70,229,0.45), inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .rm-btn-update:disabled {
          background: rgba(203,213,225,0.6);
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .rm-btn-search:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Employee detail card ── */
        .rm-emp-card {
          background: rgba(255,255,255,0.48);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 18px;
          padding: 18px 20px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(15,23,80,0.07), inset 0 1px 0 rgba(255,255,255,0.85);
          animation: slideIn 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        .rm-emp-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .rm-emp-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f8ef7, #818cf8);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 6px 18px rgba(79,142,247,0.32), inset 0 1px 0 rgba(255,255,255,0.3);
          border: 2px solid rgba(255,255,255,0.65);
        }

        .rm-emp-name {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 15.5px;
          color: #0f172a;
        }

        .rm-emp-email {
          font-size: 12.5px;
          color: #94a3b8;
          margin-top: 2px;
          word-break: break-word;
        }

        .rm-emp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .rm-emp-field {
          background: rgba(241,245,249,0.55);
          border: 1px solid rgba(226,232,240,0.5);
          border-radius: 10px;
          padding: 10px 12px;
        }

        .rm-emp-field small {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        .rm-emp-field strong {
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
          word-break: break-word;
        }

        .rm-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          border: 1px solid transparent;
          backdrop-filter: blur(6px);
        }

        .rm-role-badge::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
          background: currentColor;
          opacity: 0.7;
        }

        /* ── Feedback messages ── */
        .rm-feedback {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: fadeUp 0.22s ease;
          backdrop-filter: blur(8px);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rm-feedback.error {
          background: rgba(254,226,226,0.65);
          border: 1px solid rgba(252,165,165,0.45);
          color: #991b1b;
        }

        .rm-feedback.success {
          background: rgba(209,250,229,0.65);
          border: 1px solid rgba(110,231,183,0.45);
          color: #065f46;
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .rm-page    { padding: 20px 12px; align-items: flex-start; }
          .rm-card    { padding: 22px 18px; border-radius: 22px; }
          .rm-title   { font-size: 1.4rem; }
          .rm-search-row { flex-direction: column; }
          .rm-btn-search { min-width: unset; }
          .rm-emp-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 400px) {
          .rm-card  { padding: 18px 14px; }
          .rm-title { font-size: 1.25rem; }
        }
      `}</style>

      <div className="rm-page">
        <div className="rm-card">

          {/* ── Title ── */}
          <h2 className="rm-title">Role Management</h2>
          <p className="rm-subtitle">Search an employee and assign a new role.</p>

          {/* ── Search ── */}
          <label className="rm-label">Employee ID</label>
          <div className="rm-search-row">
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchEmployee()}
              placeholder="e.g. PA-EMP-1001"
              className="rm-input"
            />
            <button
              onClick={fetchEmployee}
              disabled={searching}
              className="rm-btn rm-btn-search"
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </div>

          {/* ── Employee detail card ── */}
          {employee && (
            <div className="rm-emp-card">
              <div className="rm-emp-top">
                <div className="rm-emp-avatar">{getInitials(employee.name)}</div>
                <div>
                  <div className="rm-emp-name">{employee.name}</div>
                  <div className="rm-emp-email">{employee.email}</div>
                </div>
              </div>

              <div className="rm-emp-grid">
                <div className="rm-emp-field">
                  <small>Department</small>
                  <strong>{employee.dept || "N/A"}</strong>
                </div>
                <div className="rm-emp-field">
                  <small>Job Title</small>
                  <strong>{employee.job_title || "N/A"}</strong>
                </div>
                <div className="rm-emp-field" style={{ gridColumn: "1 / -1" }}>
                  <small>Current Role</small>
                  <span
                    className="rm-role-badge"
                    style={{
                      background: currentRoleStyle.bg,
                      color: currentRoleStyle.color,
                      borderColor: currentRoleStyle.border,
                      marginTop: 4,
                    }}
                  >
                    {employee.role || "employee"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="rm-divider" />

          {/* ── Role select ── */}
          <label className="rm-label">Select New Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rm-select"
          >
            <option value="employee">Employee</option>
            <option value="teamlead">Team Lead</option>
            <option value="manager">Manager</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>

          {/* ── Update button ── */}
          <button
            onClick={updateRole}
            disabled={loading || !employee}
            className="rm-btn rm-btn-update"
          >
            {loading ? "Updating…" : "Update Role"}
          </button>

          {/* ── Feedback ── */}
          {error   && <div className="rm-feedback error">⚠ {error}</div>}
          {message && <div className="rm-feedback success">✓ {message}</div>}

        </div>
      </div>
    </>
  );
}
