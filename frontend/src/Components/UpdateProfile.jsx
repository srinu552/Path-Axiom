import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Asset injection (fonts + styles) — idempotent, runs once globally ────────
let assetsInjected = false;
function injectAssets() {
  if (assetsInjected || typeof document === "undefined") return;
  assetsInjected = true;



  const style = document.createElement("style");
  style.id = "up-global-styles";
  style.textContent = `
    :root {
      --navy:       #0d1f3c;
      --navy-mid:   #1a3358;
      --ivory:      #f9f7f3;
      --ivory-dark: #f0ece3;
      --ink:        #1c1c1e;
      --muted:      #6b7280;
      --border:     #ddd8ce;
      --accent:     #c9933a;
      --success:    #166534;
      --success-bg: #dcfce7;
      --success-bd: #86efac;
      --error:      #991b1b;
      --error-bg:   #fee2e2;
      --error-bd:   #fca5a5;
      --font-d: 'Playfair Display', Georgia, serif;
      --font-b: 'DM Sans', system-ui, sans-serif;
    }
    .up-root * { box-sizing: border-box; margin: 0; padding: 0; }
    .up-root {
      font-family: var(--font-b);
      background: var(--ivory);
      min-height: 100vh;
      color: var(--ink);
    }

    /* Layout */
    .up-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      max-width: 1280px;
      margin: 0 auto;
      min-height: 100vh;
    }

    /* Sidebar */
    .up-sidebar {
      background: var(--navy);
      padding: 48px 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      scrollbar-width: none;
    }
    .up-sidebar::-webkit-scrollbar { display: none; }
    .up-sidebar-brand {
      padding: 0 28px 36px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 24px;
    }
    .up-sidebar-brand h2 {
      font-family: var(--font-d);
      color: #fff;
      font-size: 18px;
      letter-spacing: -0.3px;
      line-height: 1.3;
    }
    .up-sidebar-brand p {
      color: rgba(255,255,255,0.4);
      font-size: 12px;
      margin-top: 4px;
      font-weight: 300;
    }
    .up-nav-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 28px;
      cursor: pointer;
      border: none;
      background: transparent;
      border-left: 3px solid transparent;
      text-align: left;
      width: 100%;
      transition: background 0.2s, border-color 0.2s;
    }
    .up-nav-btn:hover { background: rgba(255,255,255,0.06); }
    .up-nav-btn.active {
      background: rgba(201,147,58,0.15);
      border-left-color: var(--accent);
    }
    .up-nav-num {
      width: 22px; height: 22px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.45);
      font-size: 10px;
      font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s, color 0.2s;
    }
    .up-nav-btn.active .up-nav-num { background: var(--accent); color: #fff; }
    .up-nav-label {
      font-size: 13px;
      font-weight: 400;
      color: rgba(255,255,255,0.5);
      transition: color 0.2s;
    }
    .up-nav-btn:hover .up-nav-label,
    .up-nav-btn.active .up-nav-label { color: #fff; }

    /* Main */
    .up-main { padding: 48px 52px 80px; }
    .up-page-header {
      margin-bottom: 48px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--border);
    }
    .up-badge {
      display: inline-block;
      background: var(--navy);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.8px;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 14px;
      text-transform: uppercase;
    }
    .up-page-header h1 {
      font-family: var(--font-d);
      font-size: 40px;
      color: var(--navy);
      letter-spacing: -1px;
      line-height: 1.15;
    }
    .up-page-header p {
      color: var(--muted);
      font-size: 14px;
      margin-top: 8px;
      font-weight: 300;
    }

    /* Sections */
    .up-section { margin-bottom: 52px; scroll-margin-top: 32px; }
    .up-section-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
    }
    .up-sec-num {
      font-family: var(--font-d);
      font-size: 12px;
      color: var(--accent);
      font-weight: 600;
      letter-spacing: 1.5px;
      flex-shrink: 0;
    }
    .up-sec-title {
      font-family: var(--font-d);
      font-size: 22px;
      color: var(--navy);
      letter-spacing: -0.3px;
      white-space: nowrap;
    }
    .up-sec-rule { flex: 1; height: 1px; background: var(--border); }

    /* Grids */
    .up-g2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px 28px; }
    .up-g3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px 28px; }
    .up-full { grid-column: 1 / -1; }

    /* Fields */
    .up-field { display: flex; flex-direction: column; gap: 7px; }
    .up-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--navy-mid);
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .up-input, .up-select {
      width: 100%;
      padding: 11px 14px;
      background: #fff;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      font-family: var(--font-b);
      font-size: 14px;
      color: var(--ink);
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
      appearance: none;
      -webkit-appearance: none;
    }
    .up-input:hover:not(:focus), .up-select:hover:not(:focus) { border-color: #b8b0a4; }
    .up-input:focus, .up-select:focus {
      border-color: var(--navy);
      box-shadow: 0 0 0 3px rgba(13,31,60,0.08);
    }
    .up-input::placeholder { color: #bbb4aa; }
    .up-sel-wrap { position: relative; }
    .up-sel-wrap::after {
      content: "▾";
      position: absolute;
      right: 14px; top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      pointer-events: none;
      font-size: 12px;
    }

    /* Alert */
    .up-alert {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 28px;
      animation: up-slide-in 0.25s ease;
    }
    .up-alert.success { background: var(--success-bg); color: var(--success); border: 1px solid var(--success-bd); }
    .up-alert.error   { background: var(--error-bg);   color: var(--error);   border: 1px solid var(--error-bd); }
    @keyframes up-slide-in {
      from { opacity:0; transform: translateY(-6px); }
      to   { opacity:1; transform: translateY(0); }
    }

    /* Footer */
    .up-footer {
      position: sticky;
      bottom: 0;
      background: rgba(249,247,243,0.94);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-top: 1px solid var(--border);
      padding: 16px 0;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }
    .up-btn-primary {
      background: var(--navy);
      color: #fff;
      border: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-family: var(--font-b);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s, transform 0.15s, box-shadow 0.15s;
    }
    .up-btn-primary:hover:not(:disabled) {
      background: var(--navy-mid);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(13,31,60,0.22);
    }
    .up-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .up-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .up-btn-secondary {
      background: transparent;
      color: var(--navy);
      border: 1.5px solid var(--border);
      padding: 12px 24px;
      border-radius: 8px;
      font-family: var(--font-b);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.18s, border-color 0.18s;
    }
    .up-btn-secondary:hover { background: var(--ivory-dark); border-color: #b0aaa0; }
    .up-saving-text { font-size: 13px; color: var(--muted); font-style: italic; }

    /* Loading */
    .up-loading-screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--ivory);
      gap: 16px;
    }
    .up-spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--border);
      border-top-color: var(--navy);
      border-radius: 50%;
      animation: up-spin 0.7s linear infinite;
    }
    @keyframes up-spin { to { transform: rotate(360deg); } }
    .up-loading-text { color: var(--muted); font-size: 14px; }

    /* Responsive */
    @media (max-width: 860px) {
      .up-layout { grid-template-columns: 1fr; }
      .up-sidebar { display: none; }
      .up-main { padding: 28px 20px 80px; }
      .up-g2, .up-g3 { grid-template-columns: 1fr; }
      .up-full { grid-column: auto; }
      .up-page-header h1 { font-size: 30px; }
    }
    @media (max-width: 480px) {
      .up-main { padding: 20px 16px 80px; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Static data ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "personal",  label: "Personal Details"  },
  { id: "contact",   label: "Contact Details"   },
  { id: "kin",       label: "Next of Kin"        },
  { id: "education", label: "Education"          },
  { id: "guarantor", label: "Guarantor"          },
  { id: "family",    label: "Family Details"     },
  { id: "job",       label: "Job Details"        },
  { id: "financial", label: "Financial Details"  },
];

const INITIAL_FORM = {
  full_name: "", dob: "", gender: "", marital_status: "", nationality: "",
  email: "", phone: "", alternate_phone: "", address: "", city: "", state: "", pincode: "",
  kin_name: "", kin_relationship: "", kin_phone: "", kin_address: "",
  qualification: "", institution: "", year_of_passing: "",
  guarantor_name: "", guarantor_phone: "", guarantor_address: "",
  father_name: "", mother_name: "", spouse_name: "", children_count: "",
  employee_id: "", department: "", designation: "", joining_date: "",
  bank_name: "", account_number: "", ifsc_code: "", pan_number: "",
};

// ─── Sub-components — defined at MODULE level to avoid remount on every render ─
// If defined inside the parent, React sees a new component type each render
// and unmounts + remounts every field, destroying focus/input state.

function SectionHead({ num, title }) {
  return (
    <div className="up-section-header">
      <span className="up-sec-num">{String(num).padStart(2, "0")}</span>
      <h3 className="up-sec-title">{title}</h3>
      <div className="up-sec-rule" />
    </div>
  );
}

function Field({ label, name, type = "text", wide, formData, onChange, ...rest }) {
  return (
    <div className={`up-field${wide ? " up-full" : ""}`}>
      <label className="up-label" htmlFor={`f-${name}`}>{label}</label>
      <input
        id={`f-${name}`}
        className="up-input"
        type={type}
        name={name}
        value={formData[name] ?? ""}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        autoComplete="off"
        {...rest}
      />
    </div>
  );
}

function Sel({ label, name, options, formData, onChange }) {
  return (
    <div className="up-field">
      <label className="up-label" htmlFor={`f-${name}`}>{label}</label>
      <div className="up-sel-wrap">
        <select
          id={`f-${name}`}
          className="up-select"
          name={name}
          value={formData[name] ?? ""}
          onChange={onChange}
        >
          {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (v) => (v ? String(v).split("T")[0] : "");
const THIS_YEAR = new Date().getFullYear();

// ─── Main component ───────────────────────────────────────────────────────────
export default function UpdateProfile() {
  injectAssets(); // idempotent — safe to call on every render

  const navigate = useNavigate();

  // Parse localStorage once — stable via useRef, no re-parse on every render
  const employeeUser = useRef(JSON.parse(localStorage.getItem("employeeUser") || "null")).current;
  const token        = useRef(localStorage.getItem("employeeToken")).current;

  const [formData,       setFormData]       = useState(INITIAL_FORM);
  const [loading,        setLoading]        = useState(false);
  const [fetching,       setFetching]       = useState(true);
  const [message,        setMessage]        = useState({ text: "", type: "" });
  const [activeSection,  setActiveSection]  = useState("personal");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch profile once on mount
  useEffect(() => {
    if (!token || !employeeUser?.id) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${employeeUser.id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data) {
          setFormData((prev) => ({
            ...prev, ...data,
            dob:          fmtDate(data.dob),
            joining_date: fmtDate(data.joining_date),
          }));
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setFetching(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll-spy — set up after sections are in the DOM
  useEffect(() => {
    if (fetching) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [fetching]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeUser?.id) return;
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res  = await fetch("${import.meta.env.VITE_API_URL}/api/profile/update", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ user_id: employeeUser.id, ...formData }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "✓  Profile saved successfully!", type: "success" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMessage({ text: data.message || "Failed to update profile.", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error — please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Spread shared props explicitly instead of wrapping in an inline component
  const fp = { formData, onChange: handleChange };

  if (fetching) {
    return (
      <div className="up-root">
        <div className="up-loading-screen">
          <div className="up-spinner" />
          <p className="up-loading-text">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="up-root">
      <div className="up-layout">

        {/* Sidebar */}
        <aside className="up-sidebar" aria-label="Profile sections">
          <div className="up-sidebar-brand">
            <h2>Profile<br />Settings</h2>
            <p>Employee Self-Service</p>
          </div>
          {SECTIONS.map(({ id, label }, i) => (
            <button
              key={id}
              type="button"
              className={`up-nav-btn${activeSection === id ? " active" : ""}`}
              aria-current={activeSection === id ? "step" : undefined}
              onClick={() =>
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              <span className="up-nav-num">{i + 1}</span>
              <span className="up-nav-label">{label}</span>
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="up-main">
          <div className="up-page-header">
            <span className="up-badge">Employee Portal</span>
            <h1>Update Your<br />Profile</h1>
            <p>Keep your information accurate and up to date.</p>
          </div>

          {message.text && (
            <div role="alert" className={`up-alert ${message.type}`}>{message.text}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* 01 Personal */}
            <section className="up-section" id="personal">
              <SectionHead num={1} title="Personal Details" />
              <div className="up-g3">
                <Field {...fp} label="Full Name"      name="full_name"      wide />
                <Field {...fp} label="Date of Birth"  name="dob"            type="date" />
                <Sel   {...fp} label="Gender"         name="gender"
                  options={[["","Select"],["Male","Male"],["Female","Female"],["Other","Other"]]} />
                <Sel   {...fp} label="Marital Status" name="marital_status"
                  options={[["","Select"],["Single","Single"],["Married","Married"],["Divorced","Divorced"],["Widowed","Widowed"]]} />
                <Field {...fp} label="Nationality"    name="nationality" />
              </div>
            </section>

            {/* 02 Contact */}
            <section className="up-section" id="contact">
              <SectionHead num={2} title="Contact Details" />
              <div className="up-g3">
                <Field {...fp} label="Email Address"   name="email"           type="email" wide />
                <Field {...fp} label="Phone Number"    name="phone" />
                <Field {...fp} label="Alternate Phone" name="alternate_phone" />
                <Field {...fp} label="Street Address"  name="address"         wide />
                <Field {...fp} label="City"            name="city" />
                <Field {...fp} label="State"           name="state" />
                <Field {...fp} label="Pincode"         name="pincode" />
              </div>
            </section>

            {/* 03 Next of Kin */}
            <section className="up-section" id="kin">
              <SectionHead num={3} title="Next of Kin" />
              <div className="up-g2">
                <Field {...fp} label="Full Name"    name="kin_name" />
                <Field {...fp} label="Relationship" name="kin_relationship" />
                <Field {...fp} label="Phone Number" name="kin_phone" />
                <Field {...fp} label="Address"      name="kin_address" />
              </div>
            </section>

            {/* 04 Education */}
            <section className="up-section" id="education">
              <SectionHead num={4} title="Education Qualifications" />
              <div className="up-g3">
                <Field {...fp} label="Highest Qualification" name="qualification" />
                <Field {...fp} label="Institution"           name="institution" />
                <Field {...fp} label="Year of Passing"       name="year_of_passing"
                  type="number" min="1950" max={THIS_YEAR} />
              </div>
            </section>

            {/* 05 Guarantor */}
            <section className="up-section" id="guarantor">
              <SectionHead num={5} title="Guarantor Details" />
              <div className="up-g3">
                <Field {...fp} label="Guarantor Name" name="guarantor_name" />
                <Field {...fp} label="Phone Number"   name="guarantor_phone" />
                <Field {...fp} label="Address"        name="guarantor_address" />
              </div>
            </section>

            {/* 06 Family */}
            <section className="up-section" id="family">
              <SectionHead num={6} title="Family Details" />
              <div className="up-g2">
                <Field {...fp} label="Father's Name"      name="father_name" />
                <Field {...fp} label="Mother's Name"      name="mother_name" />
                <Field {...fp} label="Spouse's Name"      name="spouse_name" />
                <Field {...fp} label="Number of Children" name="children_count"
                  type="number" min="0" />
              </div>
            </section>

            {/* 07 Job */}
            <section className="up-section" id="job">
              <SectionHead num={7} title="Job Details" />
              <div className="up-g2">
                <Field {...fp} label="Employee ID"  name="employee_id" />
                <Field {...fp} label="Department"   name="department" />
                <Field {...fp} label="Designation"  name="designation" />
                <Field {...fp} label="Joining Date" name="joining_date" type="date" />
              </div>
            </section>

            {/* 08 Financial */}
            <section className="up-section" id="financial">
              <SectionHead num={8} title="Financial Details" />
              <div className="up-g2">
                <Field {...fp} label="Bank Name"      name="bank_name" />
                <Field {...fp} label="Account Number" name="account_number" />
                <Field {...fp} label="IFSC Code"      name="ifsc_code" />
                <Field {...fp} label="PAN Number"     name="pan_number" />
              </div>
            </section>

            {/* Sticky footer */}
            <div className="up-footer">
              <button type="submit" className="up-btn-primary" disabled={loading}>
                {loading ? "Saving…" : "Save Profile"}
              </button>
              <button type="button" className="up-btn-secondary"
                onClick={() => navigate("/employeedashboard")}>
                ← Back to Dashboard
              </button>
              {loading && <span className="up-saving-text">Saving your changes…</span>}
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}
