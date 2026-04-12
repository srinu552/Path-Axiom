import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.73 1.88-3.41 3.32-4.82"/>
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.8 11.8 0 0 1-1.67 2.68"/>
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
      <path d="M1 1l22 22"/>
    </svg>
  ) : (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

const Field = ({ id, label, error, children }) => (
  <div className="field-group">
    <label className="field-label" htmlFor={id}>{label}</label>
    {children}
    {error && <div className="field-error" role="alert">⚠ {error}</div>}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", dept: "", jobTitle: "", startDate: "", category: "",
    gender: "", actions: "", email: "", phone: "",
    password: "", confirmPassword: "", agree: false,
  });
  const [errors, setErrors]               = useState({});
  const [loading, setLoading]             = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [toast, setToast]                 = useState(null); // { type: 'success'|'error', msg }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                          e.name            = "Name is required";
    if (!form.dept.trim())                          e.dept            = "Department is required";
    if (!form.jobTitle.trim())                      e.jobTitle        = "Job title is required";
    if (!form.startDate)                            e.startDate       = "Start date required";
    if (!form.category.trim())                      e.category        = "Category required";
    if (!form.gender.trim())                        e.gender          = "Gender required";
    if (!form.actions.trim())                       e.actions         = "Actions required";
    if (!/^\S+@\S+\.\S+$/.test(form.email))        e.email           = "Valid email required";
    if (!/^[0-9]{10}$/.test(form.phone))            e.phone           = "Enter 10-digit phone number";
    if (form.password.length < 6)                   e.password        = "Minimum 6 characters";
    if (form.password !== form.confirmPassword)     e.confirmPassword = "Passwords do not match";
    if (!form.agree)                                e.agree           = "You must accept terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ type: "success", msg: "Registration submitted. Wait for admin approval before login." });
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setToast({ type: "error", msg: data.message || "Registration failed" });
      }
    } catch {
      setToast({ type: "error", msg: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const cls = (base, err) => `${base}${err ? " has-error" : ""}`;

  return (
    <main className="reg-root">
      <div className="reg-card">

        <div className="reg-logo-wrap">
          <div className="reg-logo-circle" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
        </div>

        <h1 className="reg-title">Create Account</h1>
        <p className="reg-subtitle">Register your employee profile for admin review</p>

        {toast && (
          <div className={`reg-toast ${toast.type}`} role="alert">{toast.msg}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Personal Info */}
          <div className="section-label" aria-hidden="true">
            <span className="section-label-text">Personal Info</span>
            <div className="section-line" />
          </div>
          <div className="reg-grid">
            <Field id="reg-name" label="Full Name" error={errors.name}>
              <input id="reg-name" name="name" className={cls("g-input", errors.name)}
                placeholder="John Doe" onChange={handleChange} autoComplete="name" />
            </Field>
            <Field id="reg-gender" label="Gender" error={errors.gender}>
              <div className="select-wrap">
                <select id="reg-gender" name="gender"
                  className={cls("g-select", errors.gender)} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </Field>
          </div>

          {/* Work Details */}
          <div className="section-label" aria-hidden="true">
            <span className="section-label-text">Work Details</span>
            <div className="section-line" />
          </div>
          <div className="reg-grid">
            <Field id="reg-dept" label="Department" error={errors.dept}>
              <input id="reg-dept" name="dept" className={cls("g-input", errors.dept)}
                placeholder="e.g. Engineering" onChange={handleChange} />
            </Field>
            <Field id="reg-jobTitle" label="Job Title" error={errors.jobTitle}>
              <input id="reg-jobTitle" name="jobTitle" className={cls("g-input", errors.jobTitle)}
                placeholder="e.g. Software Engineer" onChange={handleChange} />
            </Field>
            <Field id="reg-startDate" label="Start Date" error={errors.startDate}>
              <input id="reg-startDate" type="date" name="startDate"
                className={cls("g-input", errors.startDate)} onChange={handleChange} />
            </Field>
            <Field id="reg-category" label="Category" error={errors.category}>
              <input id="reg-category" name="category" className={cls("g-input", errors.category)}
                placeholder="e.g. Full-time" onChange={handleChange} />
            </Field>
          </div>
          <div className="reg-grid single">
            <Field id="reg-actions" label="Actions" error={errors.actions}>
              <input id="reg-actions" name="actions" className={cls("g-input", errors.actions)}
                placeholder="Describe your role actions" onChange={handleChange} />
            </Field>
          </div>

          {/* Contact */}
          <div className="section-label" aria-hidden="true">
            <span className="section-label-text">Contact</span>
            <div className="section-line" />
          </div>
          <div className="reg-grid">
            <Field id="reg-email" label="Email Address" error={errors.email}>
              <input id="reg-email" name="email" type="email"
                className={cls("g-input", errors.email)}
                placeholder="you@company.com" onChange={handleChange} autoComplete="email" />
            </Field>
            <Field id="reg-phone" label="Phone Number" error={errors.phone}>
              <input id="reg-phone" name="phone" type="tel"
                className={cls("g-input", errors.phone)}
                placeholder="10-digit number" onChange={handleChange} autoComplete="tel" />
            </Field>
          </div>

          {/* Security */}
          <div className="section-label" aria-hidden="true">
            <span className="section-label-text">Security</span>
            <div className="section-line" />
          </div>
          <div className="reg-grid">
            <Field id="reg-password" label="Password" error={errors.password}>
              <div className="pw-wrap">
                <input id="reg-password" type={showPassword ? "text" : "password"}
                  name="password" className={cls("g-input", errors.password)}
                  placeholder="Min. 6 characters" onChange={handleChange}
                  autoComplete="new-password" />
                <button type="button" className="pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </Field>
            <Field id="reg-confirmPassword" label="Confirm Password" error={errors.confirmPassword}>
              <div className="pw-wrap">
                <input id="reg-confirmPassword" type={showConfirm ? "text" : "password"}
                  name="confirmPassword" className={cls("g-input", errors.confirmPassword)}
                  placeholder="Re-enter password" onChange={handleChange}
                  autoComplete="new-password" />
                <button type="button" className="pw-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </Field>
          </div>

          {/* Terms */}
          <div className="check-row">
            <input id="reg-agree" type="checkbox" name="agree"
              className="g-checkbox" onChange={handleChange} />
            <label htmlFor="reg-agree" className="check-text">
              I agree to the <span className="check-link">Terms of Service</span> &amp;{" "}
              <span className="check-link">Privacy Policy</span>
            </label>
          </div>
          {errors.agree && (
            <div className="field-error" role="alert" style={{ marginBottom: 10 }}>
              ⚠ {errors.agree}
            </div>
          )}

          <div className="reg-divider" />

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting…" : "Create Account"}
          </button>
        </form>

        <div className="reg-footer">
          Already have an account?{" "}
          <button className="link" onClick={() => navigate("/login")}>Sign In</button>
        </div>
      </div>
    </main>
  );
}