import React, { useEffect, useState } from "react";
import Header from "../SmallComponents/Header";
import { useParams } from "react-router-dom";

export default function LeaveView() {
  const { id } = useParams();
  const [leave, setLeave] = useState(null);

  useEffect(() => {
    fetchLeave();
  }, []);

  const fetchLeave = async () => {
    try {
      const token =
        localStorage.getItem("employeeToken") ||
        localStorage.getItem("adminToken");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/my/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setLeave(data);
      }
    } catch (error) {
      console.log("FETCH SINGLE LEAVE ERROR:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <>
      <Header />
      <div className="container py-4">
        <div className="card shadow border-0 rounded-4 p-4">
          <h3 className="mb-3">Leave Details</h3>

          {!leave ? (
            <p>Loading...</p>
          ) : (
            <>
              <p><strong>Name:</strong> {leave.name}</p>
              <p><strong>Type:</strong> {leave.leave_type}</p>
              <p><strong>Reason:</strong> {leave.reason}</p>
              <p><strong>Start Date:</strong> {formatDate(leave.start_date)}</p>
              <p><strong>End Date:</strong> {formatDate(leave.end_date)}</p>
              <p><strong>Duration:</strong> {leave.duration} day(s)</p>
              <p><strong>Status:</strong> {leave.status}</p>
              <p><strong>Admin Remark:</strong> {leave.admin_remark || "No remark"}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}