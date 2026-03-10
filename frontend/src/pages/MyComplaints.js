import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import "../styles/card.css";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "citizen") {
      window.location.href = "/login";
    } else {
      fetchComplaints();
    }
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:4000/api/complaints/my-complaints",
        {
          headers: { Authorization: token },
        }
      );

      setComplaints(res.data || []);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "#ffb703";
      case "Under Review":
        return "#00b4d8";
      case "Approved":
        return "#2ec4b6";
      case "Rejected":
        return "#ff006e";
      case "FIR Filed":
        return "#00d9ff";
      default:
        return "#999";
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <PageWrapper>
          <div className="card">
            <h2>My Complaints</h2>
            <p>Loading...</p>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="card">
          <h2>My Complaints & FIRs</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Track the status of your submitted complaints and any filed FIRs.
          </p>

          {complaints.length === 0 ? (
            <p>You haven't submitted any complaints yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setExpandedId(expandedId === complaint._id ? null : complaint._id)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 8px 0" }}>
                        {complaint.complaintId}
                      </h4>
                      <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                        {complaint.description.substring(0, 80)}...
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          backgroundColor: getStatusColor(complaint.status),
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {complaint.status}
                      </span>
                      <p style={{ margin: "8px 0 0 0", color: "#999", fontSize: "12px" }}>
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* EXPANDED VIEW */}
                  {expandedId === complaint._id && (
                    <div
                      style={{
                        marginTop: "15px",
                        paddingTop: "15px",
                        borderTop: "1px solid #ddd",
                      }}
                    >
                      <p>
                        <b>Full Description:</b> {complaint.description}
                      </p>

                      <p>
                        <b>Category:</b> {complaint.category}
                      </p>

                      <p>
                        <b>Priority:</b> {complaint.priority || "Not Set"}
                      </p>

                      <p>
                        <b>Assigned Officer:</b>{" "}
                        {complaint.assignedOfficer || "Not Assigned"}
                      </p>

                      {complaint.remarks && (
                        <p>
                          <b>Remarks:</b> {complaint.remarks}
                        </p>
                      )}

                      {/* EVIDENCE LINKS */}
                      {complaint.evidence && complaint.evidence.length > 0 && (
                        <div style={{ marginTop: "10px" }}>
                          <b>Evidence:</b>
                          <ul>
                            {complaint.evidence.map((file, idx) => (
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

                      {/* LINKED FIR */}
                      {complaint.linkedFIR && (
                        <div
                          style={{
                            backgroundColor: "#e8f4f8",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "15px",
                          }}
                        >
                          <h4 style={{ margin: "0 0 10px 0", color: "#00b4d8" }}>
                            📋 Linked FIR
                          </h4>

                          <p style={{ margin: "5px 0" }}>
                            <b>FIR ID:</b> {complaint.linkedFIR.firId}
                          </p>

                          <p style={{ margin: "5px 0" }}>
                            <b>FIR Status:</b> {complaint.linkedFIR.status}
                          </p>

                          <p style={{ margin: "5px 0" }}>
                            <b>Assigned Officer:</b>{" "}
                            {complaint.linkedFIR.assignedOfficer || "Not Assigned"}
                          </p>

                          {complaint.linkedFIR.remarks && (
                            <p style={{ margin: "5px 0" }}>
                              <b>Remarks:</b> {complaint.linkedFIR.remarks}
                            </p>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/fir/${complaint.linkedFIR._id}`;
                            }}
                            style={{
                              marginTop: "10px",
                              padding: "8px 16px",
                              backgroundColor: "#00b4d8",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            View FIR Details
                          </button>
                        </div>
                      )}

                      {/* TIMELINE */}
                      {complaint.timeline && complaint.timeline.length > 0 && (
                        <div
                          style={{
                            backgroundColor: "#f0f0f0",
                            padding: "12px",
                            borderRadius: "6px",
                            marginTop: "15px",
                          }}
                        >
                          <h4 style={{ margin: "0 0 10px 0" }}>📅 Timeline</h4>

                          {complaint.timeline.map((event, idx) => (
                            <p
                              key={idx}
                              style={{
                                margin: "6px 0",
                                fontSize: "14px",
                                color: "#666",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>
                                {new Date(event.date).toLocaleString()}:
                              </span>{" "}
                              {event.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

export default MyComplaints;
