import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "../SmallComponents/Header";

const css = `
  .es-root {
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 35%, #e0f2fe 65%, #f0f9ff 100%);
    position: relative;
    overflow-x: hidden;
    padding-bottom: 48px;
  }

  .es-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    animation: esFloat 10s ease-in-out infinite;
  }

  .es-b1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #93c5fd55, #3b82f645);
    filter: blur(90px);
    top: -150px;
    left: -120px;
    animation-delay: 0s;
  }

  .es-b2 {
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, #bfdbfe50, #60a5fa40);
    filter: blur(80px);
    bottom: -100px;
    right: -80px;
    animation-delay: 3.5s;
  }

  @keyframes esFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-18px); }
  }

  .es-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 16px 0;
  }

  .es-page-header {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.8);
    border-radius: 22px;
    padding: 26px 32px;
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    gap: 18px;
    box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 2px 0 rgba(255,255,255,0.9) inset;
    animation: esIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes esIn {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to { opacity: 1; transform: none; }
  }

  .es-avatar {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    flex-shrink: 0;
    background: linear-gradient(140deg,#1e3a8a,#2563eb 60%,#38bdf8);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(37,99,235,0.35);
  }

  .es-page-title {
    font-size: 22px;
    font-weight: 700;
    color: #1e3a8a;
    letter-spacing: -0.4px;
    margin: 0 0 3px;
  }

  .es-page-sub {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }

  .es-card {
    background: rgba(255,255,255,0.58);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.8);
    border-radius: 22px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(59,130,246,0.09), 0 2px 0 rgba(255,255,255,0.9) inset;
    animation: esIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  .es-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
  }

  @media (max-width: 960px) {
    .es-layout {
      grid-template-columns: 1fr;
    }
  }

  .es-list-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 12px;
  }

  .es-slip-item {
    border: 1.5px solid rgba(226,232,240,0.7);
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s, border-color 0.2s;
    background: rgba(255,255,255,0.6);
  }

  .es-slip-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(59,130,246,0.12);
  }

  .es-slip-item.active {
    border-color: #3b82f6;
    background: rgba(239,246,255,0.75);
  }

  .es-slip-month {
    font-size: 14px;
    font-weight: 700;
    color: #1e3a8a;
    margin: 0 0 4px;
  }

  .es-slip-id {
    font-size: 12px;
    color: #64748b;
    margin: 0 0 4px;
  }

  .es-slip-name {
    font-size: 12px;
    color: #334155;
    margin: 0 0 6px;
    font-weight: 600;
  }

  .es-slip-net {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .es-preview {
    background: #fff;
    border: 1.5px solid rgba(226,232,240,0.7);
    border-radius: 18px;
    padding: 28px;
  }

  .es-company {
    text-align: center;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(226,232,240,0.9);
  }

  .es-company-title {
    font-size: 22px;
    font-weight: 800;
    color: #1e3a8a;
    margin: 0 0 6px;
  }

  .es-company-sub {
    font-size: 12px;
    color: #64748b;
    margin: 0;
  }

  .es-badge {
    display: inline-block;
    margin-top: 10px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(37,99,235,0.10);
    color: #1d4ed8;
    border: 1px solid rgba(147,197,253,0.6);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .es-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 20px;
  }

  @media (max-width: 700px) {
    .es-info-grid {
      grid-template-columns: 1fr;
    }
  }

  .es-info-box {
    background: rgba(248,250,252,0.9);
    border: 1px solid rgba(226,232,240,0.7);
    border-radius: 12px;
    padding: 14px;
  }

  .es-info-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 7px;
    gap: 8px;
  }

  .es-info-row:last-child {
    margin-bottom: 0;
  }

  .es-info-label {
    color: #64748b;
    font-weight: 500;
    flex-shrink: 0;
  }

  .es-info-val {
    color: #0f172a;
    font-weight: 600;
    text-align: right;
    word-break: break-word;
  }

  .es-hr {
    height: 1px;
    background: rgba(226,232,240,0.7);
    margin: 20px 0;
  }

  .es-earnings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  @media (max-width: 700px) {
    .es-earnings-grid {
      grid-template-columns: 1fr;
    }
  }

  .es-section-head {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .es-line {
    display: flex;
    justify-content: space-between;
    font-size: 13.5px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(226,232,240,0.5);
    gap: 8px;
  }

  .es-line:last-child {
    border-bottom: none;
  }

  .es-line-label {
    color: #475569;
  }

  .es-line-val {
    color: #0f172a;
    font-weight: 500;
    text-align: right;
  }

  .es-line-strong .es-line-label,
  .es-line-strong .es-line-val {
    font-weight: 700;
    color: #0f172a;
    font-size: 14px;
  }

  .es-extra-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
    margin-bottom: 20px;
  }

  @media (max-width: 900px) {
    .es-extra-grid {
      grid-template-columns: 1fr;
    }
  }

  .es-mini-card {
    background: rgba(248,250,252,0.9);
    border: 1px solid rgba(226,232,240,0.7);
    border-radius: 14px;
    padding: 14px;
  }

  .es-mini-title {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
    font-weight: 700;
  }

  .es-mini-value {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
  }

  .es-net-box {
    background: linear-gradient(135deg,#1e3a8a,#2563eb 70%);
    border-radius: 14px;
    padding: 16px 24px;
    text-align: center;
    margin-top: 4px;
  }

  .es-net-label {
    font-size: 12px;
    color: rgba(255,255,255,0.75);
    font-weight: 500;
    margin-bottom: 2px;
  }

  .es-net-amount {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.5px;
  }

  .es-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 20px;
  }

  .es-btn {
    flex: 1;
    min-width: 140px;
    padding: 12px 20px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.14s, box-shadow 0.2s;
  }

  .es-btn:hover {
    transform: translateY(-1.5px);
  }

  .es-btn-pdf {
    background: linear-gradient(135deg,#1e3a8a,#2563eb);
    color: #fff;
    box-shadow: 0 4px 16px rgba(37,99,235,0.28);
  }

  .es-btn-print {
    background: rgba(15,23,42,0.06);
    color: #0f172a;
    border: 1.5px solid rgba(203,213,225,0.8);
  }

  .es-btn-pdf:hover {
    box-shadow: 0 8px 24px rgba(37,99,235,0.36);
  }

  .es-btn-print:hover {
    background: rgba(15,23,42,0.10);
  }

  .es-alert {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13.5px;
    font-weight: 500;
    margin-bottom: 16px;
  }

  .es-alert-info {
    background: rgba(219,234,254,0.7);
    color: #1d4ed8;
    border: 1px solid rgba(147,197,253,0.5);
  }

  .es-alert-danger {
    background: rgba(254,226,226,0.7);
    color: #b91c1c;
    border: 1px solid rgba(252,165,165,0.5);
  }

  .es-alert-warning {
    background: rgba(254,243,199,0.7);
    color: #b45309;
    border: 1px solid rgba(253,230,138,0.5);
  }

  @media print {
    body * {
      visibility: hidden;
    }

    .es-preview, .es-preview * {
      visibility: visible;
    }

    .es-preview {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      border: none;
      border-radius: 0;
      box-shadow: none;
      padding: 20px;
    }
  }
`;

export default function EmployeeSalary() {
  const [salaryData, setSalaryData] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const slipRef = useRef();

  const getVal = (obj, ...keys) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
  };

  const normalizeSlip = (slip = {}) => {
    const annualGross = Number(getVal(slip, "annual_gross", "annualGross") || 0);
    const annualTaxableIncome = Number(getVal(slip, "annual_taxable_income", "annualTaxableIncome") || 0);
    const annualTax = Number(getVal(slip, "annual_tax", "annualTax") || 0);
    const employerPf = Number(getVal(slip, "employer_pf", "employerPf") || 0);
    const employerEsi = Number(getVal(slip, "employer_esi", "employerEsi") || 0);

    return {
      id: getVal(slip, "id") || Math.random().toString(36).slice(2),
      employee_id: getVal(slip, "employee_id", "employeeId"),
      name: getVal(slip, "name", "full_name", "employee_name", "employeeName"),
      email: getVal(slip, "email"),
      designation: getVal(slip, "designation", "job_title", "jobTitle"),
      department: getVal(slip, "department", "dept"),
      month: getVal(slip, "month"),
      basic: Number(getVal(slip, "basic") || 0),
      hra: Number(getVal(slip, "hra") || 0),
      conveyance: Number(getVal(slip, "conveyance") || 0),
      bonus: Number(getVal(slip, "bonus") || 0),
      gross_salary: Number(getVal(slip, "gross_salary", "grossSalary") || 0),
      pf: Number(getVal(slip, "pf") || 0),
      esi: Number(getVal(slip, "esi") || 0),
      ptax: Number(getVal(slip, "ptax") || 0),
      tds: Number(getVal(slip, "tds") || 0),
      total_deductions: Number(getVal(slip, "total_deductions", "totalDeductions") || 0),
      net_salary: Number(getVal(slip, "net_salary", "netSalary") || 0),
      annual_gross: annualGross,
      annual_taxable_income: annualTaxableIncome,
      annual_tax: annualTax,
      employer_pf: employerPf,
      employer_esi: employerEsi,
      standard_deduction: 75000,
    };
  };

  useEffect(() => {
    const fetchMySlips = async () => {
      try {
        const token = localStorage.getItem("employeeToken");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payroll/my-slips`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.status === 401) {
          localStorage.removeItem("employeeToken");
          localStorage.removeItem("employeeUser");
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          setMessage(data.message || "Failed to load salary slips");
          setLoading(false);
          return;
        }

        const slips = Array.isArray(data) ? data.map(normalizeSlip) : [];
        setSalaryData(slips);
        if (slips.length > 0) setSelectedSlip(slips[0]);
      } catch (error) {
        setMessage("Server error while fetching salary slips");
      } finally {
        setLoading(false);
      }
    };

    fetchMySlips();
  }, []);

  const employeeUser = JSON.parse(localStorage.getItem("employeeUser") || "{}");

  const displayEmployeeName =
    selectedSlip?.name ||
    selectedSlip?.full_name ||
    selectedSlip?.employee_name ||
    employeeUser?.name ||
    employeeUser?.full_name ||
    "—";

  const fmt = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const downloadPDF = async () => {
    if (!slipRef.current || !selectedSlip) return;

    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 8;
    const printableWidth = pdfWidth - margin * 2;
    const printableHeight = pdfHeight - margin * 2;

    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= printableHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= printableHeight;
    }

    pdf.save(`SalarySlip_${selectedSlip.employee_id}_${selectedSlip.month}.pdf`);
  };

  return (
    <>
      <style>{css}</style>
      <Header />

      <div className="es-root">
        <div className="es-blob es-b1" />
        <div className="es-blob es-b2" />

        <div className="es-inner">
          <div className="es-page-header">
            <div className="es-avatar">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <p className="es-page-title">My Salary Slips</p>
              <p className="es-page-sub">View and download your full payroll records</p>
            </div>
          </div>

          {loading && <div className="es-alert es-alert-info">Loading salary slips...</div>}
          {message && <div className="es-alert es-alert-danger">{message}</div>}
          {!loading && salaryData.length === 0 && !message && (
            <div className="es-alert es-alert-warning">No salary slips available.</div>
          )}

          {!loading && salaryData.length > 0 && (
            <div className="es-layout">
              <div className="es-card" style={{ animationDelay: "0.08s", alignSelf: "start" }}>
                <p className="es-list-title">Available Slips</p>

                {salaryData.map((slip) => (
                  <div
                    key={slip.id}
                    className={`es-slip-item${selectedSlip?.id === slip.id ? " active" : ""}`}
                    onClick={() => setSelectedSlip(slip)}
                  >
                    <p className="es-slip-month">{slip.month || "Salary Slip"}</p>
                    <p className="es-slip-id">ID: {slip.employee_id || "—"}</p>
                    <p className="es-slip-name">{slip.name || employeeUser?.name || "Employee"}</p>
                    <p className="es-slip-net">{fmt(slip.net_salary)}</p>
                  </div>
                ))}
              </div>

              {selectedSlip && (
                <div className="es-card" style={{ animationDelay: "0.14s" }}>
                  <div ref={slipRef} className="es-preview">
                    <div className="es-company">
                      <p className="es-company-title">Path Axiom</p>
                      <p className="es-company-sub">Official employee salary statement</p>
                      <span className="es-badge">Salary Slip</span>
                    </div>

                    <div className="es-info-grid">
                      <div className="es-info-box">
                        <div className="es-info-row">
                          <span className="es-info-label">Employee Name</span>
                          <span className="es-info-val">{displayEmployeeName}</span>
                        </div>
                        <div className="es-info-row">
                          <span className="es-info-label">Employee ID</span>
                          <span className="es-info-val">{selectedSlip.employee_id || "—"}</span>
                        </div>
                        <div className="es-info-row">
                          <span className="es-info-label">Email</span>
                          <span className="es-info-val">{selectedSlip.email || employeeUser?.email || "—"}</span>
                        </div>
                        <div className="es-info-row">
                          <span className="es-info-label">Designation</span>
                          <span className="es-info-val">{selectedSlip.designation || employeeUser?.job_title || employeeUser?.designation || "—"}</span>
                        </div>
                      </div>

                      <div className="es-info-box">
                        <div className="es-info-row">
                          <span className="es-info-label">Department</span>
                          <span className="es-info-val">{selectedSlip.department || employeeUser?.dept || employeeUser?.department || "—"}</span>
                        </div>
                        <div className="es-info-row">
                          <span className="es-info-label">Month</span>
                          <span className="es-info-val">{selectedSlip.month || "—"}</span>
                        </div>
                        <div className="es-info-row">
                          <span className="es-info-label">Annual Gross</span>
                          <span className="es-info-val">{fmt(selectedSlip.annual_gross)}</span>
                        </div>
                        <div className="es-info-row">
                          <span className="es-info-label">Annual Taxable Income</span>
                          <span className="es-info-val">{fmt(selectedSlip.annual_taxable_income)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="es-hr" />

                    <div className="es-earnings-grid">
                      <div>
                        <p className="es-section-head">Earnings</p>

                        {[
                          ["Basic Salary", selectedSlip.basic],
                          ["HRA", selectedSlip.hra],
                          ["Conveyance", selectedSlip.conveyance],
                          ["Bonus / Allowance", selectedSlip.bonus],
                        ].map(([label, value]) => (
                          <div className="es-line" key={label}>
                            <span className="es-line-label">{label}</span>
                            <span className="es-line-val">{fmt(value)}</span>
                          </div>
                        ))}

                        <div className="es-line es-line-strong">
                          <span className="es-line-label">Gross Salary</span>
                          <span className="es-line-val">{fmt(selectedSlip.gross_salary)}</span>
                        </div>
                      </div>

                      <div>
                        <p className="es-section-head">Deductions</p>

                        {[
                          ["Provident Fund", selectedSlip.pf],
                          ["ESI", selectedSlip.esi],
                          ["Professional Tax", selectedSlip.ptax],
                          ["TDS", selectedSlip.tds],
                        ].map(([label, value]) => (
                          <div className="es-line" key={label}>
                            <span className="es-line-label">{label}</span>
                            <span className="es-line-val">{fmt(value)}</span>
                          </div>
                        ))}

                        <div className="es-line es-line-strong">
                          <span className="es-line-label">Total Deductions</span>
                          <span className="es-line-val">{fmt(selectedSlip.total_deductions)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="es-extra-grid">
                      <div className="es-mini-card">
                        <div className="es-mini-title">Standard Deduction</div>
                        <div className="es-mini-value">{fmt(selectedSlip.standard_deduction)}</div>
                      </div>

                      <div className="es-mini-card">
                        <div className="es-mini-title">Annual Tax</div>
                        <div className="es-mini-value">{fmt(selectedSlip.annual_tax)}</div>
                      </div>

                      <div className="es-mini-card">
                        <div className="es-mini-title">Employer PF + ESI</div>
                        <div className="es-mini-value">
                          {fmt((selectedSlip.employer_pf || 0) + (selectedSlip.employer_esi || 0))}
                        </div>
                      </div>
                    </div>

                    <div className="es-net-box">
                      <div className="es-net-label">Net Take-Home Salary</div>
                      <div className="es-net-amount">{fmt(selectedSlip.net_salary)}</div>
                    </div>
                  </div>

                  <div className="es-actions">
                    <button className="es-btn es-btn-pdf" onClick={downloadPDF}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M14 2v6h6M12 18v-6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Download PDF
                    </button>

                    <button className="es-btn es-btn-print" onClick={() => window.print()}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
