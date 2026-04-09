import React, { useEffect, useMemo, useState } from "react";
import "./AdminTeamManager.css";

/* ── API ── */
const API_BASE = (import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}").replace(/\/$/, "");

/* ── Helpers ── */
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const AVATAR_COLORS = [
  "linear-gradient(135deg,#7c3aed,#4f46e5)",
  "linear-gradient(135deg,#2563eb,#0891b2)",
  "linear-gradient(135deg,#059669,#0891b2)",
  "linear-gradient(135deg,#d97706,#dc2626)",
  "linear-gradient(135deg,#db2777,#7c3aed)",
];

const avatarColor = (id) => AVATAR_COLORS[(Number(id) || 0) % AVATAR_COLORS.length];

const safeJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Invalid server response" };
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminTeamManager() {
  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamDetails, setTeamDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [activeTab, setActiveTab] = useState("members"); // members | assign

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    managerId: "",
  });

  const [assignManagerId, setAssignManagerId] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [empSearch, setEmpSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const [teamSearch, setTeamSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all"); // all | with-manager | without-manager

  const adminToken = localStorage.getItem("adminToken");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${adminToken}`,
    }),
    [adminToken]
  );

  const jsonHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    }),
    [adminToken]
  );

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      fetchTeamMembers(selectedTeamId);
    } else {
      setTeamDetails(null);
      setAssignManagerId("");
      setSelectedEmployees([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId]);

  const fetchInitialData = async (showRefreshMessage = false) => {
    try {
      if (loading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      clearMessages();

      const [teamsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/teams/all`, {
          headers: authHeaders,
        }),
        fetch(`${API_BASE}/api/teams/users/options`, {
          headers: authHeaders,
        }),
      ]);

      const teamsData = await safeJson(teamsRes);
      const usersData = await safeJson(usersRes);

      if (!teamsRes.ok) throw new Error(teamsData.message || "Failed to fetch teams");
      if (!usersRes.ok) throw new Error(usersData.message || "Failed to fetch users");

      const nextTeams = Array.isArray(teamsData) ? teamsData : [];
      setTeams(nextTeams);
      setManagers(usersData.managers || []);
      setEmployees(usersData.employees || []);

      setSelectedTeamId((prev) => {
        const hasPrev = nextTeams.some((t) => String(t.id) === String(prev));
        if (hasPrev) return String(prev);
        return nextTeams.length ? String(nextTeams[0].id) : "";
      });

      if (showRefreshMessage) {
        setSuccessMsg("Data refreshed successfully ✓");
      }
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      setErrorMsg("");

      const res = await fetch(`${API_BASE}/api/teams/${teamId}/members`, {
        headers: authHeaders,
      });

      const data = await safeJson(res);

      if (!res.ok) throw new Error(data.message || "Failed to fetch team members");

      setTeamDetails(data);
      setAssignManagerId(data.team?.managerId ? String(data.team.managerId) : "");

      const empIds = (data.members || [])
        .filter((m) => String(m.role).toLowerCase() === "employee")
        .map((m) => m.id);

      setSelectedEmployees(empIds);
    } catch (err) {
      setErrorMsg(err.message || "Failed to fetch team details");
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        name: createForm.name,
        description: createForm.description,
        managerId: createForm.managerId ? Number(createForm.managerId) : null,
      };

      const res = await fetch(`${API_BASE}/api/teams/create`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) throw new Error(data.message || "Failed to create team");

      setSuccessMsg("Team created successfully ✓");
      setCreateForm({ name: "", description: "", managerId: "" });
      await fetchInitialData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  const handleManagerUpdate = async () => {
    if (!selectedTeamId) return;

    try {
      setSaving(true);
      clearMessages();

      const res = await fetch(`${API_BASE}/api/teams/${selectedTeamId}/manager`, {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({
          managerId: assignManagerId ? Number(assignManagerId) : null,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) throw new Error(data.message || "Failed to update manager");

      setSuccessMsg(assignManagerId ? "Manager updated ✓" : "Manager removed from team ✓");
      await fetchInitialData();
      await fetchTeamMembers(selectedTeamId);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update manager");
    } finally {
      setSaving(false);
    }
  };

  const handleMembersUpdate = async () => {
    if (!selectedTeamId) return;

    try {
      setSaving(true);
      clearMessages();

      const res = await fetch(`${API_BASE}/api/teams/${selectedTeamId}/members`, {
        method: "PUT",
        headers: jsonHeaders,
        body: JSON.stringify({ employeeIds: selectedEmployees }),
      });

      const data = await safeJson(res);

      if (!res.ok) throw new Error(data.message || "Failed to update members");

      setSuccessMsg("Team members saved ✓");
      await fetchInitialData();
      await fetchTeamMembers(selectedTeamId);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update members");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (team) => {
    if (!team?.id) return;

    const ok = window.confirm(
      `Are you sure you want to remove "${team.name}"?\n\nThis will unassign its manager and employees from the team.`
    );

    if (!ok) return;

    try {
      setDeletingTeamId(String(team.id));
      clearMessages();

      const res = await fetch(`${API_BASE}/api/teams/${team.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await safeJson(res);

      if (!res.ok) throw new Error(data.message || "Failed to delete team");

      setSuccessMsg(`"${team.name}" removed successfully ✓`);

      if (String(selectedTeamId) === String(team.id)) {
        setSelectedTeamId("");
        setTeamDetails(null);
        setAssignManagerId("");
        setSelectedEmployees([]);
      }

      await fetchInitialData();
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete team");
    } finally {
      setDeletingTeamId("");
    }
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const teamNameMap = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[String(t.id)] = t.name;
    });
    return map;
  }, [teams]);

  const filteredTeams = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch =
        !q ||
        [team.name, team.description, team.managerName]
          .some((field) => String(field || "").toLowerCase().includes(q));

      const hasManager = Boolean(team.managerName);

      const matchesFilter =
        teamFilter === "all" ||
        (teamFilter === "with-manager" && hasManager) ||
        (teamFilter === "without-manager" && !hasManager);

      return matchesSearch && matchesFilter;
    });
  }, [teams, teamSearch, teamFilter]);

  const filteredEmployees = useMemo(() => {
    const q = empSearch.trim().toLowerCase();

    return [...employees]
      .filter((emp) => {
        return (
          !q ||
          [emp.name, emp.employee_id, emp.email]
            .some((field) => String(field || "").toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const aChecked = selectedEmployees.includes(a.id) ? 0 : 1;
        const bChecked = selectedEmployees.includes(b.id) ? 0 : 1;
        if (aChecked !== bChecked) return aChecked - bChecked;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [employees, empSearch, selectedEmployees]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    const members = teamDetails?.members || [];

    return members.filter((member) => {
      return (
        !q ||
        [member.name, member.email, member.employeeId, member.dept, member.jobTitle, member.role]
          .some((field) => String(field || "").toLowerCase().includes(q))
      );
    });
  }, [teamDetails, memberSearch]);

  const visibleEmployeeIds = useMemo(() => filteredEmployees.map((emp) => emp.id), [filteredEmployees]);

  const currentTeam = useMemo(
    () => teams.find((t) => String(t.id) === String(selectedTeamId)),
    [teams, selectedTeamId]
  );

  const totalMembers = useMemo(
    () => teams.reduce((sum, t) => sum + Number(t.memberCount || 0), 0),
    [teams]
  );

  const teamsWithManagers = useMemo(
    () => teams.filter((t) => t.managerName).length,
    [teams]
  );

  const unassignedEmployees = useMemo(
    () => employees.filter((e) => !e.team_id).length,
    [employees]
  );

  const selectedVisibleCount = useMemo(
    () => visibleEmployeeIds.filter((id) => selectedEmployees.includes(id)).length,
    [visibleEmployeeIds, selectedEmployees]
  );

  const selectAllVisible = () => {
    setSelectedEmployees((prev) => {
      const set = new Set(prev);
      visibleEmployeeIds.forEach((id) => set.add(id));
      return [...set];
    });
  };

  const clearVisible = () => {
    setSelectedEmployees((prev) => prev.filter((id) => !visibleEmployeeIds.includes(id)));
  };

  const isDeletingCurrentTeam =
    deletingTeamId && String(deletingTeamId) === String(selectedTeamId);

  return (
    <div className="atm-page container-fluid py-2">
      <div className="atm-header mb-4">
        <div className="atm-header-left">
          <h2>
            Team <span>Management</span>
          </h2>
          <p>Create teams, assign managers, manage members, and remove teams safely.</p>
        </div>

        <div className="atm-header-stats">
          <div className="atm-hstat">
            <div className="atm-hstat-dot" style={{ background: "#7c3aed" }} />
            <span className="atm-hstat-num">{teams.length}</span> Teams
          </div>
          <div className="atm-hstat">
            <div className="atm-hstat-dot" style={{ background: "#2563eb" }} />
            <span className="atm-hstat-num">{managers.length}</span> Managers
          </div>
          <div className="atm-hstat">
            <div className="atm-hstat-dot" style={{ background: "#059669" }} />
            <span className="atm-hstat-num">{totalMembers}</span> Members
          </div>
          <div className="atm-hstat">
            <div className="atm-hstat-dot" style={{ background: "#f59e0b" }} />
            <span className="atm-hstat-num">{unassignedEmployees}</span> Unassigned
          </div>
        </div>
      </div>

      {errorMsg && <div className="atm-alert atm-alert-error">{errorMsg}</div>}
      {successMsg && <div className="atm-alert atm-alert-success">{successMsg}</div>}

      {loading ? (
        <div className="atm-card">
          <div className="atm-card-body">
            <div className="atm-loading-wrap">
              <div className="atm-loader" />
              <div className="atm-loading-text">Loading team management…</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* LEFT */}
          <div className="col-12 col-xl-4">
            <div className="atm-card">
              <div className="atm-card-body">
                <div className="atm-card-title">
                  <span className="atm-card-title-icon">✦</span> Create New Team
                </div>

                <form onSubmit={handleCreateTeam}>
                  <div className="atm-form-group">
                    <label className="atm-label">Team Name</label>
                    <input
                      className="atm-input"
                      type="text"
                      placeholder="e.g. Product Alpha"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="atm-form-group">
                    <label className="atm-label">Description</label>
                    <textarea
                      className="atm-textarea"
                      rows={3}
                      placeholder="What does this team do?"
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>

                  <div className="atm-form-group">
                    <label className="atm-label">Assign Manager (optional)</label>
                    <select
                      className="atm-select"
                      value={createForm.managerId}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, managerId: e.target.value }))
                      }
                    >
                      <option value="">Select manager</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.employee_id || m.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button className="atm-btn atm-btn-primary atm-btn-full" disabled={saving} type="submit">
                    {saving ? "Creating…" : "➕ Create Team"}
                  </button>
                </form>

                <div className="atm-section-divider" style={{ marginTop: 26 }}>
                  Team Directory
                </div>

                <div className="atm-team-tools">
                  <input
                    className="atm-input"
                    placeholder="Search teams, manager, description…"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                  />

                  <div className="atm-segmented">
                    <button
                      type="button"
                      className={`atm-segmented-btn ${teamFilter === "all" ? "active" : ""}`}
                      onClick={() => setTeamFilter("all")}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`atm-segmented-btn ${
                        teamFilter === "with-manager" ? "active" : ""
                      }`}
                      onClick={() => setTeamFilter("with-manager")}
                    >
                      With Manager
                    </button>
                    <button
                      type="button"
                      className={`atm-segmented-btn ${
                        teamFilter === "without-manager" ? "active" : ""
                      }`}
                      onClick={() => setTeamFilter("without-manager")}
                    >
                      No Manager
                    </button>
                  </div>
                </div>

                <div className="atm-mini-stats">
                  <div className="atm-mini-stat">
                    <span className="atm-mini-stat-label">With manager</span>
                    <strong>{teamsWithManagers}</strong>
                  </div>
                  <div className="atm-mini-stat">
                    <span className="atm-mini-stat-label">Without manager</span>
                    <strong>{teams.length - teamsWithManagers}</strong>
                  </div>
                </div>

                <div className="atm-team-list">
                  {filteredTeams.length === 0 ? (
                    <div className="atm-empty-state">
                      <div className="atm-empty-icon">🗂️</div>
                      <div className="atm-empty-title">No teams found</div>
                      <div className="atm-empty-text">
                        Try a different search or create a new team.
                      </div>
                    </div>
                  ) : (
                    filteredTeams.map((team) => {
                      const isActive = String(selectedTeamId) === String(team.id);
                      const isDeleting = String(deletingTeamId) === String(team.id);

                      return (
                        <div
                          key={team.id}
                          className={`atm-team-grid-card ${isActive ? "active-team" : ""}`}
                          onClick={() => setSelectedTeamId(String(team.id))}
                        >
                          <div className="atm-tgc-top">
                            <div className="atm-tgc-title-wrap">
                              <div className="atm-tgc-name-row">
                                <div className="atm-tgc-name">{team.name}</div>
                                {isActive && <span className="atm-badge atm-badge-accent">Selected</span>}
                              </div>
                              <div className="atm-tgc-desc">
                                {team.description || "No description added"}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="atm-icon-btn atm-icon-btn-danger"
                              title="Remove team"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeam(team);
                              }}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "…" : "🗑"}
                            </button>
                          </div>

                          <div className="atm-tgc-meta">
                            <div className="atm-tgc-chip">
                              <span className="atm-tgc-icon">👤</span>
                              {team.managerName || "No manager"}
                            </div>
                            <div className="atm-tgc-chip">
                              <span className="atm-tgc-icon">👥</span>
                              {team.memberCount || 0} members
                            </div>
                          </div>

                          <div className="atm-tgc-footer">
                            <span>Created {formatDate(team.createdAt)}</span>
                            <span>ID: {team.id}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-12 col-xl-8">
            <div className="atm-card h-100">
              <div className="atm-card-body">
                <div className="atm-card-head-row">
                  <div className="atm-card-title" style={{ marginBottom: 0 }}>
                    <span className="atm-card-title-icon">⚙</span> Manage Team
                  </div>

                  <button
                    type="button"
                    className="atm-btn atm-btn-outline"
                    onClick={() => fetchInitialData(true)}
                    disabled={refreshing}
                  >
                    {refreshing ? "Refreshing…" : "↻ Refresh"}
                  </button>
                </div>

                {teams.length > 0 ? (
                  <>
                    <div className="atm-team-selector-row">
                      <div className="atm-team-pills">
                        {teams.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className={`atm-team-pill ${
                              String(selectedTeamId) === String(t.id) ? "active" : ""
                            }`}
                            onClick={() => setSelectedTeamId(String(t.id))}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {currentTeam ? (
                      <>
                        <div className="atm-summary-grid">
                          <div className="atm-summary-chip">
                            <div className="atm-summary-chip-label">Selected Team</div>
                            <div className="atm-summary-chip-value">
                              {teamDetails?.team?.name || currentTeam?.name || "—"}
                            </div>
                          </div>

                          <div className="atm-summary-chip">
                            <div className="atm-summary-chip-label">Manager</div>
                            <div className="atm-summary-chip-value">
                              {teamDetails?.team?.managerName || "Not assigned"}
                            </div>
                          </div>

                          <div className="atm-summary-chip">
                            <div className="atm-summary-chip-label">Members</div>
                            <div className="atm-summary-chip-value">
                              {teamDetails?.members?.length || 0}
                            </div>
                          </div>

                          <div className="atm-summary-chip">
                            <div className="atm-summary-chip-label">Created</div>
                            <div className="atm-summary-chip-value">
                              {formatDate(currentTeam?.createdAt)}
                            </div>
                          </div>

                          <div className="atm-summary-chip">
                            <div className="atm-summary-chip-label">Last Updated</div>
                            <div className="atm-summary-chip-value">
                              {formatDate(currentTeam?.updatedAt)}
                            </div>
                          </div>

                          <div className="atm-summary-chip">
                            <div className="atm-summary-chip-label">Status</div>
                            <div className="atm-summary-chip-value">
                              {currentTeam?.managerName ? "Manager assigned" : "Needs manager"}
                            </div>
                          </div>
                        </div>

                        <div className="atm-section-divider">Team Actions</div>

                        <div className="atm-actions-bar">
                          <div className="atm-form-inline">
                            <div className="atm-form-inline-grow">
                              <label className="atm-label">Assign / Change Manager</label>
                              <select
                                className="atm-select"
                                value={assignManagerId}
                                onChange={(e) => setAssignManagerId(e.target.value)}
                              >
                                <option value="">No manager</option>
                                {managers.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} ({m.employee_id || m.email})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="button"
                              className="atm-btn atm-btn-outline"
                              onClick={handleManagerUpdate}
                              disabled={saving}
                            >
                              {saving ? "Saving…" : assignManagerId ? "Update Manager" : "Remove Manager"}
                            </button>
                          </div>

                          <button
                            type="button"
                            className="atm-btn atm-btn-danger"
                            onClick={() => handleDeleteTeam(currentTeam)}
                            disabled={isDeletingCurrentTeam}
                          >
                            {isDeletingCurrentTeam ? "Removing…" : "🗑 Remove Team"}
                          </button>
                        </div>

                        <div className="atm-section-divider" style={{ marginTop: 24 }}>
                          Team Workspace
                        </div>

                        <div className="atm-tabbar">
                          <button
                            type="button"
                            className={`atm-tab-btn ${activeTab === "assign" ? "active" : ""}`}
                            onClick={() => setActiveTab("assign")}
                          >
                            Assign Employees
                          </button>
                          <button
                            type="button"
                            className={`atm-tab-btn ${activeTab === "members" ? "active" : ""}`}
                            onClick={() => setActiveTab("members")}
                          >
                            Member List
                          </button>
                        </div>

                        {activeTab === "assign" && (
                          <>
                            <div className="atm-toolbar">
                              <input
                                className="atm-input"
                                placeholder="Search employees by name, email, or employee ID…"
                                value={empSearch}
                                onChange={(e) => setEmpSearch(e.target.value)}
                              />

                              <div className="atm-toolbar-right">
                                <div className="atm-selection-pill">
                                  {selectedEmployees.length} selected
                                </div>
                                <div className="atm-selection-pill">
                                  {selectedVisibleCount}/{visibleEmployeeIds.length} visible checked
                                </div>
                              </div>
                            </div>

                            <div className="atm-sub-actions">
                              <button
                                type="button"
                                className="atm-btn atm-btn-soft"
                                onClick={selectAllVisible}
                              >
                                Select Visible
                              </button>

                              <button
                                type="button"
                                className="atm-btn atm-btn-soft"
                                onClick={clearVisible}
                              >
                                Clear Visible
                              </button>

                              <button
                                type="button"
                                className="atm-btn atm-btn-success"
                                onClick={handleMembersUpdate}
                                disabled={saving}
                              >
                                {saving ? "Saving…" : "💾 Save Members"}
                              </button>
                            </div>

                            <div className="atm-emp-grid">
                              {filteredEmployees.length === 0 ? (
                                <div className="atm-empty-grid-card">
                                  No employees found
                                </div>
                              ) : (
                                filteredEmployees.map((emp) => {
                                  const checked = selectedEmployees.includes(emp.id);
                                  const assignedTeamName = emp.team_id
                                    ? teamNameMap[String(emp.team_id)]
                                    : "";

                                  const isOtherTeam =
                                    emp.team_id && String(emp.team_id) !== String(selectedTeamId);

                                  return (
                                    <div
                                      key={emp.id}
                                      className={`atm-emp-card ${checked ? "checked" : ""}`}
                                      onClick={() => toggleEmployee(emp.id)}
                                    >
                                      <div
                                        className={`atm-emp-avatar ${
                                          checked ? "checked-avatar" : ""
                                        }`}
                                        style={{
                                          background: checked ? undefined : avatarColor(emp.id),
                                        }}
                                      >
                                        {getInitials(emp.name)}
                                      </div>

                                      <div className="atm-emp-info">
                                        <div className="atm-emp-topline">
                                          <div className="atm-emp-name">{emp.name}</div>
                                          {isOtherTeam && (
                                            <span className="atm-inline-badge atm-inline-badge-warn">
                                              {assignedTeamName || "Assigned elsewhere"}
                                            </span>
                                          )}
                                          {!emp.team_id && (
                                            <span className="atm-inline-badge atm-inline-badge-success">
                                              Unassigned
                                            </span>
                                          )}
                                          {String(emp.team_id) === String(selectedTeamId) && (
                                            <span className="atm-inline-badge atm-inline-badge-accent">
                                              Current team
                                            </span>
                                          )}
                                        </div>
                                        <div className="atm-emp-id">{emp.employee_id || emp.email}</div>
                                        <div className="atm-emp-email">{emp.email}</div>
                                      </div>

                                      <div className="atm-emp-check">{checked ? "✓" : ""}</div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </>
                        )}

                        {activeTab === "members" && (
                          <>
                            <div className="atm-toolbar">
                              <input
                                className="atm-input"
                                placeholder="Search current team members…"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                              />
                              <div className="atm-toolbar-right">
                                <div className="atm-selection-pill">
                                  {filteredMembers.length} visible
                                </div>
                              </div>
                            </div>

                            <div className="atm-table-wrap">
                              <table className="atm-table">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th>Employee ID</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Role</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredMembers.length ? (
                                    filteredMembers.map((member) => {
                                      const roleLower = String(member.role).toLowerCase();

                                      return (
                                        <tr key={member.id}>
                                          <td>
                                            <div className="atm-member-row">
                                              <div
                                                className="atm-member-avatar"
                                                style={{
                                                  background:
                                                    roleLower === "manager"
                                                      ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                                                      : avatarColor(member.id),
                                                }}
                                              >
                                                {getInitials(member.name)}
                                              </div>
                                              <div className="atm-member-meta">
                                                <div className="atm-member-name">{member.name}</div>
                                                <div className="atm-member-mail">{member.email}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td>{member.employeeId || "—"}</td>
                                          <td>{member.dept || "—"}</td>
                                          <td>{member.jobTitle || "—"}</td>
                                          <td>
                                            <span
                                              className={`atm-role-badge ${
                                                roleLower === "manager"
                                                  ? "atm-role-manager"
                                                  : "atm-role-employee"
                                              }`}
                                            >
                                              {roleLower === "manager" ? "Manager" : "Employee"}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td colSpan="5" className="atm-table-empty">
                                        No members found for this team
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="atm-empty-state atm-empty-state-large">
                        <div className="atm-empty-icon">🧩</div>
                        <div className="atm-empty-title">Select a team</div>
                        <div className="atm-empty-text">
                          Choose a team from the left panel to manage it.
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="atm-empty-state atm-empty-state-large">
                    <div className="atm-empty-icon">👥</div>
                    <div className="atm-empty-title">No teams yet</div>
                    <div className="atm-empty-text">
                      Create your first team from the left panel.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}