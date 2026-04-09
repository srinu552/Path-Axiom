import React, { useEffect, useMemo, useState } from "react";
import "./AdminEmployeeList.css";

export default function AdminEmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

    const result = await res.json();
    setEmployees(
      Array.isArray(result)
        ? result
        : Array.isArray(result.data)
        ? result.data
        : []
    );
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError("Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const uniqueDepartments = useMemo(() => {
    const depts = employees.map((emp) => emp.dept).filter(Boolean);
    return ["All", ...new Set(depts)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        emp.name?.toLowerCase().includes(searchValue) ||
        emp.email?.toLowerCase().includes(searchValue) ||
        emp.employee_id?.toLowerCase().includes(searchValue) ||
        emp.dept?.toLowerCase().includes(searchValue) ||
        emp.job_title?.toLowerCase().includes(searchValue);

      const matchesDepartment =
        departmentFilter === "All" || emp.dept === departmentFilter;

      const matchesGender =
        genderFilter === "All" || emp.gender === genderFilter;

      return matchesSearch && matchesDepartment && matchesGender;
    });
  }, [employees, search, departmentFilter, genderFilter]);

  const totalEmployees = employees.length;
  const maleCount = employees.filter((emp) => emp.gender === "Male").length;
  const femaleCount = employees.filter((emp) => emp.gender === "Female").length;

  const exportToCSV = () => {
    if (filteredEmployees.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "No",
      "Employee ID",
      "Name",
      "Email",
      "Department",
      "Job Title",
      "Start Date",
      "Category",
      "Gender",
    ];

    const rows = filteredEmployees.map((emp, index) => [
      index + 1,
      emp.employee_id || "",
      emp.name || "",
      emp.email || "",
      emp.dept || "",
      emp.job_title || "",
      emp.start_date || "",
      emp.category || "",
      emp.gender || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return String(date).split("T")[0];
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleEditClick = (emp) => {
    setEditEmployee({
      ...emp,
      employee_id: emp.employee_id || "",
      start_date:
        formatDate(emp.start_date) === "N/A" ? "" : formatDate(emp.start_date),
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      if (!editEmployee.employee_id?.trim()) {
        alert("Employee ID is required");
        return;
      }

      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employees/${editEmployee.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_id: editEmployee.employee_id.trim().toUpperCase(),
            name: editEmployee.name,
            dept: editEmployee.dept,
            job_title: editEmployee.job_title,
            start_date: editEmployee.start_date,
            category: editEmployee.category,
            gender: editEmployee.gender,
            actions: editEmployee.actions,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed");
        return;
      }

      alert("Employee updated successfully");
      setShowModal(false);
      setEditEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error("Update error:", error);
      alert("Something went wrong while updating employee");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      alert("Employee deleted successfully");
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting employee");
    }
  };

  return (
    <div className="employee-page container-fluid py-3 py-md-4">
      <div className="employee-wrapper">
        <div className="employee-header">
          <div className="employee-title">
            <h2>Employee Directory</h2>
            <p>Manage, review, edit, delete, and export employee records.</p>
          </div>

          <button className="btn btn-success export-btn" onClick={exportToCSV}>
            Export CSV
          </button>
        </div>

        <div className="row g-3 mb-1 stats-row">
          <div className="col-12 col-sm-6 col-xl-4">
            <div className="stat-box">
              <div className="stat-label">Total Employees</div>
              <div className="stat-value">{totalEmployees}</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-4">
            <div className="stat-box">
              <div className="stat-label">Male Employees</div>
              <div className="stat-value">{maleCount}</div>
            </div>
          </div>

          <div className="col-12 col-sm-12 col-xl-4">
            <div className="stat-box">
              <div className="stat-label">Female Employees</div>
              <div className="stat-value">{femaleCount}</div>
            </div>
          </div>
        </div>

        <div className="filter-card">
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by name, email, employee ID, department, or job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <select
                className="form-select filter-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {uniqueDepartments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <select
                className="form-select filter-select"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-box">
            <h5>Loading employees...</h5>
            <p className="text-muted mb-0">Please wait a moment.</p>
          </div>
        ) : error ? (
          <div className="error-box">
            <h5 className="text-danger">{error}</h5>
            <p className="text-muted mb-0">
              Please check your token and API route.
            </p>
          </div>
        ) : (
          <>
            <div className="table-card desktop-table">
              <div className="table-header-bar">
                <div>
                  <h5>Employee Records</h5>
                  <span>Showing {filteredEmployees.length} employee(s)</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table employee-table align-middle">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Job Title</th>
                      <th>Start Date</th>
                      <th>Category</th>
                      <th>Gender</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp, index) => (
                        <tr key={emp.id}>
                          <td>{index + 1}</td>

                          <td>
                            <div className="employee-info">
                              <div className="avatar">{getInitials(emp.name)}</div>
                              <div className="employee-text-wrap">
                                <div className="employee-name">{emp.name}</div>
                                <div className="employee-email">
                                  {emp.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge-soft badge-dept">
                              {emp.employee_id || "N/A"}
                            </span>
                          </td>

                          <td>
                            <span className="badge-soft badge-dept">
                              {emp.dept || "N/A"}
                            </span>
                          </td>

                          <td>{emp.job_title || "N/A"}</td>
                          <td>{formatDate(emp.start_date)}</td>

                          <td>
                            <span className="badge-soft badge-category">
                              {emp.category || "N/A"}
                            </span>
                          </td>

                          <td>
                            <span className="badge-soft badge-gender">
                              {emp.gender || "N/A"}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex gap-2 flex-wrap action-group">
                              <button
                                className="btn btn-warning btn-sm action-btn"
                                onClick={() => handleEditClick(emp)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger btn-sm action-btn"
                                onClick={() => handleDelete(emp.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mobile-view">
              {filteredEmployees.length === 0 ? (
                <div className="empty-box">
                  <h5>No employees found</h5>
                  <p className="text-muted mb-0">
                    Try changing the search or filters.
                  </p>
                </div>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <div key={emp.id} className="mobile-employee-card">
                    <div className="mobile-top">
                      <div className="avatar">{getInitials(emp.name)}</div>
                      <div className="mobile-top-text">
                        <div className="mobile-name">{emp.name}</div>
                        <div className="mobile-sub">{emp.email || "No email"}</div>
                      </div>
                    </div>

                    <div className="mobile-grid">
                      <div className="mobile-field">
                        <small>No</small>
                        <strong>{index + 1}</strong>
                      </div>

                      <div className="mobile-field">
                        <small>Employee ID</small>
                        <strong>{emp.employee_id || "N/A"}</strong>
                      </div>

                      <div className="mobile-field">
                        <small>Department</small>
                        <strong>{emp.dept || "N/A"}</strong>
                      </div>

                      <div className="mobile-field">
                        <small>Job Title</small>
                        <strong>{emp.job_title || "N/A"}</strong>
                      </div>

                      <div className="mobile-field">
                        <small>Start Date</small>
                        <strong>{formatDate(emp.start_date)}</strong>
                      </div>

                      <div className="mobile-field">
                        <small>Category</small>
                        <strong>{emp.category || "N/A"}</strong>
                      </div>

                      <div className="mobile-field">
                        <small>Gender</small>
                        <strong>{emp.gender || "N/A"}</strong>
                      </div>
                    </div>

                    <div className="mobile-action-row">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEditClick(emp)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showModal && editEmployee && (
        <div className="modal-backdrop-custom">
          <div className="edit-modal">
            <h4>Edit Employee</h4>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmployee.employee_id || ""}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      employee_id: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Enter employee ID"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmployee.name || ""}
                  onChange={(e) =>
                    setEditEmployee({ ...editEmployee, name: e.target.value })
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmployee.dept || ""}
                  onChange={(e) =>
                    setEditEmployee({ ...editEmployee, dept: e.target.value })
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmployee.job_title || ""}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      job_title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editEmployee.start_date || ""}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      start_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmployee.category || ""}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      category: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={editEmployee.gender || ""}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      gender: e.target.value,
                    })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Actions</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmployee.actions || ""}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      actions: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditEmployee(null);
                }}
              >
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleUpdate}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
