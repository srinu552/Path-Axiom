import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <h4 className="mb-3">Page Not Found</h4>
        <p className="text-muted mb-4">
          Sorry, the page you’re looking for doesn’t exist.
        </p>

        <button
          className="btn btn-primary px-4"
          onClick={() => navigate("/")}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
