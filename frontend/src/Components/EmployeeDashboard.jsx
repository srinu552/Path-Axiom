import React, { useEffect, useMemo, useState, useCallback } from "react";
import Header from "../SmallComponents/Header";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   ICON COMPONENTS
───────────────────────────────────────────── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const Icons = {
  leave:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  payslip:
    "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  profile:
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  attend:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  appraise:
    "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  review:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  edit:
    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  task:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  announce:
    "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  wallet:
    "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a2 2 0 00-3 3v8a3 3 0 003 3z",
  team:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M16 7a4 4 0 11-8 0 4 4 0 018 0zm6 4a2 2 0 11-4 0 2 2 0 014 0zM6 11a2 2 0 11-4 0 2 2 0 014 0z",
  manager:
    "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
};

const API_BASE = import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [salaryMessage, setSalaryMessage] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [teamInfo, setTeamInfo] = useState({
    team: null,
    manager: null,
    people: [],
  });
  const [teamLoading, setTeamLoading] = useState(false);

  const readThemeState = useCallback(() => {
    try {
      return (
        localStorage.getItem("empDash_theme") === "dark" ||
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark" ||
        document.body.classList.contains("dark") ||
        document.body.classList.contains("dark-mode")
      );
    } catch {
      return false;
    }
  }, []);

  const getPriorityMeta = (priority) => {
    const v = String(priority || "Medium").toLowerCase();
    if (v === "high") return { cls: "p-high", label: "High" };
    if (v === "low") return { cls: "p-low", label: "Low" };
    return { cls: "p-medium", label: "Medium" };
  };

  const getInitials = (value = "") =>
    String(value)
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  const formatMoney = (value) => {
    const num = Number(value || 0);
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN");
  };

  const loadUser = () => {
    try {
      const src = ["employeeUser", "managerUser", "adminUser", "user"]
        .map((k) => localStorage.getItem(k))
        .find(Boolean);

      setLoggedUser(src ? JSON.parse(src) : null);
    } catch {
      setLoggedUser(null);
    }
  };

  const getToken = () =>
    localStorage.getItem("employeeToken") ||
    localStorage.getItem("managerToken") ||
    localStorage.getItem("adminToken");

  const apiFetch = async (url) => {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.ok ? res.json() : null;
  };

  const fetchTasks = async () => {
    try {
      const data = await apiFetch(`${API_BASE}/api/employee-dashboard/my-tasks`);
      setTasks(Array.isArray(data) ? data : Array.isArray(data?.tasks) ? data.tasks : []);
    } catch (error) {
      console.error("TASK FETCH ERROR:", error);
      setTasks([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await apiFetch(`${API_BASE}/api/employee-dashboard/announcements`);
      setAnnouncements(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.announcements)
          ? data.announcements
          : Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error("ANNOUNCEMENT FETCH ERROR:", error);
      setAnnouncements([]);
    }
  };

  const fetchSlips = async () => {
    try {
      const token = getToken();

      if (!token) {
        setSalaryMessage("Please login again");
        setSalaryData([]);
        setSelectedSlip(null);
        return;
      }

      const res = await fetch(`${API_BASE}/api/payroll/my-slips`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setSalaryMessage(data.message || "Failed to load payslips");
        setSalaryData([]);
        setSelectedSlip(null);
        return;
      }

      const slips = Array.isArray(data) ? data : [];
      setSalaryMessage("");
      setSalaryData(slips);
      setSelectedSlip((prev) => {
        if (!slips.length) return null;
        if (!prev) return slips[0];
        return slips.find((row) => row.id === prev.id) || slips[0];
      });
    } catch (error) {
      console.error("PAYSLIP FETCH ERROR:", error);
      setSalaryMessage("Server error");
      setSalaryData([]);
      setSelectedSlip(null);
    }
  };

  const fetchTeamInfo = async () => {
    try {
      setTeamLoading(true);
      const data = await apiFetch(`${API_BASE}/api/employee-dashboard/my-team`);

      setTeamInfo({
        team: data?.team || null,
        manager: data?.manager || null,
        people: Array.isArray(data?.people) ? data.people : [],
      });
    } catch (error) {
      console.error("TEAM FETCH ERROR:", error);
      setTeamInfo({
        team: null,
        manager: null,
        people: [],
      });
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    setDark(readThemeState());
    fetchTasks();
    fetchAnnouncements();
    fetchSlips();
    fetchTeamInfo();
    setTimeout(() => setMounted(true), 60);
  }, [readThemeState]);

  useEffect(() => {
    const syncTheme = () => setDark(readThemeState());

    syncTheme();

    const interval = setInterval(syncTheme, 800);
    window.addEventListener("storage", syncTheme);
    window.addEventListener("focus", syncTheme);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("focus", syncTheme);
    };
  }, [readThemeState]);

  useEffect(() => {
    const refreshTeam = () => fetchTeamInfo();

    const handleVisibility = () => {
      if (!document.hidden) refreshTeam();
    };

    const interval = setInterval(refreshTeam, 15000);

    window.addEventListener("focus", refreshTeam);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshTeam);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const normalizedRole = String(loggedUser?.role || "").toLowerCase();
  const isManager = normalizedRole === "manager";

  const quickActions = useMemo(() => {
    const base = [
      { label: "Apply Leave", path: "/leaveapplication", icon: Icons.leave },
      { label: "View Payslip", path: "/employeepayroll", icon: Icons.payslip },
      { label: "Update Profile", path: "/update", icon: Icons.profile },
      { label: "Attendance", path: "/employeeattendance", icon: Icons.attend },
      { label: "Appraisal", path: "/employeeappraisal", icon: Icons.appraise },
    ];

    if (isManager) {
      base.push({
        label: "Review Employees",
        path: "/managerreview",
        icon: Icons.review,
      });
    }

    return base;
  }, [isManager]);

  const payRows = [
    ["Basic Wage", "basic", "PF", "pf"],
    ["HRA", "hra", "ESI", "esi"],
    ["Conveyance", "conveyance", "Prof. Tax", "ptax"],
    ["Bonus", "bonus", "TDS", "tds"],
  ];

  const css = `
    .emp-dash {
      --font: 'Plus Jakarta Sans', sans-serif;
      --mono: 'JetBrains Mono', monospace;

      --bg: #eef1f8;
      --orb-a: rgba(99,102,241,.13);
      --orb-b: rgba(14,165,233,.10);
      --orb-c: rgba(168,85,247,.08);

      --g-bg: rgba(255,255,255,.68);
      --g-border: rgba(255,255,255,.92);
      --g-rim: rgba(255,255,255,.95);
      --g-inner: rgba(255,255,255,.42);
      --g-shadow: 0 8px 32px rgba(15,23,42,.08), 0 1.5px 3px rgba(15,23,42,.04);
      --g-hover: 0 20px 56px rgba(15,23,42,.13), 0 2px 4px rgba(15,23,42,.06);
      --noise: .028;

      --txt: #0f172a;
      --txt2: #475569;
      --txt3: #94a3b8;

      --accent: #4f46e5;
      --accent2: #0ea5e9;
      --grad: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);
      --asoft: rgba(79,70,229,.08);
      --aborder: rgba(79,70,229,.18);
      --divider: rgba(148,163,184,.16);
      --row-h: rgba(238,242,255,.55);
      --net-bg: rgba(79,70,229,.07);
      --net-fg: #4338ca;
      --chip-bg: rgba(79,70,229,.09);
      --chip-fg: #4f46e5;

      --ph-bg: rgba(239,68,68,.10);
      --ph-fg: #dc2626;
      --pm-bg: rgba(34,197,94,.10);
      --pm-fg: #16a34a;
      --pl-bg: rgba(249,115,22,.10);
      --pl-fg: #ea580c;

      --btn-sh: 0 4px 18px rgba(79,70,229,.28);
      --scroll: rgba(99,102,241,.22);
      --trans: background .42s ease, color .42s ease, border-color .42s ease, box-shadow .42s ease;
    }

    .emp-dash.dark {
      --bg: #070b12;
      --orb-a: rgba(99,102,241,.20);
      --orb-b: rgba(14,165,233,.13);
      --orb-c: rgba(168,85,247,.15);

      --g-bg: rgba(13,19,33,.72);
      --g-border: rgba(99,102,241,.20);
      --g-rim: rgba(255,255,255,.07);
      --g-inner: rgba(255,255,255,.03);
      --g-shadow: 0 8px 40px rgba(0,0,0,.50), 0 1px 2px rgba(0,0,0,.35);
      --g-hover: 0 22px 60px rgba(0,0,0,.60), 0 0 0 1px rgba(99,102,241,.28);
      --noise: .045;

      --txt: #f0f4ff;
      --txt2: #8b9ab5;
      --txt3: #3d4d66;

      --accent: #dbeafe;
      --accent2: #eff6ff;
      --grad: linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
      --asoft: rgba(129,140,248,.10);
      --aborder: rgba(129,140,248,.24);
      --divider: rgba(99,102,241,.14);
      --row-h: rgba(99,102,241,.08);
      --net-bg: rgba(99,102,241,.14);
      --net-fg: #a5b4fc;
      --chip-bg: rgba(129,140,248,.12);
      --chip-fg: #a5b4fc;

      --ph-bg: rgba(239,68,68,.14);
      --ph-fg: #f87171;
      --pm-bg: rgba(34,197,94,.12);
      --pm-fg: #4ade80;
      --pl-bg: rgba(251,146,60,.12);
      --pl-fg: #fb923c;

      --btn-sh: 0 4px 24px rgba(99,102,241,.36);
      --scroll: rgba(129,140,248,.28);
    }

    .emp-dash *, .emp-dash *::before, .emp-dash *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .emp-dash {
      min-height: 100vh;
      font-family: var(--font);
      background: var(--bg);
      color: var(--txt);
      overflow-x: hidden;
      position: relative;
      transition: var(--trans);
    }

    .emp-dash::after {
      content:'';
      position:fixed;
      inset:0;
      z-index:0;
      pointer-events:none;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: var(--noise);
      mix-blend-mode: overlay;
    }

    .orb {
      position:fixed;
      border-radius:50%;
      filter:blur(100px);
      pointer-events:none;
      z-index:0;
      animation:orbDrift 20s ease-in-out infinite;
    }

    .orb-a { width:700px; height:700px; background:var(--orb-a); top:-200px; left:-200px; }
    .orb-b { width:520px; height:520px; background:var(--orb-b); top:38%; right:-140px; animation-delay:-7s; }
    .orb-c { width:400px; height:400px; background:var(--orb-c); bottom:-60px; left:28%; animation-delay:-13s; }

    @keyframes orbDrift {
      0%,100% { transform:translate(0,0) scale(1); }
      33% { transform:translate(28px,-22px) scale(1.04); }
      66% { transform:translate(-18px,16px) scale(0.97); }
    }

    .glass {
      background: var(--g-bg);
      backdrop-filter: blur(28px) saturate(200%) brightness(1.02);
      -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.02);
      border: 1px solid var(--g-border);
      box-shadow: var(--g-shadow);
      border-radius: 22px;
      position: relative;
      overflow: hidden;
      transition: var(--trans), transform .30s ease;
    }

    .glass::before {
      content:'';
      position:absolute;
      inset:0;
      border-radius:inherit;
      pointer-events:none;
      z-index:0;
      background: linear-gradient(155deg, var(--g-rim) 0%, transparent 38%);
      opacity:.55;
    }

    .glass::after {
      content:'';
      position:absolute;
      inset:0;
      border-radius:inherit;
      pointer-events:none;
      z-index:0;
      background: linear-gradient(to bottom, transparent 50%, var(--g-inner) 100%);
    }

    .glass > * { position:relative; z-index:1; }
    .glass:hover { box-shadow:var(--g-hover); transform:translateY(-3px); }

    .dash-body { position:relative; z-index:1; padding-bottom:64px; }
    .dash-inner { max-width:1340px; margin:0 auto; padding:28px; }

    .m-anim { opacity:0; transform:translateY(16px); transition:opacity .55s ease, transform .55s ease; }
    .m-anim.in { opacity:1; transform:translateY(0); }
    .d1{transition-delay:.04s} .d2{transition-delay:.11s} .d3{transition-delay:.18s}

    .profile-card {
      padding:24px 28px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:16px;
      flex-wrap:wrap;
      margin-bottom:28px;
    }

    .prof-left {
      display:flex;
      align-items:center;
      gap:18px;
      flex-wrap:wrap;
    }

    .av-ring {
      padding:2.5px;
      background:var(--grad);
      border-radius:19px;
      flex-shrink:0;
      box-shadow:0 6px 22px rgba(79,70,229,.32);
    }

    .avatar {
      width:60px;
      height:60px;
      background:var(--g-bg);
      color:var(--accent);
      border-radius:17px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:800;
      font-size:23px;
      text-transform:uppercase;
      letter-spacing:-0.5px;
    }

    .prof-name  { font-size:19px; font-weight:800; color:var(--txt); margin-bottom:4px; }
    .prof-meta  { font-size:13px; color:var(--txt2); margin-bottom:7px; }

    .chips-wrap {
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
    }

    .role-chip  {
      display:inline-flex;
      align-items:center;
      gap:5px;
      padding:3px 11px;
      background:var(--chip-bg);
      color:var(--chip-fg);
      border:1px solid var(--aborder);
      border-radius:999px;
      font-size:11px;
      font-weight:700;
      text-transform:capitalize;
      letter-spacing:.04em;
    }

    .edit-btn {
      display:inline-flex;
      align-items:center;
      gap:8px;
      background: var(--grad);
      color:white;
      border:none;
      padding:11px 22px;
      border-radius:13px;
      font-size:13px;
      font-weight:700;
      cursor:pointer;
      box-shadow: var(--btn-sh);
      transition: all .25s ease;
    }

    .edit-btn:hover { transform:translateY(-2px) scale(1.03); }

    .sec-label {
      font-size:11px;
      font-weight:700;
      letter-spacing:.10em;
      text-transform:uppercase;
      color:var(--txt3);
      margin-bottom:14px;
      display:flex;
      align-items:center;
      gap:10px;
    }

    .sec-label::after {
      content:'';
      flex:1;
      height:1px;
      background:linear-gradient(90deg,var(--divider),transparent);
    }

    .qa-grid {
      display:grid;
      grid-template-columns:repeat(auto-fill, minmax(150px,1fr));
      gap:12px;
      margin-bottom:32px;
    }

    .qa-btn {
      background: var(--g-bg);
      border:1px solid var(--g-border);
      box-shadow: var(--g-shadow);
      border-radius:17px;
      padding:21px 12px 17px;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:10px;
      cursor:pointer;
      font-size:12.5px;
      font-weight:700;
      color:var(--txt2);
      text-align:center;
      position:relative;
      overflow:hidden;
      transition: all .28s cubic-bezier(.34,1.56,.64,1);
    }

    .qa-btn::before {
      content:'';
      position:absolute;
      inset:0;
      border-radius:inherit;
      background: var(--grad);
      opacity:0;
      transition: opacity .25s ease;
    }

    .qa-btn > * { position:relative; z-index:1; }

    .qa-btn:hover {
      transform:translateY(-7px);
      color:white;
      border-color:transparent;
      box-shadow:0 16px 40px rgba(79,70,229,.32);
    }

    .qa-btn:hover::before { opacity:1; }
    .qa-btn:hover .qa-icon { background:rgba(255,255,255,.18); color:white; }

    .qa-icon {
      width:42px;
      height:42px;
      background:var(--asoft);
      border-radius:13px;
      display:flex;
      align-items:center;
      justify-content:center;
      color:var(--accent);
      transition: all .25s ease;
    }

    .cards-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:22px;
    }

    .card-box { padding:24px; }

    .card-head {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      flex-wrap:wrap;
      margin-bottom:16px;
    }

    .card-title {
      display:flex;
      align-items:center;
      gap:10px;
      font-size:14.5px;
      font-weight:800;
      color:var(--txt);
    }

    .ct-icon {
      width:34px;
      height:34px;
      background:var(--asoft);
      border-radius:10px;
      display:flex;
      align-items:center;
      justify-content:center;
      color:var(--accent);
      flex-shrink:0;
    }

    .task-list, .ann-list, .team-stack, .mini-stats {
      display:flex;
      flex-direction:column;
      gap:10px;
    }

    .task-item, .ann-item, .manager-box, .member-row, .stat-box {
      background:var(--g-inner);
      border:1px solid var(--divider);
      border-radius:14px;
      padding:14px;
      transition:all .22s ease;
    }

    .task-item:hover,
    .ann-item:hover,
    .manager-box:hover,
    .member-row:hover,
    .stat-box:hover {
      background:var(--row-h);
      border-color:var(--aborder);
      transform:translateX(4px);
    }

    .task-name {
      font-size:13.5px;
      font-weight:700;
      color:var(--txt);
      margin-bottom:8px;
      line-height:1.35;
    }

    .task-foot {
      display:flex;
      align-items:center;
      gap:10px;
      flex-wrap:wrap;
    }

    .task-due {
      font-family:var(--mono);
      font-size:11px;
      color:var(--txt3);
    }

    .pri-badge {
      display:inline-flex;
      align-items:center;
      gap:4px;
      padding:3px 9px;
      border-radius:999px;
      font-size:10.5px;
      font-weight:800;
      letter-spacing:.04em;
    }

    .pri-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
    .p-high { background:var(--ph-bg); color:var(--ph-fg); }
    .p-medium { background:var(--pm-bg); color:var(--pm-fg); }
    .p-low { background:var(--pl-bg); color:var(--pl-fg); }

    .ann-item {
      border-left:3px solid var(--accent);
      border-radius:0 14px 14px 0;
      font-size:13px;
      color:var(--txt2);
      line-height:1.65;
    }

    .stat-label {
      font-size:11px;
      letter-spacing:.08em;
      text-transform:uppercase;
      color:var(--txt3);
      margin-bottom:6px;
      font-weight:700;
    }

    .stat-value {
      font-size:15px;
      font-weight:800;
      color:var(--txt);
      line-height:1.4;
      word-break:break-word;
    }

    .stat-desc {
      margin-top:6px;
      font-size:12px;
      color:var(--txt2);
      line-height:1.6;
    }

    .manager-box,
    .member-row {
      display:flex;
      align-items:flex-start;
      gap:12px;
    }

    .team-stack {
      max-height:420px;
      overflow-y:auto;
      padding-right:4px;
    }

    .team-stack::-webkit-scrollbar,
    .ps-scroll::-webkit-scrollbar {
      width:5px;
      height:5px;
    }

    .team-stack::-webkit-scrollbar-track,
    .ps-scroll::-webkit-scrollbar-track {
      background:transparent;
    }

    .team-stack::-webkit-scrollbar-thumb,
    .ps-scroll::-webkit-scrollbar-thumb {
      background:var(--scroll);
      border-radius:999px;
    }

    .person-av {
      width:46px;
      height:46px;
      border-radius:14px;
      background:var(--grad);
      color:#fff;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:13px;
      font-weight:800;
      letter-spacing:.04em;
      flex-shrink:0;
      box-shadow:var(--btn-sh);
    }

    .person-meta {
      min-width:0;
      flex:1;
    }

    .person-top {
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
    }

    .person-name {
      font-size:13.5px;
      font-weight:800;
      color:var(--txt);
    }

    .small-chip {
      display:inline-flex;
      align-items:center;
      padding:2px 8px;
      border-radius:999px;
      background:var(--chip-bg);
      color:var(--chip-fg);
      border:1px solid var(--aborder);
      font-size:10px;
      font-weight:800;
      letter-spacing:.05em;
      text-transform:uppercase;
    }

    .manager-chip {
      background:rgba(79,70,229,.12);
      color:var(--accent);
    }

    .person-sub {
      font-size:12px;
      color:var(--txt2);
      margin-top:4px;
      line-height:1.5;
    }

    .person-mail {
      font-size:12px;
      color:var(--txt3);
      margin-top:4px;
      word-break:break-word;
    }

    .empty {
      text-align:center;
      padding:30px 16px;
      color:var(--txt3);
      font-size:13px;
    }

    .empty-icon {
      font-size:32px;
      opacity:.55;
      margin-bottom:6px;
    }

    .slip-select {
      background:var(--g-inner);
      border:1px solid var(--divider);
      border-radius:10px;
      padding:6px 12px;
      font-size:12px;
      font-weight:600;
      color:var(--txt2);
      cursor:pointer;
      outline:none;
    }

    .ps-scroll {
      overflow-x:auto;
      -webkit-overflow-scrolling:touch;
      margin-top:8px;
    }

    .ps-tbl {
      width:100%;
      border-collapse:collapse;
      min-width:360px;
    }

    .ps-tbl thead tr { background:var(--grad); }

    .ps-tbl thead th {
      padding:9px 13px;
      text-align:left;
      font-size:10.5px;
      font-weight:700;
      letter-spacing:.07em;
      text-transform:uppercase;
      color:rgba(255,255,255,.90);
    }

    .ps-tbl thead th:first-child { border-radius:11px 0 0 11px; }
    .ps-tbl thead th:last-child  { border-radius:0 11px 11px 0; }

    .ps-tbl tbody tr {
      border-bottom:1px solid var(--divider);
      transition:background .15s;
    }

    .ps-tbl tbody tr:last-child { border-bottom:none; }
    .ps-tbl tbody tr:hover { background:var(--row-h); }

    .ps-tbl td { padding:8px 13px; vertical-align:middle; }

    .ps-lbl  { font-size:12px; color:var(--txt2); font-weight:500; }
    .ps-val  { font-family:var(--mono); font-size:11.5px; font-weight:600; color:var(--txt); }

    .net-box {
      margin-top:14px;
      background:var(--net-bg);
      color:var(--net-fg);
      border:1px solid var(--aborder);
      border-radius:14px;
      padding:12px 14px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      flex-wrap:wrap;
      font-weight:800;
    }

    .sal-warn {
      margin-bottom:12px;
      background:rgba(239,68,68,.10);
      color:#dc2626;
      border:1px solid rgba(239,68,68,.18);
      padding:10px 12px;
      border-radius:12px;
      font-size:12.5px;
      font-weight:600;
    }

    @media (max-width: 992px) {
      .cards-grid { grid-template-columns:1fr; }
    }

    @media (max-width: 768px) {
      .dash-inner { padding:18px; }
      .profile-card, .card-box { padding:18px; }
      .qa-grid { grid-template-columns:repeat(2, minmax(0,1fr)); }
    }

    @media (max-width: 520px) {
      .qa-grid { grid-template-columns:1fr 1fr; }
      .prof-name { font-size:16px; }
    }
  `;

  return (
    <div className={`emp-dash ${dark ? "dark" : ""}`}>
      <style>{css}</style>

      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      <Header />

      <div className="dash-body">
        <div className="dash-inner">
          <div className={`glass profile-card m-anim d1 ${mounted ? "in" : ""}`}>
            <div className="prof-left">
              <div className="av-ring">
                <div className="avatar">
                  {getInitials(loggedUser?.full_name || loggedUser?.name || "U")}
                </div>
              </div>

              <div>
                <div className="prof-name">
                  {loggedUser?.full_name || loggedUser?.name || "Employee"}
                </div>
                <div className="prof-meta">
                  {loggedUser?.email || "No email"}
                  {loggedUser?.employee_id ? ` • ${loggedUser.employee_id}` : ""}
                </div>

                <div className="chips-wrap">
                  <span className="role-chip">{normalizedRole || "employee"}</span>
                  {teamInfo?.team?.name ? (
                    <span className="role-chip">{teamInfo.team.name}</span>
                  ) : (
                    <span className="role-chip">No Team</span>
                  )}
                  <span className="role-chip">Auto Refresh</span>
                </div>
              </div>
            </div>

            <button
              className="edit-btn"
              type="button"
              onClick={() => navigate("/update")}
            >
              <Icon d={Icons.edit} size={15} />
              Edit Profile
            </button>
          </div>

          <div className="sec-label">Quick Actions</div>
          <div className={`qa-grid m-anim d2 ${mounted ? "in" : ""}`}>
            {quickActions.map((item) => (
              <button
                key={item.label}
                className="qa-btn"
                type="button"
                onClick={() => navigate(item.path)}
              >
                <div className="qa-icon">
                  <Icon d={item.icon} size={18} />
                </div>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="sec-label">Dashboard Overview</div>
          <div className={`cards-grid m-anim d3 ${mounted ? "in" : ""}`}>
            {/* TEAM DETAILS */}
            {/* TEAM DETAILS */}
<div className="glass card-box">
  <div className="card-head">
    <div className="card-title">
      <div className="ct-icon">
        <Icon d={Icons.team} size={15} />
      </div>
      Team Details
    </div>
    {teamInfo?.team?.memberCount ? (
      <span className="role-chip">{teamInfo.team.memberCount} people</span>
    ) : null}
  </div>

  {teamLoading ? (
    <div className="empty">
      <div className="empty-icon">⏳</div>
      Loading team details...
    </div>
  ) : !teamInfo?.team ? (
    <div className="empty">
      <div className="empty-icon">👥</div>
      You are not assigned to any team
    </div>
  ) : (
    <div className="mini-stats">
      <div className="stat-box">
        <div className="stat-label">Team Name</div>
        <div className="stat-value">{teamInfo.team.name || "—"}</div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Your Role</div>
        <div className="stat-value">
          {teamInfo.team.currentUserRole || normalizedRole || "employee"}
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Team Description</div>
        <div className="stat-desc">
          {teamInfo.team.description || "No team description available"}
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Member Count</div>
        <div className="stat-value">{teamInfo.team.memberCount || 0}</div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Manager</div>

        {!teamInfo?.manager ? (
          <div className="stat-desc">No manager assigned to this team</div>
        ) : (
          <div className="manager-box" style={{ marginTop: "10px" }}>
            <div className="person-av">{getInitials(teamInfo.manager.name)}</div>

            <div className="person-meta">
              <div className="person-top">
                <span className="person-name">{teamInfo.manager.name}</span>
                <span className="small-chip manager-chip">Manager</span>
                {loggedUser?.id === teamInfo.manager.id && (
                  <span className="small-chip">You</span>
                )}
              </div>

              <div className="person-sub">
                {teamInfo.manager.employee_id || "No ID"}
                {teamInfo.manager.designation
                  ? ` • ${teamInfo.manager.designation}`
                  : ""}
                {teamInfo.manager.department
                  ? ` • ${teamInfo.manager.department}`
                  : ""}
              </div>

              <div className="person-mail">
                {teamInfo.manager.email || "No email"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )}
</div>

            

            {/* TASKS */}
            <div className="glass card-box">
              <div className="card-head">
                <div className="card-title">
                  <div className="ct-icon">
                    <Icon d={Icons.task} size={15} />
                  </div>
                  My Tasks
                </div>
                {tasks.length > 0 && (
                  <span className="role-chip">{tasks.length} pending</span>
                )}
              </div>

              {tasks.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">✅</div>
                  No tasks assigned
                </div>
              ) : (
                <div className="task-list">
                  {tasks.map((task) => {
                    const priority = getPriorityMeta(task.priority);
                    return (
                      <div key={task.id} className="task-item">
                        <p className="task-name">{task.title}</p>
                        <div className="task-foot">
                          <span className={`pri-badge ${priority.cls}`}>
                            <span className="pri-dot" />
                            {priority.label}
                          </span>
                          <span className="task-due">Due: {formatDate(task.due_date)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ANNOUNCEMENTS */}
            <div className="glass card-box">
              <div className="card-head">
                <div className="card-title">
                  <div className="ct-icon">
                    <Icon d={Icons.announce} size={15} />
                  </div>
                  Announcements
                </div>
                {announcements.length > 0 && (
                  <span className="role-chip">{announcements.length} new</span>
                )}
              </div>

              {announcements.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🔔</div>
                  No announcements
                </div>
              ) : (
                <div className="ann-list">
                  {announcements.map((item) => (
                    <div key={item.id || item.announcement_id} className="ann-item">
                      {item.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TEAM DIRECTORY */}
            <div className="glass card-box" style={{ gridColumn: "1 / -1" }}>
              <div className="card-head">
                <div className="card-title">
                  <div className="ct-icon">
                    <Icon d={Icons.team} size={15} />
                  </div>
                  Team Directory
                </div>
                <span className="role-chip">
                  {teamInfo?.people?.length || 0} people
                </span>
              </div>

              {teamLoading ? (
                <div className="empty">
                  <div className="empty-icon">⏳</div>
                  Loading team people...
                </div>
              ) : !teamInfo?.team ? (
                <div className="empty">
                  <div className="empty-icon">👥</div>
                  No team assigned
                </div>
              ) : teamInfo.people.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  No people found in this team
                </div>
              ) : (
                <div className="team-stack">
                  {teamInfo.people.map((person) => (
                    <div key={person.id} className="member-row">
                      <div className="person-av">{getInitials(person.name)}</div>

                      <div className="person-meta">
                        <div className="person-top">
                          <span className="person-name">{person.name}</span>

                          {person.isManager && (
                            <span className="small-chip manager-chip">Manager</span>
                          )}

                          <span className="small-chip">
                            {person.role || "employee"}
                          </span>

                          {loggedUser?.id === person.id && (
                            <span className="small-chip">You</span>
                          )}
                        </div>

                        <div className="person-sub">
                          {person.employee_id || "No ID"}
                          {person.designation ? ` • ${person.designation}` : ""}
                          {person.department ? ` • ${person.department}` : ""}
                        </div>

                        <div className="person-mail">
                          {person.email || "No email"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PAYSLIP */}
            <div className="glass card-box" style={{ gridColumn: "1 / -1" }}>
              <div className="card-head">
                <div className="card-title">
                  <div className="ct-icon">
                    <Icon d={Icons.wallet} size={15} />
                  </div>
                  {selectedSlip?.month ? `${selectedSlip.month} Payslip` : "Pay Slip"}
                </div>

                {salaryData.length > 1 && (
                  <select
                    className="slip-select"
                    value={selectedSlip?.id || ""}
                    onChange={(e) => {
                      const selected = salaryData.find(
                        (row) => String(row.id) === e.target.value
                      );
                      setSelectedSlip(selected || null);
                    }}
                  >
                    {salaryData.map((slip) => (
                      <option key={slip.id} value={slip.id}>
                        {slip.month}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {salaryMessage && <div className="sal-warn">{salaryMessage}</div>}

              {!selectedSlip ? (
                <div className="empty">
                  <div className="empty-icon">💳</div>
                  No payslip available
                </div>
              ) : (
                <>
                  <div className="ps-scroll">
                    <table className="ps-tbl">
                      <thead>
                        <tr>
                          <th>Earnings</th>
                          <th>Amount</th>
                          <th>Deductions</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payRows.map(([earnLabel, earnKey, dedLabel, dedKey]) => (
                          <tr key={`${earnKey}-${dedKey}`}>
                            <td className="ps-lbl">{earnLabel}</td>
                            <td className="ps-val">{formatMoney(selectedSlip?.[earnKey])}</td>
                            <td className="ps-lbl">{dedLabel}</td>
                            <td className="ps-val">{formatMoney(selectedSlip?.[dedKey])}</td>
                          </tr>
                        ))}
                        <tr>
                          <td className="ps-lbl">Gross Salary</td>
                          <td className="ps-val">
                            {formatMoney(selectedSlip?.gross_salary)}
                          </td>
                          <td className="ps-lbl">Total Deductions</td>
                          <td className="ps-val">
                            {formatMoney(selectedSlip?.total_deductions)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="net-box">
                    <span>Net Salary</span>
                    <span>{formatMoney(selectedSlip?.net_salary)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}