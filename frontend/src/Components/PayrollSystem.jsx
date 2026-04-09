import React, { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PayrollSystem({ selectedEmployee }) {
  const slipRef = useRef();

  const [form, setForm] = useState({
    employeeId: "", name: "", email: "", designation: "",
    department: "", month: "", basic: "", hra: "", conveyance: "", bonus: "",
  });
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [employeeMessage, setEmployeeMessage] = useState("");

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const toNumber = (value) => { const n = Number(value); return Number.isFinite(n) ? n : 0; };

  const fetchEmployeeDetails = async (employeeId, preservePayrollFields = true) => {
    try {
      const id = employeeId?.trim();
      if (!id) { setEmployeeMessage(""); setForm((p) => ({ ...p, employeeId: "", name: "", email: "", designation: "", department: "" })); return; }
      setLoadingEmployee(true); setEmployeeMessage("");
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) { setEmployeeMessage("Admin token missing. Please login again."); return; }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payroll/employee-details/${id}`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` } });
      const data = await res.json();
      if (!res.ok) { setForm((p) => ({ ...p, name: "", email: "", designation: "", department: "" })); setEmployeeMessage(data.message || "Employee not found"); return; }
      setForm((p) => ({ ...(preservePayrollFields ? p : {}), ...p, employeeId: data.employee_id || id, name: data.name || "", email: data.email || "", designation: data.job_title || data.designation || "", department: data.dept || data.department || "" }));
      setEmployeeMessage("Employee details fetched successfully ✅");
    } catch { setEmployeeMessage("Server error while fetching employee details"); }
    finally { setLoadingEmployee(false); }
  };

  useEffect(() => {
    if (selectedEmployee) {
      const nextId = selectedEmployee.employee_id || "";
      setForm((p) => ({ ...p, employeeId: nextId, name: selectedEmployee.name || selectedEmployee.full_name || "", email: selectedEmployee.email || "", designation: selectedEmployee.job_title || selectedEmployee.designation || "", department: selectedEmployee.dept || selectedEmployee.department || "" }));
      if (nextId) fetchEmployeeDetails(nextId, true);
      else setEmployeeMessage("Employee selected successfully ✅");
    }
  }, [selectedEmployee]);

  const payroll = useMemo(() => {
    const basic = toNumber(form.basic), hra = toNumber(form.hra), conveyance = toNumber(form.conveyance), bonus = toNumber(form.bonus);
    const monthlyGross = basic + hra + conveyance + bonus;
    const annualGross = monthlyGross * 12;
    const employeePf = basic * 0.12, employerPf = basic * 0.12;
    const employeeEsi = monthlyGross <= 21000 ? monthlyGross * 0.0075 : 0;
    const employerEsi = monthlyGross <= 21000 ? monthlyGross * 0.0325 : 0;
    let professionalTax = monthlyGross <= 15000 ? 0 : monthlyGross <= 20000 ? 150 : 200;
    const standardDeduction = 75000;
    const annualTaxableIncome = Math.max(annualGross - standardDeduction, 0);
    const slabTax = (income) => {
      let tax = 0;
      if (income > 400000) tax += Math.max(Math.min(income, 800000) - 400000, 0) * 0.05;
      if (income > 800000) tax += Math.max(Math.min(income, 1200000) - 800000, 0) * 0.1;
      if (income > 1200000) tax += Math.max(Math.min(income, 1600000) - 1200000, 0) * 0.15;
      if (income > 1600000) tax += Math.max(Math.min(income, 2000000) - 1600000, 0) * 0.2;
      if (income > 2000000) tax += Math.max(Math.min(income, 2400000) - 2000000, 0) * 0.25;
      if (income > 2400000) tax += (income - 2400000) * 0.3;
      return tax;
    };
    let annualIncomeTax = annualTaxableIncome <= 1200000 ? 0 : slabTax(annualTaxableIncome);
    const cess = annualIncomeTax * 0.04, totalAnnualTax = annualIncomeTax + cess, monthlyTds = totalAnnualTax / 12;
    const monthlyEmployeeDeductions = employeePf + employeeEsi + professionalTax + monthlyTds;
    const netSalary = monthlyGross - monthlyEmployeeDeductions;
    return { basic, hra, conveyance, bonus, monthlyGross, annualGross, employeePf, employerPf, employeeEsi, employerEsi, professionalTax, standardDeduction, annualTaxableIncome, annualIncomeTax, cess, totalAnnualTax, monthlyTds, monthlyEmployeeDeductions, netSalary, annualNetSalary: netSalary * 12 };
  }, [form]);

  const savePayroll = async () => {
    if (!form.employeeId?.trim()) { alert("Employee ID is required"); return; }
    if (!form.month?.trim()) { alert("Month is required"); return; }
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payroll/create`, { method: "POST", headers: { "Content-Type": "application/json", ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) }, body: JSON.stringify({ employeeId: form.employeeId.trim().toUpperCase(), name: form.name, email: form.email, designation: form.designation, department: form.department, month: form.month, basic: payroll.basic, hra: payroll.hra, conveyance: payroll.conveyance, bonus: payroll.bonus, grossSalary: payroll.monthlyGross, pf: payroll.employeePf, esi: payroll.employeeEsi, ptax: payroll.professionalTax, tds: payroll.monthlyTds, totalDeductions: payroll.monthlyEmployeeDeductions, netSalary: payroll.netSalary, annualGross: payroll.annualGross, annualTaxableIncome: payroll.annualTaxableIncome, annualTax: payroll.totalAnnualTax, employerPf: payroll.employerPf, employerEsi: payroll.employerEsi }) });
      const data = await res.json();
      if (res.ok) alert("Payroll Saved Successfully ✅");
      else alert(data.message || "Error saving payroll");
    } catch { alert("Server Error"); }
  };

  const downloadPDF = async () => {
    if (!slipRef.current) return;
    const canvas = await html2canvas(slipRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190, imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`SalarySlip_${form.employeeId || "Employee"}.pdf`);
  };

  const fmt = (n) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <style>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pr-wrap {
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          background:transparent;
          padding: 36px 24px 60px;
          overflow-x: hidden;
        }

        /* Soft blobs */
        .pr-blob {
          position: fixed; border-radius: 50%;
          pointer-events: none; z-index: 0;
          filter: blur(80px); opacity: 0.55;
        }
        .pr-blob-1 { width:500px;height:500px;background:transparent;top:-100px;left:-100px;animation:pb 16s ease-in-out infinite alternate; }
        .pr-blob-2 { width:420px;height:420px;background:transparent;top:40%;right:-80px;animation:pb 20s ease-in-out infinite alternate-reverse; }
        .pr-blob-3 { width:360px;height:360px;background:transparent;bottom:0;left:25%;animation:pb 13s ease-in-out infinite alternate; }
        @keyframes pb { from{transform:translate(0,0);} to{transform:translate(24px,16px) scale(1.06);} }

        .pr-content { position:relative; z-index:2; max-width:1200px; margin:0 auto; }

        /* Glass card */
        .g-card {
          background:transparent;
          backdrop-filter: blur(24px) saturate(1.8);
          -webkit-backdrop-filter: blur(24px) saturate(1.8);
        }

        /* Header */
        .pr-header {
          text-align: center;
          padding: 36px 36px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.6);
        }
        .pr-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          color: #6366f1; margin-bottom: 8px;
        }
        .pr-title {
          font-size: 30px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px;
        }
        .pr-subtitle { font-size: 13px; color: #6b7280; margin-top: 6px; font-weight: 400; }

        /* Section wrapper */
        .pr-body { padding: 28px 32px; }

        /* Section title */
        .sec-title {
          font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          color: #6366f1; margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
        }
        .sec-title::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,rgba(99,102,241,0.2),transparent); }

        /* Inner glass panel */
        .g-panel {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.95);
        }

        /* Input fields */
        .pr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        @media(max-width:900px) { .pr-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:560px) { .pr-grid { grid-template-columns: 1fr; } }

        .pr-field label {
          display: block; font-size: 12px; font-weight: 600; color: #4b5563; margin-bottom: 6px; letter-spacing: 0.04em;
        }
        .pr-input {
          width: 100%; padding: 11px 14px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(209,213,219,0.8);
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; color: #1f2937;
          outline: none;
          transition: all 0.18s;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.04);
        }
        .pr-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1), inset 0 1px 3px rgba(0,0,0,0.04);
        }
        .pr-input[readonly] { background: rgba(249,250,251,0.6); color: #6b7280; cursor: default; }
        .pr-input::placeholder { color: #9ca3af; }

        /* Fetch button */
        .pr-fetch-btn {
          width: 100%; padding: 12px 18px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13.5px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 18px rgba(99,102,241,0.35);
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .pr-fetch-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(99,102,241,0.45); }
        .pr-fetch-btn:active { transform: translateY(0); }

        /* Status message */
        .pr-msg {
          padding: 11px 16px; border-radius: 12px; font-size: 13px; font-weight: 500;
          margin-bottom: 20px;
        }
        .pr-msg-info { background: rgba(219,234,254,0.7); color: #1d4ed8; border: 1px solid rgba(147,197,253,0.6); }
        .pr-msg-ok   { background: rgba(209,250,229,0.7); color: #065f46; border: 1px solid rgba(110,231,183,0.5); }
        .pr-msg-err  { background: rgba(254,226,226,0.7); color: #991b1b; border: 1px solid rgba(252,165,165,0.5); }

        /* Two-column layout */
        .pr-two { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media(max-width:768px) { .pr-two { grid-template-columns:1fr; } }

        /* Earning rows */
        .earn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media(max-width:480px) { .earn-grid { grid-template-columns:1fr; } }

        /* Mini stat */
        .mini-stat {
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 14px; padding: 16px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(99,102,241,0.06);
        }
        .mini-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
        .mini-stat-value { font-size: 19px; font-weight: 800; color: #1e1b4b; }
        .mini-stat-sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }

        /* Deduction rows */
        .ded-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid rgba(229,231,235,0.6);
          font-size: 13.5px; color: #374151;
        }
        .ded-row:last-child { border-bottom: none; }
        .ded-row strong { color: #1e1b4b; font-weight: 700; }
        .ded-row-total { padding: 12px 0 0; }
        .ded-row-total span { font-size: 14px; font-weight: 700; color: #1e1b4b; }
        .ded-row-total strong { font-size: 15px; color: #dc2626; }

        /* Summary bar */
        .pr-summary {
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(93, 93, 93, 0.1));
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 18px; padding: 24px 28px;
          display: grid; grid-template-columns: repeat(3,1fr); gap: 16px;
          margin-bottom: 28px;
          backdrop-filter: blur(14px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 20px rgba(99,102,241,0.1);
        }
        @media(max-width:600px) { .pr-summary { grid-template-columns:1fr; } }
        .sum-item {}
        .sum-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6366f1; margin-bottom: 4px; }
        .sum-value { font-size: 22px; font-weight: 800; color: #1e1b4b; }

        /* Salary slip */
        .slip-wrap {
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 20px; padding: 32px;
          margin-bottom: 28px;
          box-shadow: 0 4px 24px rgba(99,102,241,0.08);
        }
        .slip-header {
          text-align: center; margin-bottom: 24px;
          padding-bottom: 20px; border-bottom: 2px solid rgba(99,102,241,0.15);
        }
        .slip-company { font-size: 20px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.3px; }
        .slip-subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .slip-tag {
          display: inline-block; margin-top: 10px; padding: 4px 16px;
          background: rgba(99,102,241,0.1); color: #4f46e5;
          border: 1px solid rgba(99,102,241,0.25); border-radius: 999px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
        }

        .slip-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 24px; }
        @media(max-width:500px) { .slip-meta { grid-template-columns:1fr; } }
        .slip-meta-item { font-size: 13px; color: #374151; }
        .slip-meta-item span { color: #6b7280; margin-right: 6px; }

        .slip-divider { border: none; border-top: 1px solid rgba(209,213,219,0.7); margin: 18px 0; }

        .slip-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
        @media(max-width:500px) { .slip-cols { grid-template-columns:1fr; } }
        .slip-col-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #6366f1; margin-bottom: 12px; }
        .slip-line { display:flex; justify-content:space-between; font-size:13.5px; color:#374151; padding:5px 0; border-bottom:1px dashed rgba(209,213,219,0.5); }
        .slip-line:last-child { border-bottom:none; font-weight:700; color:#1e1b4b; }

        .slip-net {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; border-radius: 14px; padding: 16px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .slip-net-label { font-size: 14px; font-weight: 600; opacity: 0.85; }
        .slip-net-value { font-size: 22px; font-weight: 800; }

        /* Action buttons */
        .pr-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; padding-bottom: 4px; }

        .pr-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 13px 28px; border-radius: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; border: none;
          transition: all 0.2s; white-space: nowrap;
        }
        .pr-btn:hover { transform: translateY(-2px); }
        .pr-btn-save {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 18px rgba(99,102,241,0.35);
        }
        .pr-btn-save:hover { box-shadow: 0 6px 24px rgba(99,102,241,0.45); }
        .pr-btn-pdf {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          box-shadow: 0 4px 18px rgba(16,185,129,0.3);
        }
        .pr-btn-pdf:hover { box-shadow: 0 6px 24px rgba(16,185,129,0.4); }
        .pr-btn-print {
          background: rgba(255,255,255,0.65);
          color: #374151;
          border: 1px solid rgba(209,213,219,0.8);
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .pr-btn-print:hover { background: rgba(255,255,255,0.9); }

        @media print { .pr-blob, .pr-actions { display:none; } .pr-wrap { background:#fff; padding:0; } }
      `}</style>

      <div className="pr-wrap">
        <div className="pr-blob pr-blob-1" />
        <div className="pr-blob pr-blob-2" />
        <div className="pr-blob pr-blob-3" />

        <div className="pr-content">
          <div className="g-card">

            {/* Header */}
            <div className="pr-header">
              <div className="pr-title">Payroll Management</div>
              <div className="pr-subtitle">Generate, compute and export employee salary slips</div>
            </div>

            <div className="pr-body">

              {/* Employee Info */}
              <div className="sec-title">Employee Information</div>
              <div className="g-panel" style={{ marginBottom: 24 }}>
                <div className="pr-grid">
                  <div className="pr-field">
                    <label>Employee ID</label>
                    <input className="pr-input" value={form.employeeId}
                      onChange={e => handleChange("employeeId", e.target.value.toUpperCase())}
                      onBlur={() => fetchEmployeeDetails(form.employeeId)}
                      placeholder="e.g. EMP001" />
                  </div>
                  <div className="pr-field">
                    <label>Employee Name</label>
                    <input className="pr-input" value={form.name} readOnly placeholder="Auto-filled" />
                  </div>
                  <div className="pr-field">
                    <label>Email Address</label>
                    <input className="pr-input" value={form.email} readOnly placeholder="Auto-filled" />
                  </div>
                  <div className="pr-field">
                    <label>Designation</label>
                    <input className="pr-input" value={form.designation} readOnly placeholder="Auto-filled" />
                  </div>
                  <div className="pr-field">
                    <label>Department</label>
                    <input className="pr-input" value={form.department} readOnly placeholder="Auto-filled" />
                  </div>
                  <div className="pr-field">
                    <label>Salary Month</label>
                    <input className="pr-input" value={form.month}
                      onChange={e => handleChange("month", e.target.value)}
                      placeholder="e.g. June 2025" />
                  </div>
                  <div className="pr-field" style={{ alignSelf: "flex-end" }}>
                    <button className="pr-fetch-btn" onClick={() => fetchEmployeeDetails(form.employeeId)}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M14 8A6 6 0 1 1 8 2a6 6 0 0 1 4.243 1.757L14 2v4h-4l1.5-1.5A4 4 0 1 0 12 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Fetch Details
                    </button>
                  </div>
                </div>

                {loadingEmployee && <div className="pr-msg pr-msg-info">⏳ Fetching employee details…</div>}
                {!loadingEmployee && employeeMessage && (
                  <div className={`pr-msg ${employeeMessage.includes("✅") ? "pr-msg-ok" : employeeMessage.includes("Error") || employeeMessage.includes("not found") ? "pr-msg-err" : "pr-msg-info"}`}>
                    {employeeMessage}
                  </div>
                )}
              </div>

              {/* Earnings + Deductions */}
              <div className="sec-title">Salary Computation</div>
              <div className="pr-two">

                {/* Earnings */}
                <div className="g-panel">
                  <div style={{ fontSize:13, fontWeight:700, color:"#1e1b4b", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ background:"rgba(16,185,129,0.12)", color:"#059669", padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Earnings</span>
                  </div>
                  <div className="earn-grid">
                    {[{key:"basic",label:"Basic Salary"},{key:"hra",label:"HRA"},{key:"conveyance",label:"Conveyance"},{key:"bonus",label:"Bonus / Allowance"}].map(f => (
                      <div className="pr-field" key={f.key}>
                        <label>{f.label}</label>
                        <input type="number" min="0" className="pr-input" value={form[f.key]}
                          onChange={e => handleChange(f.key, e.target.value)} placeholder="₹ 0" />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:18 }}>
                    <div className="mini-stat">
                      <div className="mini-stat-label">Monthly Gross</div>
                      <div className="mini-stat-value">{fmt(payroll.monthlyGross)}</div>
                    </div>
                    <div className="mini-stat">
                      <div className="mini-stat-label">Annual Gross</div>
                      <div className="mini-stat-value" style={{ fontSize:16 }}>{fmt(payroll.annualGross)}</div>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="g-panel">
                  <div style={{ marginBottom:16 }}>
                    <span style={{ background:"rgba(239,68,68,0.1)", color:"#dc2626", padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Deductions & Tax</span>
                  </div>
                  {[
                    ["Employee PF (12% Basic)", payroll.employeePf],
                    ["Employee ESI", payroll.employeeEsi],
                    ["Professional Tax", payroll.professionalTax],
                    ["Annual Taxable Income", payroll.annualTaxableIncome],
                    ["Annual Income Tax", payroll.annualIncomeTax],
                    ["4% Education Cess", payroll.cess],
                    ["Monthly TDS", payroll.monthlyTds],
                  ].map(([label, val]) => (
                    <div className="ded-row" key={label}>
                      <span>{label}</span>
                      <strong>{fmt(val)}</strong>
                    </div>
                  ))}
                  <div className="ded-row ded-row-total">
                    <span style={{ fontWeight:700, fontSize:14, color:"#1e1b4b" }}>Total Monthly Deductions</span>
                    <strong style={{ color:"#dc2626", fontSize:15 }}>{fmt(payroll.monthlyEmployeeDeductions)}</strong>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="pr-summary">
                <div className="sum-item">
                  <div className="sum-label">Monthly Net Salary</div>
                  <div className="sum-value">{fmt(payroll.netSalary)}</div>
                </div>
                <div className="sum-item">
                  <div className="sum-label">Annual Net Salary</div>
                  <div className="sum-value" style={{ fontSize:18 }}>{fmt(payroll.annualNetSalary)}</div>
                </div>
                <div className="sum-item">
                  <div className="sum-label">Employer Cost (PF+ESI)</div>
                  <div className="sum-value" style={{ fontSize:18 }}>{fmt(payroll.employerPf + payroll.employerEsi)}</div>
                </div>
              </div>

              {/* Salary Slip */}
              <div className="sec-title">Official Salary Slip</div>
              <div ref={slipRef} className="slip-wrap">
                <div className="slip-header">
                  <div className="slip-company">Path Axiom</div>
                  <div className="slip-subtitle"></div>
                  <div className="slip-tag">Salary Slip</div>
                </div>

                <div className="slip-meta">
                  {[
                    ["Employee ID", form.employeeId || "—"],
                    ["Month", form.month || "—"],
                    ["Employee Name", form.name || "—"],
                    ["Department", form.department || "—"],
                    ["Email", form.email || "—"],
                    ["Designation", form.designation || "—"],
                    ["Standard Deduction", fmt(payroll.standardDeduction)],
                    ["Annual Taxable Income", fmt(payroll.annualTaxableIncome)],
                  ].map(([k, v]) => (
                    <div className="slip-meta-item" key={k}><span>{k}:</span><strong>{v}</strong></div>
                  ))}
                </div>

                <hr className="slip-divider" />

                <div className="slip-cols">
                  <div>
                    <div className="slip-col-title">Earnings</div>
                    {[["Basic Salary", payroll.basic],["HRA", payroll.hra],["Conveyance", payroll.conveyance],["Bonus / Allowance", payroll.bonus]].map(([l,v]) => (
                      <div className="slip-line" key={l}><span>{l}</span><span>{fmt(v)}</span></div>
                    ))}
                    <div className="slip-line"><span>Gross Salary</span><span>{fmt(payroll.monthlyGross)}</span></div>
                  </div>
                  <div>
                    <div className="slip-col-title">Deductions</div>
                    {[["Provident Fund", payroll.employeePf],["ESI", payroll.employeeEsi],["Professional Tax", payroll.professionalTax],["TDS", payroll.monthlyTds]].map(([l,v]) => (
                      <div className="slip-line" key={l}><span>{l}</span><span>{fmt(v)}</span></div>
                    ))}
                    <div className="slip-line"><span>Total Deductions</span><span>{fmt(payroll.monthlyEmployeeDeductions)}</span></div>
                  </div>
                </div>

                <div className="slip-net">
                  <span className="slip-net-label">💰 Net Take-Home Salary</span>
                  <span className="slip-net-value">{fmt(payroll.netSalary)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pr-actions">
                <button className="pr-btn pr-btn-save" onClick={savePayroll}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Save Payroll
                </button>
                <button className="pr-btn pr-btn-pdf" onClick={downloadPDF}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14 2v6h6M12 18v-6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Download PDF
                </button>
                <button className="pr-btn pr-btn-print" onClick={() => window.print()}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Print
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
