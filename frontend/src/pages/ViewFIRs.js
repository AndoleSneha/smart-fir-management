import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ViewFIRs() {

  const [firs, setFirs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [drawerFIR, setDrawerFIR] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerNotes, setDrawerNotes] = useState("");
  const [assignMode, setAssignMode] = useState(false);
  const [assignInput, setAssignInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Unused vars removed (legacy)

  const officers = [
    "Inspector Sharma",
    "Officer Rao",
    "Inspector Patel",
    "Constable Singh",
  ];

  // stats will be derived from filteredFIRs

  // 🔐 AUTH
  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "police") {
      window.location.href = "/login";
    } else {
      fetchFIRs();
    }
  }, []);

  useEffect(() => {
    if (drawerFIR) {
      setDrawerNotes(drawerFIR.internalNotes || "");
      setAssignInput(drawerFIR.assignedOfficer || "");
      setTagInput("");
      setAssignMode(false);
    }
  }, [drawerFIR]);

  // 📥 FETCH
  const fetchFIRs = async () => {
    try {
      const token = localStorage.getItem("token");

      const [firRes, complaintsRes] = await Promise.all([
        axios.get("http://localhost:4000/api/fir", {
          headers: { Authorization: token },
        }),
        axios.get("http://localhost:4000/api/complaints", {
          headers: { Authorization: token },
        }),
      ]);

      setFirs(firRes.data || []);
      setComplaints(complaintsRes.data || []);
    } catch {
      alert("Unauthorized");
    }
  };

  // 🔄 UPDATE
  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:4000/api/fir/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: token } }
      );

      fetchFIRs();
    } catch {
      alert("Failed to update status");
    }
  };

  const saveInternalNotes = async () => {
    if (!drawerFIR) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:4000/api/fir/${drawerFIR._id}/internal-notes`,
        { internalNotes: drawerNotes },
        { headers: { Authorization: token } }
      );

      fetchFIRs();
      setDrawerOpen(false);
    } catch {
      alert("Failed to save notes");
    }
  };

  const assignOfficer = async (firId, officer) => {
    if (!firId) return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:4000/api/fir/${firId}/assign`,
        { officer },
        { headers: { Authorization: token } }
      );

      // Refresh data and keep drawer open
      await fetchFIRs();
      const res = await axios.get(`http://localhost:4000/api/fir/${firId}`, {
        headers: { Authorization: token },
      });

      setDrawerFIR(res.data);
      setAssignMode(false);
    } catch {
      alert("Failed to assign officer");
    }
  };

  const saveTags = async (tags) => {
    if (!drawerFIR) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `http://localhost:4000/api/fir/${drawerFIR._id}/tags`,
        { tags },
        { headers: { Authorization: token } }
      );

      await fetchFIRs();
      setDrawerFIR((prev) => ({ ...prev, tags: res.data.tags }));
    } catch {
      alert("Failed to update tags");
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || !drawerFIR) return;

    const currentTags = drawerFIR.tags || [];
    if (currentTags.includes(t)) {
      setTagInput("");
      return;
    }

    const updated = [...currentTags, t];
    setDrawerFIR((prev) => ({ ...prev, tags: updated }));
    setTagInput("");
    saveTags(updated);
  };

  const removeTag = (tag) => {
    if (!drawerFIR) return;

    const updated = (drawerFIR.tags || []).filter((t) => t !== tag);
    setDrawerFIR((prev) => ({ ...prev, tags: updated }));
    saveTags(updated);
  };

  const downloadFIR = async (firId, firLabel) => {
    if (!firId) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:4000/api/fir/${firId}/download`,
        {
          headers: { Authorization: token },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${firLabel || firId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download FIR PDF");
    }
  };

  const autoAssignUnassigned = async () => {
    const unassignedFirs = firs.filter(
      (f) => !f.assignedOfficer || f.assignedOfficer === "Unassigned"
    );

    if (!unassignedFirs.length) {
      alert("No unassigned FIRs found.");
      return;
    }

    let idx = 0;
    for (const fir of unassignedFirs) {
      const officer = officers[idx % officers.length];
      await assignOfficer(fir._id, officer);
      idx += 1;
    }

    alert(`Assigned ${unassignedFirs.length} FIR(s) to officers.`);
  };

  const getPriorityBadge = (priority) => {
    const map = {
      High: { color: "#ff006e", label: "🔴 High" },
      Medium: { color: "#ffb703", label: "🟡 Medium" },
      Low: { color: "#2ec4b6", label: "🟢 Low" },
    };
    const item = map[priority] || { color: "#999", label: priority || "Medium" };

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: item.color,
          }}
        />
        <span>{item.label}</span>
      </span>
    );
  };

  const categorySLADays = {
    "Missing Person": 3,
    Theft: 15,
    Assault: 10,
    "Cyber Crime": 10,
    Fraud: 18,
    Other: 30,
  };

  const getSLAInfo = (fir) => {
    if (!fir) return null;
    const created = fir.createdAt ? new Date(fir.createdAt) : new Date();
    const duration = categorySLADays[fir.category] || categorySLADays.Other;
    const due = fir.dueDate ? new Date(fir.dueDate) : new Date(created.getTime() + duration * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return { label: "⚠ Overdue", color: "#ff006e", days: diff };
    }

    return { label: `⏰ ${diff} day${diff === 1 ? "" : "s"} left`, color: "#00b4d8", days: diff, due };
  };

  const isImage = (filename) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerFIR(null);
  };

  // ⭐ FILTER
  let filteredFIRs = firs;

  if (selectedCategory !== "All") {
    filteredFIRs = filteredFIRs.filter(
      (f) => (f.category || "Other") === selectedCategory
    );
  }

  if (statusFilter !== "All") {
    filteredFIRs = filteredFIRs.filter(
      (f) => (f.status || "Registered") === statusFilter
    );
  }

  if (startDate) {
    const start = new Date(startDate);
    filteredFIRs = filteredFIRs.filter((f) => {
      const created = new Date(f.createdAt);
      return created >= start;
    });
  }

  if (endDate) {
    const end = new Date(endDate);
    filteredFIRs = filteredFIRs.filter((f) => {
      const created = new Date(f.createdAt);
      return created <= end;
    });
  }

  if (search) {
    filteredFIRs = filteredFIRs.filter(
      (f) =>
        (f.firId || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.description || "")
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }

  // SORT
  filteredFIRs = filteredFIRs.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sortBy === "oldest" ? aTime - bTime : bTime - aTime;
  });

  // derive stats from filteredFIRs
  const derivedStats = useMemo(() => {
    const total = filteredFIRs.length;
    const registered = filteredFIRs.filter((f) => f.status === "Registered").length;
    const investigating = filteredFIRs.filter((f) => f.status === "Under Investigation").length;
    const chargesheet = filteredFIRs.filter((f) => f.status === "Chargesheet Filed").length;
    const closed = filteredFIRs.filter((f) => f.status === "Closed").length;
    return { total, registered, investigating, chargesheet, closed };
  }, [filteredFIRs]);

  const eligibleComplaints = useMemo(() => {
    // Include approved complaints plus those already converted to FIR
    return complaints.filter(
      (c) => c.status === "Approved" || c.status === "FIR Filed" || c.linkedFIR
    ).length;
  }, [complaints]);

  const conversionRate = useMemo(() => {
    if (!eligibleComplaints) return 0;
    return Math.min(100, Math.round((firs.length / eligibleComplaints) * 100));
  }, [eligibleComplaints, firs.length]);

  const firTrendData = useMemo(() => {
    // Build a 14-day trend of FIRs filed
    const counts = {};
    firs.forEach((f) => {
      if (!f.createdAt) return;
      const dateKey = new Date(f.createdAt).toISOString().slice(0, 10);
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });

    const days = 14;
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trend.push({ date: key, filed: counts[key] || 0 });
    }

    return trend;
  }, [firs]);

  const alerts = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const pendingLonger = firs.filter((f) => {
      const created = new Date(f.createdAt).getTime();
      return (
        (f.status === "Registered" || f.status === "Under Investigation") &&
        created < weekAgo
      );
    }).length;

    const highPriority = firs.filter((f) => f.priority === "High").length;

    const unassigned = firs.filter(
      (f) => !f.assignedOfficer || f.assignedOfficer === "Unassigned"
    ).length;

    return { pendingLonger, highPriority, unassigned };
  }, [firs]);

  const officerStats = useMemo(() => {
    const map = {};

    firs.forEach((f) => {
      const officer = f.assignedOfficer || "Unassigned";
      if (!map[officer]) {
        map[officer] = { officer, cases: 0, open: 0, closed: 0, closedMs: 0 };
      }
      map[officer].cases += 1;

      if (f.status === "Closed") {
        map[officer].closed += 1;
        const created = f.createdAt ? new Date(f.createdAt).getTime() : Date.now();
        const closed = f.updatedAt ? new Date(f.updatedAt).getTime() : Date.now();
        map[officer].closedMs += Math.max(0, closed - created);
      } else {
        map[officer].open += 1;
      }
    });

    return Object.values(map)
      .map((stats) => ({
        ...stats,
        avgDays: stats.closed
          ? Math.round(stats.closedMs / stats.closed / (1000 * 60 * 60 * 24))
          : null,
      }))
      .sort((a, b) => b.cases - a.cases);
  }, [firs]);

  const recommendedFIRs = useMemo(() => {
    if (!drawerFIR) return [];

    const candidates = firs
      .filter((f) => f._id !== drawerFIR._id)
      .filter((f) => f.category === drawerFIR.category || (drawerFIR.location && f.location === drawerFIR.location));

    return candidates.slice(0, 3);
  }, [firs, drawerFIR]);

  const statusData = [
    { name: "Registered", value: derivedStats.registered },
    { name: "Under Investigation", value: derivedStats.investigating },
    { name: "Chargesheet Filed", value: derivedStats.chargesheet },
    { name: "Closed", value: derivedStats.closed },
  ];

  const categoryMap = {};
  filteredFIRs.forEach((f) => {
    const cat = f.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const categoryData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const COLORS = ["#ffb703", "#00b4d8", "#2ec4b6"];

  const categories = [
    "All",
    "Theft",
    "Assault",
    "Cyber Crime",
    "Fraud",
    "Other",
  ];

  const getStatusClass = (status) => {
    const mapping = {
      Registered: "registered",
      "Under Investigation": "inprogress",
      "Chargesheet Filed": "chargesheet",
      Closed: "closed",
      "FIR Filed": "firfiled",
    };
    return `status-${mapping[status] || "pending"}`;
  };

  const getStatusColor = (status) => {
    const mapping = {
      Registered: "#00b4d8",
      "Under Investigation": "#8e44ad",
      "Chargesheet Filed": "#ff4d4f",
      Closed: "#2ec4b6",
      "FIR Filed": "#00d9ff",
      Rejected: "#ff006e",
    };
    return mapping[status] || "#999";
  };

  // Activity feed
  const recentActivity = React.useMemo(() => {
    const items = [];

    complaints.forEach((c) => {
      (c.timeline || []).forEach((t) => {
        items.push({
          id: `${c._id}-${t.date}-${t.message}`,
          message: `Complaint ${c.complaintId}: ${t.message}`,
          date: new Date(t.date),
        });
      });
    });

    firs.forEach((f) => {
      (f.timeline || []).forEach((t) => {
        items.push({
          id: `${f._id}-${t.date}-${t.message}`,
          message: `FIR ${f.firId}: ${t.message}`,
          date: new Date(t.date),
        });
      });
    });

    return items
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 12);
  }, [complaints, firs]);

  const combinedTimeline = React.useMemo(() => {
    if (!drawerFIR) return [];

    const items = [];

    // Include complaint timeline events (if available)
    const complaint = drawerFIR.linkedComplaint;
    if (complaint && complaint.timeline) {
      complaint.timeline.forEach((t) => {
        items.push({
          id: `complaint-${complaint._id}-${t.date}-${t.message}`,
          type: "Complaint",
          message: t.message,
          date: new Date(t.date),
        });
      });
    }

    // Include FIR timeline events
    (drawerFIR.timeline || []).forEach((t) => {
      items.push({
        id: `fir-${drawerFIR._id}-${t.date}-${t.message}`,
        type: "FIR",
        message: t.message,
        date: new Date(t.date),
      });
    });

    return items
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 20);
  }, [drawerFIR]);

  return (
    <>
      <Navbar />

      <div className="pro-layout">
        {/* SIDEBAR */}
        <div className="pro-sidebar">
          <h3>Crime</h3>

          {categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}

          <hr />
          
          <h3>Management</h3>
          <button onClick={() => window.location.href = "/review-complaints"} style={{ color: "#00b4d8" }}>
            📋 Review Complaints
          </button>
        </div>

        {/* MAIN */}
        <div className="pro-main">
          <h2>Filed FIRs</h2>

          {/* SEARCH */}
          <div className="pro-top">
            <input
              type="text"
              placeholder="Search FIR ID or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn"
              style={{ backgroundColor: "#00b4d8" }}
              onClick={autoAssignUnassigned}
              title="Auto-assign unassigned FIRs to officers"
            >
              Auto-assign
            </button>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Theft">Theft</option>
              <option value="Assault">Assault</option>
              <option value="Cyber Crime">Cyber Crime</option>
              <option value="Fraud">Fraud</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Registered">Registered</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Closed">Closed</option>
              <option value="Chargesheet Filed">Chargesheet Filed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="latest">Sort: Latest</option>
              <option value="oldest">Sort: Oldest</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </div>

          {/* STATS */}
          <div className="pro-stats">
            <div className="box">
              <p>Total</p>
              <h3>{derivedStats.total}</h3>
            </div>

            <div className="box" style={{ backgroundColor: "#1b1f2a" }}>
              <p>Conversion Rate</p>
              <h3>{conversionRate}%</h3>
            </div>

            <div className="box pending">
              <p>Registered</p>
              <h3>{derivedStats.registered}</h3>
            </div>

            <div className="box progress">
              <p>Under Investigation</p>
              <h3>{derivedStats.investigating}</h3>
            </div>

            <div className="box progress" style={{ backgroundColor: "#ff006e", color: "white" }}>
              <p>Chargesheet</p>
              <h3>{derivedStats.chargesheet}</h3>
            </div>

            <div className="box closed">
              <p>Closed</p>
              <h3>{derivedStats.closed}</h3>
            </div>
          </div>

          {/* ALERTS */}
          <div className="alerts-row">
            {alerts.unassigned > 0 && (
              <div className="alert-card" style={{ background: "rgba(255, 201, 71, 0.2)", color: "#ffb703" }}>
                ⚠ {alerts.unassigned} FIR{alerts.unassigned === 1 ? "" : "s"} unassigned
              </div>
            )}

            {alerts.pendingLonger > 0 && (
              <div className="alert-card">
                ⚠ {alerts.pendingLonger} FIR{alerts.pendingLonger === 1 ? "" : "s"} pending > 7 days
              </div>
            )}

            {alerts.highPriority > 0 && (
              <div className="alert-card" style={{ background: "#ff006e" }}>
                🚨 {alerts.highPriority} high priority FIR{alerts.highPriority === 1 ? "" : "s"}
              </div>
            )}

            {alerts.unassigned === 0 && alerts.pendingLonger === 0 && alerts.highPriority === 0 && (
              <div className="alert-card" style={{ background: "#0f172a" }}>
                ✅ All systems normal
              </div>
            )}
          </div>

          {/* OFFICER PERFORMANCE */}
          <div className="officer-performance" style={{ margin: "20px 0" }}>
            <h3>Officer Performance</h3>
            {officerStats.length === 0 ? (
              <p style={{ color: "#aaa" }}>No officers assigned yet.</p>
            ) : (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {officerStats.slice(0, 3).map((s) => (
                  <div
                    key={s.officer}
                    style={{
                      background: "#0f172a",
                      borderRadius: "10px",
                      padding: "15px",
                      minWidth: "200px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 6px 0" }}>{s.officer}</h4>
                    <p style={{ margin: "4px 0" }}>
                      Cases: <strong>{s.cases}</strong>
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      Open: <strong>{s.open}</strong>
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      Closed: <strong>{s.closed}</strong>
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      Avg res.: <strong>{s.avgDays ?? "—"} days</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHARTS */}
          <div className="charts">
            <div className="chart-box">
              <h3>Cases by Status</h3>

              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" outerRadius={80} label>
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>FIRs Filed (last 14 days)</h3>

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={firTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="filed" stroke="#00b4d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>Cases by Category</h3>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#00c2ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="activity-panel">
            <h3>Recent Activity</h3>
            <ul>
              {recentActivity.length === 0 ? (
                <li style={{ padding: "10px", color: "#aaa" }}>
                  No activity yet
                </li>
              ) : (
                recentActivity.map((item) => (
                  <li key={item.id}>
                    <span style={{ fontSize: "14px" }}>{item.message}</span>
                    <br />
                    <small style={{ color: "#888" }}>
                      {item.date.toLocaleString()}
                    </small>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* TABLE */}
          <div className="pro-table">
            <table>
              <thead>
                <tr>
                  <th>FIR ID</th>
                  <th>Description</th>
                  <th>Complainant</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                  <th>Change</th>
                  <th>Deadline</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredFIRs.map((fir) => {
                  const sla = getSLAInfo(fir);
                  return (
                    <tr
                      key={fir._id}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setDrawerFIR(fir);
                        setDrawerOpen(true);
                      }}
                    >
                    <td>
                      <a
                        href={`/fir/${fir._id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        style={{
                          color: "#00b4d8",
                          fontWeight: "600",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        title="Open FIR document"
                      >
                        {fir.firId || "N/A"}
                      </a>
                    </td>

                    <td>{(fir.description || "").substring(0, 60)}{(fir.description || "").length > 60 ? "..." : ""}</td>
                    <td>{fir.complainantName || "-"}</td>
                    <td>{fir.location || "-"}</td>
                    <td>{fir.category || "Other"}</td>

                    <td className={getStatusClass(fir.status)}>
                      {fir.status || "Registered"}
                    </td>

                    <td>{fir.assignedOfficer || "Unassigned"}</td>

                    {/* VERY IMPORTANT */}
                    {/* prevent row click when using dropdown */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        value={fir.status || "Registered"}
                        onChange={(e) => updateStatus(fir._id, e.target.value)}
                      >
                        <option value="Registered">Registered</option>
                        <option value="Under Investigation">Under Investigation</option>
                        <option value="Closed">Closed</option>
                        <option value="Chargesheet Filed">Chargesheet Filed</option>
                      </select>
                    </td>

                    <td>
                      {sla ? (
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            backgroundColor: sla.color,
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          {sla.label}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {fir.createdAt
                        ? new Date(fir.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                );
              })}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {drawerOpen && drawerFIR && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>FIR Details</h3>
              <button className="drawer-close" onClick={closeDrawer}>
                ✕
              </button>
            </div>

            <div className="drawer-body">
              <p>
                <strong>FIR ID:</strong> {drawerFIR.firId}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    backgroundColor: getStatusColor(drawerFIR.status),
                    padding: "4px 10px",
                    borderRadius: "999px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {drawerFIR.status}
                </span>
              </p>

              {(() => {
                const sla = getSLAInfo(drawerFIR);
                if (!sla) return null;
                return (
                  <p>
                    <strong>Deadline:</strong>{" "}
                    <span
                      style={{
                        backgroundColor: sla.color,
                        padding: "4px 10px",
                        borderRadius: "999px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {sla.label}
                    </span>
                  </p>
                );
              })()}
              <p>
                <strong>Complainant:</strong> {drawerFIR.complainantName || "-"}
              </p>
              <p>
                <strong>Location:</strong> {drawerFIR.location || "-"}
              </p>
              <p>
                <strong>Category:</strong> {drawerFIR.category}
              </p>
              <p>
                <strong>Priority:</strong> {getPriorityBadge(drawerFIR.priority)}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <strong>Assigned Officer:</strong>

                {assignMode ? (
                  <>
                    <input
                      value={assignInput}
                      onChange={(e) => setAssignInput(e.target.value)}
                      placeholder="Officer name"
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                    <button
                      className="btn"
                      style={{ backgroundColor: "#00b4d8" }}
                      onClick={() => assignOfficer(drawerFIR._id, assignInput)}
                    >
                      Save
                    </button>
                    <button
                      className="btn"
                      style={{ backgroundColor: "#333" }}
                      onClick={() => setAssignMode(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span>{drawerFIR.assignedOfficer || "Unassigned"}</span>
                    <button
                      className="btn"
                      style={{
                        backgroundColor: "rgba(0, 180, 216, 0.2)",
                        color: "#00b4d8",
                        fontWeight: 600,
                      }}
                      onClick={() => setAssignMode(true)}
                    >
                      Assign
                    </button>
                  </>
                )}
              </div>

              {/* Tags */}
              <div style={{ marginTop: "16px" }}>
                <h4>Tags</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                  {(drawerFIR.tags || []).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        background: "rgba(0, 180, 216, 0.15)",
                        color: "#00b4d8",
                        fontWeight: 600,
                      }}
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#00b4d8",
                          fontSize: "14px",
                        }}
                        aria-label={`Remove tag ${tag}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag (e.g. Urgent)"
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #333",
                      flex: 1,
                      background: "#0b2a4a",
                      color: "white",
                    }}
                  />
                  <button
                    className="btn"
                    style={{ backgroundColor: "#00b4d8" }}
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>

              {drawerFIR.linkedComplaint?.evidence?.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <h4>Evidence</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {drawerFIR.linkedComplaint.evidence.map((file, idx) => {
                      const fileUrl = `http://localhost:4000/${file}`;
                      const fileName = file.split("/").pop();
                      const image = isImage(fileName);

                      return (
                        <div
                          key={idx}
                          style={{
                            border: "1px solid #333",
                            borderRadius: "8px",
                            padding: "10px",
                            width: "140px",
                          }}
                        >
                          {image ? (
                            <img
                              src={fileUrl}
                              alt={fileName}
                              style={{
                                width: "100%",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                marginBottom: "8px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "80px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#0f172a",
                                color: "#fff",
                                borderRadius: "6px",
                                marginBottom: "8px",
                                fontSize: "12px",
                                textAlign: "center",
                                padding: "8px",
                              }}
                            >
                              {fileName}
                            </div>
                          )}

                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              textDecoration: "none",
                              color: "#00b4d8",
                              fontWeight: 600,
                            }}
                          >
                            ⬇ Download
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {recommendedFIRs.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <h4>Similar Cases</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {recommendedFIRs.map((f) => (
                      <div
                        key={f._id}
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: "rgba(0, 180, 216, 0.1)",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setDrawerFIR(f);
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <strong>{f.firId}</strong> • {f.category}
                          </div>
                          <div style={{ color: "#888", fontSize: "12px" }}>
                            {new Date(f.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ marginTop: "6px", color: "#aaa", fontSize: "13px" }}>
                          {f.location || "No location"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <hr />

              <h4>Internal Notes</h4>
              <textarea
                value={drawerNotes}
                onChange={(e) => setDrawerNotes(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #333" }}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button className="btn" onClick={saveInternalNotes}>
                  Save Notes
                </button>
                <button
                  className="btn"
                  style={{ background: "#00b4d8" }}
                  onClick={() => downloadFIR(drawerFIR._id, drawerFIR.firId)}
                  title="Download FIR as PDF"
                >
                  Download PDF
                </button>
                <button
                  className="btn"
                  style={{ background: "#333" }}
                  onClick={closeDrawer}
                >
                  Close
                </button>
              </div>

              {combinedTimeline.length > 0 && (
                <>
                  <h4 style={{ marginTop: "20px" }}>History</h4>
                  <div className="timeline" style={{ maxHeight: "220px", overflow: "auto" }}>
                    {combinedTimeline.map((t) => (
                      <div key={t.id} className="timeline-item">
                        <div className="dot"></div>
                        <div>
                          <p style={{ margin: 0 }}>
                            <strong style={{ color: "#00b4d8" }}>{t.type}:</strong> {t.message}
                            {t.actor && (
                              <span style={{ color: "#888", marginLeft: "6px" }}>
                                (by {t.actor})
                              </span>
                            )}
                          </p>
                          <small style={{ color: "#888" }}>
                            {t.date ? t.date.toLocaleString() : ""}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewFIRs;
