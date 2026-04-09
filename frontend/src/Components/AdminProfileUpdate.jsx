import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FIELDS = [
  { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe", icon: "👤" },
  { name: "email", label: "Email Address", type: "email", placeholder: "john@company.com", icon: "✉️" },
  { name: "phone", label: "Phone Number", type: "text", placeholder: "+1 (555) 000-0000", icon: "📱" },
  { name: "department", label: "Department", type: "text", placeholder: "Engineering", icon: "🏢" },
  { name: "designation", label: "Designation", type: "text", placeholder: "Senior Manager", icon: "🎯" },
];

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminUpdateProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", department: "", designation: "", role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", msg }
  const [focusedField, setFocusedField] = useState(null);

  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) { showToast("error", data.message || "Failed to fetch profile"); return; }
        setFormData({
          fullName: data.fullName || "", email: data.email || "",
          phone: data.phone || "", department: data.department || "",
          designation: data.designation || "", role: data.role || "",
        });
      } catch {
        showToast("error", "Server error while fetching profile");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
    else { showToast("error", "No token found. Please login again."); setLoading(false); }
  }, [token]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fullName: formData.fullName, email: formData.email,
          phone: formData.phone, department: formData.department,
          designation: formData.designation,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast("error", data.message || "Failed to update profile"); return; }
      showToast("success", "Profile updated successfully!");
      setFormData({
        fullName: data.profile.fullName || "", email: data.profile.email || "",
        phone: data.profile.phone || "", department: data.profile.department || "",
        designation: data.profile.designation || "", role: data.profile.role || formData.role,
      });
    } catch {
      showToast("error", "Server error while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const isHR = formData.role?.toLowerCase() === "hr";

  if (loading) return (
    <div style={s.loadWrap}>
      <div style={s.spinner} />
      <p style={s.loadText}>Loading profile…</p>
      <style>{spinnerCSS}</style>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, ...(toast.type === "success" ? s.toastSuccess : s.toastError) }}
          className="toast-slide">
          <span style={s.toastIcon}>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      {/* Sidebar accent strip */}
      <div style={s.accentStrip} />

      <div style={s.shell}>
        {/* Breadcrumb */}
        <nav style={s.breadcrumb}>
          <span style={s.breadLink} onClick={() => navigate("/admindashboard")}>Dashboard</span>
          <span style={s.breadSep}>›</span>
          <span style={s.breadCurrent}>Profile</span>
        </nav>

        <div style={s.layout}>
          {/* ── Left panel ── */}
          <aside style={s.sidebar}>
            <div style={s.avatarRing}>
              <div style={s.avatar}>{getInitials(formData.fullName)}</div>
            </div>
            <p style={s.avatarName}>{formData.fullName || "Your Name"}</p>
            <span style={s.badge}>{isHR ? "HR" : "Admin"}</span>

            <div style={s.metaList}>
              {[
                { label: "Department", val: formData.department },
                { label: "Designation", val: formData.designation },
                { label: "Role", val: formData.role },
              ].map(({ label, val }) => (
                <div key={label} style={s.metaItem}>
                  <span style={s.metaLabel}>{label}</span>
                  <span style={s.metaVal}>{val || "—"}</span>
                </div>
              ))}
            </div>

            <div style={s.sidebarDivider} />
            <p style={s.sidebarNote}>
              Your role cannot be changed here. Contact a super-admin for role modifications.
            </p>
          </aside>

          {/* ── Main form ── */}
          <main style={s.main}>
            <div style={s.mainHeader}>
              <h1 style={s.heading}>{isHR ? "HR Profile" : "Admin Profile"}</h1>
              <p style={s.subHeading}>Keep your information up to date</p>
            </div>

            <form onSubmit={handleUpdate} style={s.form}>
              <div style={s.grid}>
                {FIELDS.map(({ name, label, type, placeholder, icon }) => {
                  const isFocused = focusedField === name;
                  const hasValue = !!formData[name];
                  return (
                    <div key={name} style={s.fieldWrap} className="field-wrap">
                      <label style={{ ...s.floatLabel, ...(isFocused || hasValue ? s.floatLabelUp : {}) }}>
                        <span style={s.labelIcon}>{icon}</span> {label}
                      </label>
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(name)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={isFocused ? placeholder : ""}
                        style={{ ...s.input, ...(isFocused ? s.inputFocused : {}) }}
                        className="profile-input"
                      />
                      <span style={{ ...s.underline, ...(isFocused ? s.underlineActive : {}) }} />
                    </div>
                  );
                })}

                {/* Role — read-only */}
                <div style={s.fieldWrap}>
                  <label style={{ ...s.floatLabel, ...s.floatLabelUp }}>
                    <span style={s.labelIcon}>🔒</span> Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    readOnly
                    style={{ ...s.input, ...s.inputReadOnly }}
                  />
                  <span style={s.underline} />
                </div>
              </div>

              <div style={s.actions}>
                <button type="button" style={s.cancelBtn}
                  onClick={() => navigate("/admindashboard")}>
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn} disabled={saving} className="save-btn">
                  {saving ? (
                    <span style={s.savingInner}>
                      <span style={s.btnSpinner} className="btn-spin" /> Updating…
                    </span>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const NAVY = "#0f172a";
const BLUE = "#3b82f6";
const BLUE_DARK = "#1d4ed8";
const SLATE = "#64748b";
const BORDER = "#e2e8f0";

const s = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  accentStrip: {
    position: "fixed",
    top: 0, left: 0,
    width: "4px",
    height: "100%",
    background: `linear-gradient(180deg, ${BLUE} 0%, #6366f1 100%)`,
    zIndex: 10,
  },
  shell: {
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "36px 28px 60px 36px",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "32px",
    fontSize: "13px",
  },
  breadLink: {
    color: BLUE,
    cursor: "pointer",
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
  breadSep: { color: "#94a3b8" },
  breadCurrent: { color: NAVY, fontWeight: 600 },

  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: "28px",
    alignItems: "start",
  },

  /* Sidebar */
  sidebar: {
    background: "#fff",
    borderRadius: "20px",
    padding: "32px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "sticky",
    top: "24px",
  },
  avatarRing: {
    padding: "4px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${BLUE}, #6366f1)`,
    marginBottom: "16px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: NAVY,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "-1px",
    border: "3px solid #fff",
  },
  avatarName: {
    fontWeight: 700,
    fontSize: "16px",
    color: NAVY,
    margin: "0 0 8px",
    letterSpacing: "-0.3px",
  },
  badge: {
    display: "inline-block",
    background: "#eff6ff",
    color: BLUE,
    border: `1px solid #bfdbfe`,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "3px 10px",
    borderRadius: "999px",
    textTransform: "uppercase",
    marginBottom: "28px",
  },
  metaList: { width: "100%", display: "flex", flexDirection: "column", gap: "12px" },
  metaItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    background: "#f8fafc",
    borderRadius: "10px",
  },
  metaLabel: { fontSize: "11px", fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em" },
  metaVal: { fontSize: "13px", fontWeight: 600, color: NAVY, maxWidth: "110px", textAlign: "right", wordBreak: "break-word" },
  sidebarDivider: { width: "100%", height: "1px", background: BORDER, margin: "22px 0 16px" },
  sidebarNote: { fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.6, margin: 0 },

  /* Main */
  main: {
    background: "#fff",
    borderRadius: "20px",
    padding: "36px 40px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)",
  },
  mainHeader: { marginBottom: "32px" },
  heading: {
    margin: "0 0 6px",
    fontSize: "26px",
    fontWeight: 800,
    color: NAVY,
    letterSpacing: "-0.6px",
  },
  subHeading: { margin: 0, fontSize: "14px", color: SLATE },
  form: { width: "100%" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px 28px",
    marginBottom: "36px",
  },

  /* Floating label inputs */
  fieldWrap: { position: "relative", paddingTop: "20px" },
  floatLabel: {
    position: "absolute",
    top: "34px",
    left: "2px",
    fontSize: "14px",
    color: SLATE,
    transition: "all 0.2s ease",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  floatLabelUp: {
    top: "2px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: BLUE,
  },
  labelIcon: { fontSize: "12px" },
  input: {
    width: "100%",
    padding: "10px 2px 8px",
    border: "none",
    borderBottom: `2px solid ${BORDER}`,
    borderRadius: 0,
    outline: "none",
    fontSize: "15px",
    fontWeight: 500,
    color: NAVY,
    background: "transparent",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  inputFocused: { borderBottomColor: "transparent" },
  inputReadOnly: {
    color: SLATE,
    cursor: "not-allowed",
    borderBottomStyle: "dashed",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "2px",
    width: "0%",
    background: `linear-gradient(90deg, ${BLUE}, #6366f1)`,
    transition: "width 0.3s ease",
    borderRadius: "2px",
    display: "block",
  },
  underlineActive: { width: "100%" },

  /* Buttons */
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "8px",
    borderTop: `1px solid ${BORDER}`,
  },
  cancelBtn: {
    padding: "11px 22px",
    borderRadius: "12px",
    border: `1.5px solid ${BORDER}`,
    background: "transparent",
    color: SLATE,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  saveBtn: {
    padding: "11px 28px",
    borderRadius: "12px",
    border: "none",
    background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)`,
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: `0 4px 14px rgba(59,130,246,0.4)`,
    transition: "all 0.2s",
    letterSpacing: "0.02em",
  },
  savingInner: { display: "flex", alignItems: "center", gap: "8px" },
  btnSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
  },

  /* Toast */
  toast: {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 999,
    padding: "14px 20px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    fontFamily: "'DM Sans', sans-serif",
  },
  toastSuccess: { background: "#f0fdf4", color: "#166534", border: "1.5px solid #bbf7d0" },
  toastError: { background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fecaca" },
  toastIcon: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 900,
    flexShrink: 0,
    background: "currentColor",
    color: "#fff",
  },

  /* Loader */
  loadWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    gap: "16px",
    fontFamily: "'DM Sans', sans-serif",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTopColor: BLUE,
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loadText: { color: SLATE, fontSize: "15px", fontWeight: 500, margin: 0 },
};

const spinnerCSS = `
@keyframes spin { to { transform: rotate(360deg); } }
`;

const css = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes toast-in { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
.toast-slide { animation: toast-in 0.3s ease forwards; }
.btn-spin { animation: spin 0.7s linear infinite; }
.save-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59,130,246,0.5) !important;
}
.save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.profile-input:focus { outline: none; }
@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr !important; }
  .grid { grid-template-columns: 1fr !important; }
}
`;
