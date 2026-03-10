import React, { useEffect, useState } from "react";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ReviewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    filed: 0,
  });

  // 🔐 AUTH
  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "police") {
      window.location.href = "/login";
    } else {
      fetchComplaints();
    }
  }, []);

  // 📥 FETCH ALL COMPLAINTS
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:4000/api/complaints", {
        headers: { Authorization: token },
      });

      const data = res.data || [];
      setComplaints(data);

      setStats({
        total: data.length,
        submitted: data.filter((c) => c.status === "Submitted").length,
        underReview: data.filter((c) => c.status === "Under Review").length,
        approved: data.filter((c) => c.status === "Approved").length,
        rejected: data.filter((c) => c.status === "Rejected").length,
        // Count complaints that have an FIR linked (regardless of whether status is already updated)
        filed: data.filter((c) => c.status === "FIR Filed" || c.linkedFIR).length,
      });
    } catch {
      alert("Failed to fetch complaints");
    }
  };

  // 🔄 UPDATE COMPLAINT STATUS
  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:4000/api/complaints/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: token } }
      );

      fetchComplaints();
    } catch {
      alert("Failed to update complaint status");
    }
  };

  // 📝 FILE FIR FROM COMPLAINT
  const fileFirefromComplaint = async (complaintId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:4000/api/fir/${complaintId}`,
        { remarks: "" },
        { headers: { Authorization: token } }
      );

      alert(`FIR Filed Successfully!\nFIR ID: ${response.data.firId}`);
      setShowModal(false);
      setStatusFilter("Active");
      fetchComplaints();
      window.location.href = "/admin";
    } catch (error) {
      const apiMsg =
        error.response?.data?.error || error.response?.data?.message;

      if (apiMsg && apiMsg.toLowerCase().includes("fir already filed")) {
        alert("FIR already filed for this complaint. Refreshing list...");
        setShowModal(false);
        fetchComplaints();
        return;
      }

      alert(`Failed to file FIR: ${apiMsg || error.message}`);
    }
  };

  // ⭐ FILTER
  let filteredComplaints = complaints;

  if (selectedCategory !== "All") {
    filteredComplaints = filteredComplaints.filter(
      (c) => (c.category || "Other") === selectedCategory
    );
  }

  if (statusFilter === "Active") {
    filteredComplaints = filteredComplaints.filter((c) => c.status !== "FIR Filed");
  } else if (statusFilter !== "All") {
    filteredComplaints = filteredComplaints.filter((c) => c.status === statusFilter);
  }

  if (startDate) {
    const start = new Date(startDate);
    filteredComplaints = filteredComplaints.filter((c) => {
      const created = new Date(c.createdAt);
      return created >= start;
    });
  }

  if (endDate) {
    const end = new Date(endDate);
    filteredComplaints = filteredComplaints.filter((c) => {
      const created = new Date(c.createdAt);
      return created <= end;
    });
  }

  if (search) {
    filteredComplaints = filteredComplaints.filter(
      (c) =>
        (c.complaintId || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "")
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }

  // SORT
  filteredComplaints = filteredComplaints.sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sortBy === "oldest" ? aTime - bTime : bTime - aTime;
  });

  // ⭐ CHART DATA
  const statusData = [
    { name: "Submitted", value: stats.submitted },
    { name: "Under Review", value: stats.underReview },
    { name: "Approved", value: stats.approved },
    { name: "FIR Filed", value: stats.filed },
    { name: "Rejected", value: stats.rejected },
  ];

  const categoryMap = {};
  complaints.forEach((c) => {
    const cat = c.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const categoryData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const COLORS = ["#ffb703", "#00b4d8", "#2ec4b6", "#ff006e", "#8e44ad"];

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
      Submitted: "pending",
      "Under Review": "inprogress",
      Approved: "registered",
      "FIR Filed": "firfiled",
      Rejected: "rejected",
    };

    return `status-${mapping[status] || "pending"}`;
  };

  return (
    <>
      <Navbar />

      <div className="pro-layout">
        {/* SIDEBAR */}
        <div className="pro-sidebar">
          <h3>Categories</h3>

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
          <h2>Review Complaints</h2>

          {/* SEARCH */}
          <div className="pro-top">
            <input
              type="text"
              placeholder="Search Complaint ID or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Active">Active (excludes FIR Filed)</option>
              <option value="All">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="FIR Filed">FIR Filed</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 150 }}
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
              <h3>{stats.total}</h3>
            </div>

            <div className="box pending">
              <p>Submitted</p>
              <h3>{stats.submitted}</h3>
            </div>

            <div className="box progress">
              <p>Under Review</p>
              <h3>{stats.underReview}</h3>
            </div>

            <div className="box closed">
              <p>Approved</p>
              <h3>{stats.approved}</h3>
            </div>

            <div className="box" style={{ backgroundColor: "#005f73", color: "white" }}>
              <p>FIR Filed</p>
              <h3>{stats.filed}</h3>
            </div>
          </div>

          {/* CHARTS */}
          <div className="charts">
            <div className="chart-box">
              <h3>Complaints by Status</h3>

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
              <h3>Complaints by Category</h3>

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
                  <th>Complaint ID</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>FIR ID</th>
                  <th>Change</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>{complaint.complaintId || "N/A"}</td>
                    <td>{(complaint.description || "").substring(0, 50)}...</td>
                    <td>{complaint.category || "Other"}</td>

                    <td className={getStatusClass(complaint.status || "Submitted")}> 
                      {complaint.status || "Submitted"}
                    </td>

                    <td>
                      {complaint.linkedFIR?.firId ? (
                        <a
                          href={`/fir/${complaint.linkedFIR._id}`}
                          style={{ color: "#00b4d8" }}
                        >
                          {complaint.linkedFIR.firId}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      {complaint.status === "FIR Filed" ? (
                        <span style={{ color: "#00d9ff", fontWeight: "bold" }}>
                          FIR Filed
                        </span>
                      ) : (
                        <select
                          value={complaint.status || "Submitted"}
                          onChange={(e) =>
                            updateStatus(complaint._id, e.target.value)
                          }
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      )}
                    </td>

                    <td>
                      {complaint.createdAt
                        ? new Date(complaint.createdAt).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowModal(true);
                        }}
                        disabled={complaint.status !== "Approved"}
                        title={
                          complaint.status === "Approved"
                            ? "Convert approved complaint into FIR"
                            : "Only approved complaints can be filed as FIR"
                        }
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "none",
                          background:
                            complaint.status === "Approved"
                              ? "#00b4d8"
                              : "rgba(0, 180, 216, 0.4)",
                          color: "white",
                          cursor:
                            complaint.status === "Approved"
                              ? "pointer"
                              : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        📄➜🚔
                        <span style={{ fontWeight: 600 }}>File FIR</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedComplaint && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "500px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3>File FIR from Complaint?</h3>
            <p>
              <strong>Complaint ID:</strong> {selectedComplaint.complaintId}
            </p>
            <p>
              <strong>Category:</strong> {selectedComplaint.category}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {selectedComplaint.description.substring(0, 100)}...
            </p>

            {selectedComplaint.evidence && selectedComplaint.evidence.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong>Evidence:</strong>
                <ul>
                  {selectedComplaint.evidence.map((file, idx) => (
                    <li key={idx}>
                      <a
                        href={`http://localhost:4000/${file}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View file {idx + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  fileFirefromComplaint(selectedComplaint.complaintId)
                }
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#00b4d8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                File FIR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReviewComplaints;
