import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ViewFIRs() {
  const navigate = useNavigate();

  const [firs, setFirs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    closed: 0,
  });

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

  // 📥 FETCH
  const fetchFIRs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:4000/api/fir", {
        headers: { Authorization: token },
      });

      const data = res.data || [];
      setFirs(data);

      setStats({
        total: data.length,
        pending: data.filter((f) => (f.status || "Pending") === "Pending")
          .length,
        inProgress: data.filter(
          (f) => (f.status || "Pending") === "In Progress"
        ).length,
        closed: data.filter((f) => (f.status || "Pending") === "Closed")
          .length,
      });
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
      alert("Failed");
    }
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
      (f) => (f.status || "Pending") === statusFilter
    );
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

  // ⭐ CHART DATA
  const statusData = [
    { name: "Pending", value: stats.pending },
    { name: "In Progress", value: stats.inProgress },
    { name: "Closed", value: stats.closed },
  ];

  const categoryMap = {};
  firs.forEach((f) => {
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
        </div>

        {/* MAIN */}
        <div className="pro-main">
          <h2>All Cases</h2>

          {/* SEARCH */}
          <div className="pro-top">
            <input
              type="text"
              placeholder="Search FIR ID or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* STATS */}
          <div className="pro-stats">
            <div className="box">
              <p>Total</p>
              <h3>{stats.total}</h3>
            </div>

            <div className="box pending">
              <p>Pending</p>
              <h3>{stats.pending}</h3>
            </div>

            <div className="box progress">
              <p>In Progress</p>
              <h3>{stats.inProgress}</h3>
            </div>

            <div className="box closed">
              <p>Closed</p>
              <h3>{stats.closed}</h3>
            </div>
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
              <h3>Cases by Category</h3>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#00c2ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLE */}
          <div className="pro-table">
            <table>
              <thead>
                <tr>
                  <th>FIR ID</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Change</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
  {filteredFIRs.map((fir) => (
    <tr
      key={fir._id}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/fir/${fir._id}`)}
    >
      <td>{fir.firId || "N/A"}</td>
      <td>{fir.description || "-"}</td>
      <td>{fir.category || "Other"}</td>

      <td
        className={`status-${(fir.status || "Pending")
          .toLowerCase()
          .replace(" ", "")}`}
      >
        {fir.status || "Pending"}
      </td>

      {/* VERY IMPORTANT */}
      {/* prevent row click when using dropdown */}
      <td onClick={(e) => e.stopPropagation()}>
        <select
          value={fir.status || "Pending"}
          onChange={(e) => updateStatus(fir._id, e.target.value)}
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Closed</option>
        </select>
      </td>

      <td>
        {fir.createdAt
          ? new Date(fir.createdAt).toLocaleString()
          : "-"}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewFIRs;
