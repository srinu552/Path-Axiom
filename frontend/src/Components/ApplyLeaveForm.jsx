import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../SmallComponents/Header";

export default function ApplyLeaveForm() {
  const navigate = useNavigate();
  const { type } = useParams();

  const [form, setForm] = useState({
    leave_type: type || "",
    reason: "",
    start_date: "",
    end_date: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token =
        localStorage.getItem("employeeToken") ||
        localStorage.getItem("adminToken");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to apply leave");
        setLoading(false);
        return;
      }

      alert("Leave applied successfully");
      navigate("/leaveapplication");
    } catch (error) {
      console.log("APPLY LEAVE ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container py-4">
        <div className="card shadow border-0 rounded-4 p-4">
          <h3 className="mb-4">Apply {type} Leave</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Leave Type</label>
              <input
                type="text"
                className="form-control"
                value={form.leave_type}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Reason</label>
              <textarea
                className="form-control"
                rows="4"
                value={form.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Leave Request"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}