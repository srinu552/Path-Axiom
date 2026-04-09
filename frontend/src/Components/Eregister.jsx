import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html, body { scroll-behavior: smooth; }

  .reg-root {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px 20px 60px;
    background: linear-gradient(135deg, #e5e9ee 0%, #e8eaec 40%, #cacdcf 70%, #babec0 100%);
    position: relative;
    overflow-x: hidden;
    font-family: 'DM Sans', sans-serif;
  }

  /* Blobs */
  .r-blob {
    position: fixed; border-radius: 50%;
    filter: blur(80px); opacity: 0.4;
    animation: rfloat 9s ease-in-out infinite;
    pointer-events: none; z-index: 0;
  }
  .r-blob-1 { width:500px;height:500px;background:radial-gradient(circle,#a5b4fc,#818cf8);top:-150px;left:-120px;animation-delay:0s; }
  .r-blob-2 { width:380px;height:380px;background:radial-gradient(circle,#fbcfe8,#f9a8d4);bottom:-100px;right:-80px;animation-delay:3s; }
  .r-blob-3 { width:280px;height:280px;background:radial-gradient(circle,#bfdbfe,#93c5fd);top:50%;left:60%;animation-delay:6s; }
  @keyframes rfloat {
    0%,100% { transform: translateY(0) scale(1); }
    50%      { transform: translateY(-22px) scale(1.04); }
  }

  /* Card */
  .reg-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 800px;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.78); border-radius: 28px;
    padding: 48px 44px 40px;
    box-shadow: 0 8px 40px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.05),
                inset 0 1px 0 rgba(255,255,255,0.9);
    animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(28px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  /* Header */
  .reg-logo-wrap { display:flex; justify-content:center; margin-bottom:10px; }
  .reg-logo-circle {
    width:56px; height:56px; border-radius:16px;
    background: linear-gradient(135deg,#6366f1,#8b5cf6);
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 8px 20px rgba(99,102,241,0.35);
  }
  .reg-logo-circle svg { color:#fff; }
  .reg-title {
    font-family:'Playfair Display',serif; text-align:center;
    font-size:26px; font-weight:700; color:#1e1b4b;
    margin-bottom:4px; letter-spacing:-0.3px;
  }
  .reg-subtitle {
    text-align:center; font-size:13.5px; color:#6b7280;
    margin-bottom:36px; font-weight:400;
  }

  /* Section label */
  .section-label { display:flex; align-items:center; gap:10px; margin-bottom:18px; margin-top:8px; }
  .section-label-text { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#6366f1; white-space:nowrap; }
  .section-line { flex:1; height:1px; background:linear-gradient(to right,rgba(99,102,241,0.3),transparent); }

  /* Grid */
  .reg-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 20px; }
  .reg-grid.single { grid-template-columns:1fr; }

  /* Field */
  .field-group { margin-bottom:20px; }
  .field-label { display:block; font-size:12px; font-weight:700; color:#374151; margin-bottom:7px; letter-spacing:0.06em; text-transform:uppercase; }

  /* Glass inputs */
  .g-input, .g-select {
    width:100%; padding:13px 16px; border-radius:12px;
    border:1.5px solid rgba(255,255,255,0.7);
    background:rgba(255,255,255,0.6); backdrop-filter:blur(8px);
    font-size:14.5px; font-family:'DM Sans',sans-serif; color:#1e1b4b; outline:none;
    transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
    box-shadow:0 2px 8px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
    appearance:none; -webkit-appearance:none;
  }
  .g-input::placeholder { color:#9ca3af; }
  .g-input:focus, .g-select:focus {
    border-color:rgba(99,102,241,0.5); background:rgba(255,255,255,0.85);
    box-shadow:0 0 0 3px rgba(99,102,241,0.12), 0 2px 8px rgba(99,102,241,0.08);
  }
  .g-input.has-error, .g-select.has-error { border-color:rgba(239,68,68,0.5); background:rgba(255,245,245,0.7); }
  .g-input.has-error:focus, .g-select.has-error:focus { box-shadow:0 0 0 3px rgba(239,68,68,0.1); }

  .select-wrap { position:relative; }
  .select-wrap::after {
    content:''; position:absolute; right:14px; top:50%; transform:translateY(-50%);
    width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent;
    border-top:5px solid #6366f1; pointer-events:none;
  }
  .g-select { padding-right:36px; cursor:pointer; }

  .pw-wrap { position:relative; }
  .pw-wrap .g-input { padding-right:48px; }
  .pw-toggle {
    position:absolute; right:13px; top:50%; transform:translateY(-50%);
    background:transparent; border:none; cursor:pointer;
    color:#9ca3af; display:flex; align-items:center; transition:color 0.2s; padding:0;
  }
  .pw-toggle:hover { color:#6366f1; }

  .field-error { font-size:12px; color:#ef4444; margin-top:5px; display:flex; align-items:center; gap:4px; animation:errIn 0.2s ease; }
  @keyframes errIn { from{opacity:0;transform:translateY(-3px);}to{opacity:1;transform:translateY(0);} }

  .check-row { display:flex; align-items:flex-start; gap:10px; margin-bottom:6px; }
  .g-checkbox { width:18px; height:18px; min-width:18px; border-radius:5px; border:1.5px solid rgba(99,102,241,0.4); background:rgba(255,255,255,0.7); cursor:pointer; accent-color:#6366f1; margin-top:2px; }
  .check-text { font-size:13.5px; color:#374151; line-height:1.5; }
  .check-link { color:#6366f1; font-weight:600; cursor:pointer; text-decoration:underline; text-underline-offset:2px; }

  .submit-btn {
    width:100%; padding:14px; border:none; border-radius:12px;
    font-size:15px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer;
    letter-spacing:0.02em; transition:opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    position:relative; overflow:hidden; margin-top:8px;
  }
  .submit-btn.active { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 8px 20px rgba(99,102,241,0.35); }
  .submit-btn.active:hover { opacity:0.92; transform:translateY(-1px); box-shadow:0 12px 28px rgba(99,102,241,0.4); }
  .submit-btn.active:active { transform:translateY(0); }
  .submit-btn.disabled { background:rgba(209,213,219,0.6); color:#6b7280; cursor:not-allowed; }
  .btn-shine { position:absolute; inset:0; background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.25) 50%,transparent 65%); transform:translateX(-100%); transition:transform 0.5s; }
  .submit-btn.active:hover .btn-shine { transform:translateX(100%); }

  .dot-loader { display:inline-flex; gap:4px; align-items:center; }
  .dot-loader span { width:5px; height:5px; background:#9ca3af; border-radius:50%; animation:bounce 1s infinite ease-in-out; }
  .dot-loader span:nth-child(2){animation-delay:0.15s;}
  .dot-loader span:nth-child(3){animation-delay:0.3s;}
  @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }

  .reg-divider { height:1px; background:linear-gradient(to right,transparent,rgba(99,102,241,0.15),transparent); margin:6px 0 20px; }
  .reg-footer { text-align:center; margin-top:20px; font-size:13.5px; color:#6b7280; }
  .reg-footer .link { color:#6366f1; font-weight:600; cursor:pointer; text-decoration:underline; text-underline-offset:2px; }


  /* ═══════════════════════════════════════
     RESPONSIVE BREAKPOINTS
  ═══════════════════════════════════════ */

  /* Large desktop 1200px+ */
  @media (min-width: 1200px) {
    .reg-root   { padding: 48px 24px 72px; }
    .reg-card   { padding: 52px 52px 44px; }
  }

  /* Medium-large 992–1199px */
  @media (max-width: 1199px) and (min-width: 992px) {
    .reg-card   { max-width: 720px; padding: 44px 40px 38px; }
    .reg-title  { font-size: 24px; }
  }

  /* Tablet landscape 768–991px */
  @media (max-width: 991px) and (min-width: 768px) {
    .reg-root      { padding: 32px 20px 56px; }
    .reg-card      { max-width: 680px; padding: 40px 32px 36px; border-radius: 24px; }
    .reg-title     { font-size: 23px; }
    .reg-subtitle  { font-size: 13px; margin-bottom: 28px; }
    .g-input, .g-select { font-size: 14px; padding: 12px 14px; }
  }

  /* Tablet portrait 600–767px */
  @media (max-width: 767px) and (min-width: 600px) {
    .reg-root      { padding: 28px 16px 52px; }
    .reg-card      { padding: 36px 28px 32px; border-radius: 22px; }
    .reg-title     { font-size: 22px; }
    .reg-subtitle  { font-size: 13px; margin-bottom: 24px; }
    .reg-grid      { grid-template-columns: 1fr 1fr; gap: 0 14px; }
    .g-input, .g-select { font-size: 14px; padding: 11px 13px; }
    .reg-logo-circle { width: 50px; height: 50px; }
    .submit-btn    { font-size: 14.5px; padding: 13px; }
  }

  /* Mobile large 480–599px — switch to single column */
  @media (max-width: 599px) and (min-width: 480px) {
    .reg-root      { padding: 24px 14px 48px; }
    .reg-card      { padding: 30px 22px 28px; border-radius: 20px; }
    .reg-grid      { grid-template-columns: 1fr; }
    .reg-title     { font-size: 21px; }
    .reg-subtitle  { font-size: 12.5px; margin-bottom: 22px; }
    .reg-logo-circle { width: 48px; height: 48px; border-radius: 13px; }
    .reg-logo-circle svg { width: 22px; height: 22px; }
    .field-label   { font-size: 11px; }
    .g-input, .g-select { font-size: 14px; padding: 11px 13px; border-radius: 10px; }
    .submit-btn    { font-size: 14px; padding: 12px; border-radius: 10px; }
    .section-label-text { font-size: 10.5px; }
  }

  /* Mobile small — below 479px */
  @media (max-width: 479px) {
    .reg-root      { padding: 20px 12px 44px; }
    .reg-card      { padding: 26px 18px 24px; border-radius: 18px; }
    .reg-grid      { grid-template-columns: 1fr; }
    .reg-title     { font-size: 20px; }
    .reg-subtitle  { font-size: 12px; margin-bottom: 20px; }
    .reg-logo-circle { width: 44px; height: 44px; border-radius: 12px; }
    .reg-logo-circle svg { width: 20px; height: 20px; }
    .field-label   { font-size: 11px; margin-bottom: 6px; }
    .field-group   { margin-bottom: 16px; }
    .g-input, .g-select { font-size: 13.5px; padding: 11px 12px; border-radius: 10px; }
    .submit-btn    { font-size: 14px; padding: 12px; border-radius: 10px; }
    .section-label { margin-bottom: 14px; }
    .section-label-text { font-size: 10px; }
    .check-text    { font-size: 12.5px; }
    .reg-footer    { font-size: 12.5px; }
    .r-blob-1 { width:260px; height:260px; }
    .r-blob-2 { width:200px; height:200px; }
    .r-blob-3 { display: none; }
  }

  /* Very small — below 360px */
  @media (max-width: 359px) {
    .reg-root  { padding: 16px 10px 40px; }
    .reg-card  { padding: 22px 14px 20px; border-radius: 16px; }
    .reg-title { font-size: 18px; }
    .g-input, .g-select { font-size: 13px; padding: 10px 11px; }
  }
`;

const EyeIcon = ({ open }) => (
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.73 1.88-3.41 3.32-4.82"/>
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.8 11.8 0 0 1-1.67 2.68"/>
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
      <path d="M1 1l22 22"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
);

const Field = ({ label, error, children }) => (
  <div className="field-group">
    <label className="field-label">{label}</label>
    {children}
    {error && <div className="field-error">⚠ {error}</div>}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name:"", dept:"", jobTitle:"", startDate:"", category:"",
    gender:"", actions:"", email:"", phone:"",
    password:"", confirmPassword:"", agree: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validate = () => {
    let e = {};
    if (!form.name.trim())       e.name          = "Name is required";
    if (!form.dept.trim())       e.dept          = "Department is required";
    if (!form.jobTitle.trim())   e.jobTitle      = "Job title is required";
    if (!form.startDate)         e.startDate     = "Start date required";
    if (!form.category.trim())   e.category      = "Category required";
    if (!form.gender.trim())     e.gender        = "Gender required";
    if (!form.actions.trim())    e.actions       = "Actions required";
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = "Valid email required";
    if (!form.phone.match(/^[0-9]{10}$/))    e.phone = "Enter 10-digit phone number";
    if (form.password.length < 6)            e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.agree)                         e.agree = "You must accept terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Registration submitted. Wait for admin approval before login.");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch {
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="reg-root">
        <div className="r-blob r-blob-1" />
        <div className="r-blob r-blob-2" />
        <div className="r-blob r-blob-3" />

        <div className="reg-card">
          <div className="reg-logo-wrap">
            <div className="reg-logo-circle">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
          </div>
          <h2 className="reg-title">Create Account</h2>
          <p className="reg-subtitle">Register your employee profile for admin review</p>

          <form onSubmit={handleSubmit}>

            <div className="section-label">
              <span className="section-label-text">Personal Info</span>
              <div className="section-line" />
            </div>
            <div className="reg-grid">
              <Field label="Full Name" error={errors.name}>
                <input name="name" className={`g-input${errors.name?" has-error":""}`}
                  placeholder="John Doe" onChange={handleChange} />
              </Field>
              <Field label="Gender" error={errors.gender}>
                <div className="select-wrap">
                  <select name="gender" className={`g-select${errors.gender?" has-error":""}`} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </Field>
            </div>

            <div className="section-label">
              <span className="section-label-text">Work Details</span>
              <div className="section-line" />
            </div>
            <div className="reg-grid">
              <Field label="Department" error={errors.dept}>
                <input name="dept" className={`g-input${errors.dept?" has-error":""}`}
                  placeholder="e.g. Engineering" onChange={handleChange} />
              </Field>
              <Field label="Job Title" error={errors.jobTitle}>
                <input name="jobTitle" className={`g-input${errors.jobTitle?" has-error":""}`}
                  placeholder="e.g. Software Engineer" onChange={handleChange} />
              </Field>
              <Field label="Start Date" error={errors.startDate}>
                <input type="date" name="startDate"
                  className={`g-input${errors.startDate?" has-error":""}`}
                  onChange={handleChange} />
              </Field>
              <Field label="Category" error={errors.category}>
                <input name="category" className={`g-input${errors.category?" has-error":""}`}
                  placeholder="e.g. Full-time" onChange={handleChange} />
              </Field>
            </div>
            <div className="reg-grid single">
              <Field label="Actions" error={errors.actions}>
                <input name="actions" className={`g-input${errors.actions?" has-error":""}`}
                  placeholder="Describe your role actions" onChange={handleChange} />
              </Field>
            </div>

            <div className="section-label">
              <span className="section-label-text">Contact</span>
              <div className="section-line" />
            </div>
            <div className="reg-grid">
              <Field label="Email Address" error={errors.email}>
                <input name="email" className={`g-input${errors.email?" has-error":""}`}
                  placeholder="you@company.com" onChange={handleChange} />
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                <input name="phone" className={`g-input${errors.phone?" has-error":""}`}
                  placeholder="10-digit number" onChange={handleChange} />
              </Field>
            </div>

            <div className="section-label">
              <span className="section-label-text">Security</span>
              <div className="section-line" />
            </div>
            <div className="reg-grid">
              <Field label="Password" error={errors.password}>
                <div className="pw-wrap">
                  <input type={showPassword?"text":"password"} name="password"
                    className={`g-input${errors.password?" has-error":""}`}
                    placeholder="Min. 6 characters" onChange={handleChange} />
                  <button type="button" className="pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password" error={errors.confirmPassword}>
                <div className="pw-wrap">
                  <input type={showConfirmPassword?"text":"password"} name="confirmPassword"
                    className={`g-input${errors.confirmPassword?" has-error":""}`}
                    placeholder="Re-enter password" onChange={handleChange} />
                  <button type="button" className="pw-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <EyeIcon open={showConfirmPassword} />
                  </button>
                </div>
              </Field>
            </div>

            <div className="check-row">
              <input type="checkbox" name="agree" className="g-checkbox" onChange={handleChange} />
              <span className="check-text">
                I agree to the <span className="check-link">Terms of Service</span> &amp;{" "}
                <span className="check-link">Privacy Policy</span>
              </span>
            </div>
            {errors.agree && <div className="field-error" style={{marginBottom:"10px"}}>⚠ {errors.agree}</div>}

            <div className="reg-divider" />

            <button type="submit" disabled={loading}
              className={`submit-btn ${loading?"disabled":"active"}`}>
              <span className="btn-shine" />
              {loading
                ? <span className="dot-loader"><span/><span/><span/></span>
                : "Create Account"}
            </button>
          </form>

          <div className="reg-footer">
            Already have an account?{" "}
            <span className="link" onClick={() => navigate("/login")}>Sign In</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
