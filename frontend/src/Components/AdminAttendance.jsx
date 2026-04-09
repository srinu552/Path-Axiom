import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";

function AdminAttendance() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) { window.location.href = "/adminlogin"; return; }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/admin`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          window.location.href = "/adminlogin";
          return;
        }
        if (res.status === 403) { console.log("Forbidden: only admin can access"); return; }
        if (res.ok) { setData(Array.isArray(result) ? result : []); }
      } catch (error) {
        console.log("FETCH ERROR:", error);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase());
      const matchesDate = selectedDate ? item.date === selectedDate : true;
      return matchesSearch && matchesDate;
    });
  }, [data, search, selectedDate]);

  useEffect(() => { setCurrentPage(1); }, [search, selectedDate]);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + recordsPerPage);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "Attendance.xlsx");
  };

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const presentCount = data.filter((d) => d.status === "Present").length;
  const absentCount  = data.filter((d) => d.status !== "Present").length;

  return (
    <>
      <style>{`
        .att-page {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background:transparent;
          padding: 28px 20px;
          position: relative;
          box-sizing: border-box;
        }

        .att-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.55;
        }

        .att-wrapper {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ── Header ── */
        .att-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 24px;
        }

        .att-title {
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

        .att-subtitle {
          color: #64748b;
          font-size: 13.5px;
          margin: 4px 0 0;
        }

        .att-export-btn {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 11px 22px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(16,185,129,0.32), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: all 0.22s ease;
          white-space: nowrap;
        }

        .att-export-btn:hover {
          background: linear-gradient(135deg, #047857, #059669);
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.25);
        }

        /* ── Stat pills ── */
        .att-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .att-stat {
          flex: 1;
          min-width: 120px;
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

        .att-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(15,23,80,0.12), inset 0 1px 0 rgba(255,255,255,0.95);
        }

        .att-stat::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 80px; height: 80px;
          border-radius: 50%;
          opacity: 0.15;
        }

        .att-stat.total::before   { background: transparent; }
        .att-stat.present::before { background: transparent;  }
        .att-stat.absent::before  { background: transparent;  }

        .att-stat-label {
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
          margin-bottom: 8px;
        }

        .att-stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 1.9rem;
          font-weight: 700;
          line-height: 1;
        }

        .att-stat.total   .att-stat-value { background: linear-gradient(135deg,#4f46e5,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .att-stat.present .att-stat-value { background: linear-gradient(135deg,#059669,#34d399); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .att-stat.absent  .att-stat-value { background: linear-gradient(135deg,#dc2626,#f87171); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        /* ── Filter card ── */
        .att-filter-card {
          background: rgba(255,255,255,0.48);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.42);
          border-radius: 18px;
          padding: 18px 20px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(15,23,80,0.06), inset 0 1px 0 rgba(255,255,255,0.85);
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .att-input {
          font-family: 'DM Sans', sans-serif;
          flex: 1;
          min-width: 180px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(203,213,225,0.7);
          border-radius: 12px;
          font-size: 13.5px;
          color: #0f172a;
          outline: none;
          box-shadow: 0 2px 8px rgba(15,23,80,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .att-input::placeholder { color: #94a3b8; }

        .att-input:focus {
          background: rgba(255,255,255,0.85);
          border-color: rgba(99,102,241,0.5);
          box-shadow:
            0 0 0 3px rgba(99,102,241,0.12),
            0 2px 10px rgba(99,102,241,0.1),
            inset 0 1px 0 rgba(255,255,255,0.95);
        }

        /* ── Main glass card ── */
        .att-card {
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

        .att-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%);
        }

        .att-card-header {
          padding: 18px 22px;
          border-bottom: 1px solid rgba(226,232,240,0.5);
          background: rgba(255,255,255,0.32);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .att-card-header h5 {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #0f172a;
          margin: 0;
        }

        .att-count-pill {
          background: rgba(241,245,249,0.8);
          border: 1px solid rgba(226,232,240,0.6);
          border-radius: 999px;
          font-size: 12.5px;
          color: #64748b;
          padding: 4px 14px;
          backdrop-filter: blur(6px);
        }

        /* ── Table ── */
        .att-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .att-table thead th {
          background: linear-gradient(135deg, rgba(15,23,80,0.88), rgba(49,46,129,0.92));
          color: rgba(255,255,255,0.95);
          font-family: 'Sora', sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          padding: 15px 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          vertical-align: middle;
          border: none;
          white-space: nowrap;
        }

        .att-table tbody td {
          font-family: 'DM Sans', sans-serif;
          padding: 13px 14px;
          vertical-align: middle;
          border-color: rgba(226,232,240,0.4);
          font-size: 13.5px;
          color: #1e293b;
          background: transparent;
        }

        .att-table tbody tr { transition: background 0.18s ease; }
        .att-table tbody tr:hover td { background: rgba(99,102,241,0.04); }

        /* ── Employee cell ── */
        .att-emp-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .att-avatar {
          width: 36px;
          height: 36px;
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
          box-shadow: 0 4px 12px rgba(79,142,247,0.28), inset 0 1px 0 rgba(255,255,255,0.3);
          border: 1.5px solid rgba(255,255,255,0.6);
        }

        .att-emp-name  { font-weight: 600; font-size: 13.5px; color: #0f172a; }
        .att-emp-email { font-size: 12px; color: #94a3b8; margin-top: 1px; }

        /* ── Status badges ── */
        .att-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 13px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          backdrop-filter: blur(6px);
          border: 1px solid transparent;
        }

        .att-badge::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .att-present {
          background: rgba(209,250,229,0.65);
          color: #065f46;
          border-color: rgba(110,231,183,0.4);
        }
        .att-present::before { background: #10b981; box-shadow: 0 0 5px rgba(16,185,129,0.6); }

        .att-absent {
          background: rgba(254,226,226,0.65);
          color: #991b1b;
          border-color: rgba(252,165,165,0.4);
        }
        .att-absent::before { background: #ef4444; box-shadow: 0 0 5px rgba(239,68,68,0.6); }

        /* ── Time cell ── */
        .att-time {
          font-size: 13px;
          color: #334155;
          font-variant-numeric: tabular-nums;
        }

        .att-time-null {
          font-size: 12.5px;
          color: #94a3b8;
          font-style: italic;
        }

        /* ── Pagination ── */
        .att-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding: 18px;
          flex-wrap: wrap;
        }

        .att-page-btn {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 600;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(226,232,240,0.6);
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(6px);
          color: #475569;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(15,23,80,0.05);
        }

        .att-page-btn:hover {
          background: rgba(255,255,255,0.82);
          border-color: rgba(99,102,241,0.35);
          color: #4f46e5;
          transform: translateY(-1px);
        }

        .att-page-btn.active {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 6px 16px rgba(79,70,229,0.32);
        }

        /* ── Empty / Loading ── */
        .att-empty {
          padding: 48px 24px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        /* ── Mobile cards ── */
        .att-mobile { display: none; }

        .att-mob-card {
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

        .att-mob-card:hover { transform: translateY(-2px); }

        .att-mob-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .att-mob-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .att-mob-field {
          background: rgba(241,245,249,0.55);
          border: 1px solid rgba(226,232,240,0.5);
          border-radius: 10px;
          padding: 9px 11px;
        }

        .att-mob-field small {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        .att-mob-field strong {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          word-break: break-word;
        }

        /* ── Responsive ── */
        @media (max-width: 767.98px) {
          .att-desktop { display: none; }
          .att-mobile  { display: block; }
          .att-page    { padding: 16px 12px; }
          .att-stat    { min-width: 100px; padding: 14px 16px; }
          .att-stat-value { font-size: 1.5rem; }
        }

        @media (max-width: 575.98px) {
          .att-stats  { gap: 9px; }
          .att-mob-grid { grid-template-columns: 1fr; }
          .att-filter-card { flex-direction: column; }
          .att-input { min-width: unset; width: 100%; }
          .att-export-btn { width: 100%; }
        }
      `}</style>

      <div className="att-page">
        <div className="att-wrapper">

          {/* ── Page Header ── */}
          <div className="att-header">
            <div>
              <h2 className="att-title">Employee Attendance</h2>
              <p className="att-subtitle">Monitor daily login, logout, and work duration records.</p>
            </div>
            <button className="att-export-btn" onClick={exportToExcel}>
              ↓ Export Excel
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="att-stats">
            <div className="att-stat total">
              <div className="att-stat-label">Total Records</div>
              <div className="att-stat-value">{data.length}</div>
            </div>
            <div className="att-stat present">
              <div className="att-stat-label">Present</div>
              <div className="att-stat-value">{presentCount}</div>
            </div>
            <div className="att-stat absent">
              <div className="att-stat-label">Absent</div>
              <div className="att-stat-value">{absentCount}</div>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="att-filter-card">
            <input
              type="text"
              className="att-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              className="att-input"
              style={{ maxWidth: 200 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* ── Main Card ── */}
          <div className="att-card">
            <div className="att-card-header">
              <h5>Attendance Records</h5>
              <span className="att-count-pill">
                {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Desktop table */}
            <div className="table-responsive att-desktop">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Login</th>
                    <th>Logout</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="att-empty">No records found</td>
                    </tr>
                  ) : (
                    currentData.map((item, index) => (
                      <tr key={index}>
                        <td style={{ color: "#94a3b8", fontWeight: 500 }}>
                          {startIndex + index + 1}
                        </td>

                        <td>
                          <div className="att-emp-cell">
                            <div className="att-avatar">{getInitials(item.name)}</div>
                            <div>
                              <div className="att-emp-name">{item.name}</div>
                              <div className="att-emp-email">{item.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontWeight: 500 }}>{item.date}</td>

                        <td>
                          {item.login_time
                            ? <span className="att-time">{new Date(item.login_time).toLocaleTimeString()}</span>
                            : <span className="att-time-null">Not logged in</span>}
                        </td>

                        <td>
                          {item.logout_time
                            ? <span className="att-time">{new Date(item.logout_time).toLocaleTimeString()}</span>
                            : <span className="att-time-null">—</span>}
                        </td>

                        <td style={{ fontWeight: 500 }}>{item.duration || <span className="att-time-null">—</span>}</td>

                        <td>
                          <span className={`att-badge ${item.status === "Present" ? "att-present" : "att-absent"}`}>
                            {item.status || "Absent"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="att-mobile" style={{ padding: "16px" }}>
              {currentData.length === 0 ? (
                <div className="att-empty">No records found</div>
              ) : (
                currentData.map((item, index) => (
                  <div key={index} className="att-mob-card">
                    <div className="att-mob-top">
                      <div className="att-avatar">{getInitials(item.name)}</div>
                      <div>
                        <div className="att-emp-name">{item.name}</div>
                        <div className="att-emp-email">{item.email}</div>
                      </div>
                    </div>

                    <div className="att-mob-grid">
                      <div className="att-mob-field">
                        <small>Date</small>
                        <strong>{item.date}</strong>
                      </div>
                      <div className="att-mob-field">
                        <small>Status</small>
                        <span className={`att-badge ${item.status === "Present" ? "att-present" : "att-absent"}`}
                          style={{ marginTop: 3, display: "inline-flex" }}>
                          {item.status || "Absent"}
                        </span>
                      </div>
                      <div className="att-mob-field">
                        <small>Login</small>
                        <strong>
                          {item.login_time ? new Date(item.login_time).toLocaleTimeString() : "—"}
                        </strong>
                      </div>
                      <div className="att-mob-field">
                        <small>Logout</small>
                        <strong>
                          {item.logout_time ? new Date(item.logout_time).toLocaleTimeString() : "—"}
                        </strong>
                      </div>
                      <div className="att-mob-field" style={{ gridColumn: "1 / -1" }}>
                        <small>Duration</small>
                        <strong>{item.duration || "—"}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="att-pagination">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`att-page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default AdminAttendance;
