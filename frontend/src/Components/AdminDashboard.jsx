import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PayrollSystem from "./PayrollSystem";
import AdminEmployeeList from "./AdminEmployeeList";
import AdminAttendance from "./AdminAttendance";
import AdminLeaveManagement from "./AdminLeaveManagement";
import AdminEmployeeApproval from "./AdminEmployeeApproval";
import "./AdminDashboard.css";
import AdminRoleManager from "./AdminRoleManager";
import AdminManagerReview from "./AdminManagerReview";
import AdminPerformanceReviews from "./AdminPerformanceReviews";
import AdminTeamManager from "./AdminTeamManager";

/* ── Icon map for sidebar menu items ── */
const ICONS = {
  Dashboard:           "⊞",
  Attendance:          "📅",
  "Admin Approval":    "✅",
  Employees:           "👨‍💻",
  Roles:               "🛡",
  "Leave Management":  "🌿",
  Payroll:             "💳",
  "Review Managers":   "⭐",
  "Performance Reviews":"📊",
  "Team Assign":"👥"
};

const menuSections = [
  { title: "MAIN",         items: ["Dashboard", "Attendance"] },
  { title: "ORGANIZATION", items: ["Admin Approval", "Employees", "Roles", "Leave Management", "Payroll","Team Assign", "Review Managers", "Performance Reviews"] },
];

const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / (600 / 16);
    const t = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <h4>{count}</h4>;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [employees,          setEmployees]          = useState([]);
  const [taskForm,           setTaskForm]           = useState({ employeeId: "", title: "", dueDate: "", priority: "Medium" });
  const [recentTasks,        setRecentTasks]        = useState([]);
  const [sidebarOpen,        setSidebarOpen]        = useState(window.innerWidth > 768);
  const [activePage,         setActivePage]         = useState("Dashboard");
  const [darkMode,           setDarkMode]           = useState(false);
  const [showProfile,        setShowProfile]        = useState(false);
  const [showNotification,   setShowNotification]   = useState(false);
  const [search,             setSearch]             = useState("");
  const [announcementInput,  setAnnouncementInput]  = useState("");
  const [announcements,      setAnnouncements]      = useState([]);
  const [isMobile,           setIsMobile]           = useState(window.innerWidth <= 768);
  const [selectedPayrollEmployee, setSelectedPayrollEmployee] = useState(null);

  const getToken = () => localStorage.getItem("adminToken");

  const normalizeEmployee = (emp) => ({
    ...emp,
    name:        emp.name || emp.full_name || "",
    email:       emp.email || "",
    dept:        emp.dept || emp.department || "",
    job_title:   emp.job_title || emp.designation || "",
    employee_id: emp.employee_id || "",
  });

  const stats = [
    { title: "Attendance Records", count: recentTasks.length, icon: "📅", color: "#7c3aed" },
    { title: "Total Employees",    count: employees.length,   icon: "👥", color: "#2563eb" },
  ];

  const filteredEmployees = employees.filter(emp => {
    const v = search.toLowerCase().trim();
    return [emp.name, emp.email, emp.dept, emp.job_title, emp.employee_id]
      .some(f => String(f || "").toLowerCase().includes(v));
  });

  const selectedEmployee = employees.find(e => String(e.id) === String(taskForm.employeeId));

  const getPriorityClass = (p) => {
    const v = String(p || "Medium").toLowerCase();
    if (v === "high") return "priority-high";
    if (v === "low")  return "priority-low";
    return "priority-medium";
  };

  const handleEmployeeSelect = (emp) => {
    setTaskForm(prev => ({ ...prev, employeeId: emp.id }));
    setSearch(emp.name || emp.employee_id || "");
  };
  const handlePayrollEmployeeSelect = (emp) => {
    setSelectedPayrollEmployee(emp);
    setSearch(emp.name || emp.employee_id || "");
  };
  const handleMenuClick = (item) => {
    setActivePage(item);
    if (isMobile) setSidebarOpen(false);
    setShowProfile(false);
    setShowNotification(false);
  };

  const handleLogout = () => {
    ["token","user","adminToken","adminUser","employeeToken","employeeUser","managerToken","managerUser"]
      .forEach(k => localStorage.removeItem(k));
    navigate("/adminlogin");
  };

  /* ── API calls ── */
  const fetchEmployees = async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/employees`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      setEmployees(list.map(normalizeEmployee));
    } catch { setEmployees([]); }
  };
  const fetchAnnouncements = async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
    } catch { setAnnouncements([]); }
  };
  const addAnnouncement = async () => {
    if (!announcementInput.trim()) return alert("Please enter announcement");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ text: announcementInput.trim() }),
      });
      if (!res.ok) { const d = await res.json(); return alert(d.message || "Failed"); }
      setAnnouncementInput(""); fetchAnnouncements();
    } catch { alert("Something went wrong"); }
  };
  const deleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return alert("Failed to delete");
      setAnnouncements(prev => prev.filter(item => (item.id || item.announcement_id) !== id));
    } catch { alert("Something went wrong"); }
  };
  const fetchTasks = async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setRecentTasks(Array.isArray(data) ? data : Array.isArray(data.tasks) ? data.tasks : []);
    } catch { setRecentTasks([]); }
  };
  const assignTask = async () => {
    if (!taskForm.employeeId || !taskForm.title.trim()) return alert("Fill required fields");
    try {
      const emp = employees.find(e => String(e.id) === String(taskForm.employeeId));
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ user_id: taskForm.employeeId, title: taskForm.title.trim(), due_date: taskForm.dueDate || null, priority: taskForm.priority }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.message || "Task creation failed");
      setRecentTasks(prev => [{ ...data, name: data.name || emp?.name || "N/A", employee_name: data.employee_name || emp?.name || "N/A", priority: data.priority || taskForm.priority, due_date: data.due_date || taskForm.dueDate || null }, ...prev]);
      setTaskForm({ employeeId: "", title: "", dueDate: "", priority: "Medium" });
      setSearch("");
    } catch { alert("Something went wrong"); }
  };
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) return alert("Failed to delete task");
      setRecentTasks(prev => prev.filter(t => t.id !== id));
    } catch { alert("Something went wrong"); }
  };
  const updateTask = async (task) => {
    const newTitle = prompt("Edit Task Title:", task.title);
    if (!newTitle?.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ title: newTitle.trim(), due_date: task.due_date || null, priority: task.priority || "Medium" }),
      });
      const updated = await res.json().catch(() => null);
      if (!res.ok) return alert("Update failed");
      updated
        ? setRecentTasks(prev => prev.map(i => i.id === task.id ? { ...i, ...updated } : i))
        : fetchTasks();
    } catch { alert("Something went wrong"); }
  };

  useEffect(() => {
    fetchAnnouncements(); fetchEmployees(); fetchTasks();
  }, []);
  useEffect(() => {
    const onResize = () => {
      const mob = window.innerWidth <= 768;
      setIsMobile(mob);
      if (!mob) setSidebarOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ─────────────────────────────────────
     RENDER
  ───────────────────────────────────── */
  return (
    <div className={`admin-dashboard ${darkMode ? "dark-mode" : ""}`}>

      {/* ── SIDEBAR ── */}
      <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">⚡</div>
          <div className="sidebar-brand-name">Path Axiom</div>
        </div>

        <div className="sidebar-nav">
          {menuSections.map((section, si) => (
            <div key={si}>
              <div className="section-heading">{section.title}</div>
              {section.items.map((item, ii) => (
                <div
                  key={ii}
                  className={`menu-item ${activePage === item ? "active" : ""}`}
                  onClick={() => handleMenuClick(item)}
                  title={!sidebarOpen ? item : ""}
                >
                  <span className="menu-icon">{ICONS[item] || "•"}</span>
                  <span className="menu-label">{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div className="overlay" onClick={() => { setSidebarOpen(false); setShowProfile(false); setShowNotification(false); }} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className={`content ${sidebarOpen && !isMobile ? "content-expanded" : !isMobile ? "content-collapsed" : "content-mobile"}`}>

        {/* Topbar */}
        <div className="header">
          <div className="top-bar">
            <span className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</span>
            <div className="page-chip">{activePage}</div>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search employee by name, email, dept, ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="header-actions">
            <div className="icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
              {darkMode ? "🌙" : "☀️"}
            </div>
            
            <div className="icon-btn dropdown-parent" onClick={() => { setShowProfile(!showProfile); setShowNotification(false); }}>
              👤
              {showProfile && (
                <div className="dropdown-box">
                  <div onClick={() => navigate("/admin-profile")}>Profile</div>
                  <div onClick={handleLogout} className="logout-text">Logout</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DASHBOARD PAGE ── */}
        {activePage === "Dashboard" && (
          <>
            {/* Stat cards */}
           

            {/* Search results */}
            {search && (
              <div className="custom-card p-4 mb-4">
                <div className="card-section-title">Search Results</div>
                {filteredEmployees.length === 0 ? (
                  <p style={{ color: "var(--text-faint)", fontSize: 13 }}>No employees found</p>
                ) : filteredEmployees.map(emp => (
                  <div key={emp.id} className={`search-result-item ${String(taskForm.employeeId) === String(emp.id) ? "selected-search-result" : ""}`}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <strong style={{ fontSize: 14 }}>{emp.name || "No Name"}</strong>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                          {emp.employee_id || "N/A"} · {emp.email || "N/A"} · {emp.dept || "N/A"} · {emp.job_title || "N/A"}
                        </div>
                      </div>
                      <button className="btn btn-sm btn-primary" onClick={() => handleEmployeeSelect(emp)}>Assign Task</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="row g-4">
              {/* Assign Task */}
              <div className="col-md-6">
                <div className="custom-card p-4 h-100">
                  <div className="card-section-title">Assign Task</div>

                  {selectedEmployee && (
                    <div className="selected-employee-box mb-3">
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedEmployee.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                        {selectedEmployee.employee_id} · {selectedEmployee.dept}
                      </div>
                      <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => setTaskForm(p => ({ ...p, employeeId: "" }))}>
                        Clear
                      </button>
                    </div>
                  )}

                  <select className="form-select mb-2" value={taskForm.employeeId} onChange={e => setTaskForm({ ...taskForm, employeeId: e.target.value })}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || "No Name"} ({emp.dept || "No Dept"}) — {emp.employee_id || "No ID"}
                      </option>
                    ))}
                  </select>

                  <input type="text" className="form-control mb-2" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <input type="date" className="form-control" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                        <option>High</option><option>Medium</option><option>Low</option>
                      </select>
                    </div>
                  </div>

                  <button className="btn btn-primary w-100 mb-3" onClick={assignTask}>Assign Task</button>

                  <div className="card-section-title mt-2">Task List</div>
                  {recentTasks.length === 0 ? (
                    <p style={{ color: "var(--text-faint)", fontSize: 13 }}>No tasks yet</p>
                  ) : recentTasks.map(task => (
                    <div key={task.id} className="task-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{task.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          {task.employee_name || task.name || "N/A"}
                          <span className={`priority-badge ${getPriorityClass(task.priority)}`}>{task.priority || "Medium"}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                          Due: {task.due_date ? String(task.due_date).split("T")[0] : "—"}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-warning" onClick={() => updateTask(task)}>Edit</button>
                        <button className="btn btn-sm btn-danger"  onClick={() => deleteTask(task.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div className="col-md-6">
                <div className="custom-card p-4 h-100">
                  <div className="card-section-title">Announcements</div>

                  <div className="d-flex gap-2 mb-3">
                    <input type="text" className="form-control" value={announcementInput} onChange={e => setAnnouncementInput(e.target.value)} placeholder="Enter announcement…" />
                    <button className="btn btn-success" onClick={addAnnouncement} style={{ whiteSpace: "nowrap" }}>+ Add</button>
                  </div>

                  {announcements.length === 0 ? (
                    <p style={{ color: "var(--text-faint)", fontSize: 13 }}>No announcements yet</p>
                  ) : announcements.map(item => {
                    const id = item.id || item.announcement_id;
                    return (
                      <div key={id} className="announcement-item">
                        <span style={{ fontSize: 13 }}>{item.text}</span>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteAnnouncement(id)}>Delete</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── OTHER PAGES ── */}
        {activePage === "Attendance" && (
          <div className="custom-card p-4"><AdminAttendance /></div>
        )}
        {activePage === "Employees" && (
          <div className="custom-card p-4"><AdminEmployeeList /></div>
        )}
        {activePage === "Roles" && (
          <div className="custom-card p-4"><AdminRoleManager /></div>
        )}
        {activePage === "Leave Management" && (
          <div className="custom-card p-4"><AdminLeaveManagement /></div>
        )}
        {activePage === "Admin Approval" && (
          <div className="custom-card p-4"><AdminEmployeeApproval /></div>
        )}
        {activePage === "Payroll" && (
          <div className="custom-card p-4">
            {search && (
              <div className="mb-4">
                <div className="card-section-title">Search Results</div>
                {filteredEmployees.length === 0 ? (
                  <p style={{ color: "var(--text-faint)", fontSize: 13 }}>No employees found</p>
                ) : filteredEmployees.map(emp => (
                  <div key={emp.id} className={`search-result-item ${String(selectedPayrollEmployee?.employee_id) === String(emp.employee_id) ? "selected-search-result" : ""}`}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <strong style={{ fontSize: 14 }}>{emp.name || "No Name"}</strong>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                          {emp.employee_id} · {emp.email} · {emp.dept} · {emp.job_title}
                        </div>
                      </div>
                      <button className="btn btn-sm btn-success" onClick={() => handlePayrollEmployeeSelect(emp)}>Use In Payroll</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedPayrollEmployee && (
              <div className="selected-employee-box mb-4">
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>Selected for Payroll</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedPayrollEmployee.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                  {selectedPayrollEmployee.employee_id} · {selectedPayrollEmployee.dept} · {selectedPayrollEmployee.job_title}
                </div>
                <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => setSelectedPayrollEmployee(null)}>Clear</button>
              </div>
            )}
            <PayrollSystem selectedEmployee={selectedPayrollEmployee} />
          </div>
        )}
        {activePage === "Team Assign" && (
          <div className="custom-card p-4"><AdminTeamManager /></div>
        )}
        {activePage === "Review Managers" && (
          <div className="custom-card p-4"><AdminManagerReview /></div>
        )}
        {activePage === "Performance Reviews" && (
          <div className="custom-card p-4"><AdminPerformanceReviews /></div>
        )}
        

      </div>
    </div>
  );
}