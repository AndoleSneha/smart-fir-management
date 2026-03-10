import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";

function TrackFIR() {
  const [searchId, setSearchId] = useState("");
  const [searchType, setSearchType] = useState("complaint"); // complaint or fir
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let response;
      if (searchType === "complaint") {
        response = await axios.get(
          `http://localhost:4000/api/complaints/track/${searchId}`
        );
        response.data.type = "complaint";
      } else {
        response = await axios.get(
          `http://localhost:4000/api/fir/track/${searchId}`
        );
        response.data.type = "fir";
      }
      setResult(response.data);
    } catch (err) {
      setError(`${searchType === "complaint" ? "Complaint" : "FIR"} not found`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
      case "Registered":
        return "#ffb703";
      case "Under Review":
      case "Under Investigation":
        return "#00b4d8";
      case "Approved":
        return "#2ec4b6";
      case "FIR Filed":
        return "#00d9ff";
      case "Rejected":
        return "#ff006e";
      case "Closed":
        return "#888";
      case "Chargesheet Filed":
        return "#00d9ff";
      default:
        return "#999";
    }
  };

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="card">
          <h2>Track Complaint or FIR</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Enter your Complaint ID or FIR ID to track the status of your case.
          </p>

          <form onSubmit={handleTrack}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  flex: "0.3",
                }}
              >
                <option value="complaint">Track Complaint</option>
                <option value="fir">Track FIR</option>
              </select>

              <input
                type="text"
                placeholder={
                  searchType === "complaint"
                    ? "Enter Complaint ID (e.g. CMP-2026-0001)"
                    : "Enter FIR ID (e.g. FIR-2026-0001)"
                }
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{ flex: 1 }}
                required
              />

              <button
                type="submit"
                className="btn"
                disabled={loading}
                style={{ flex: "0.3" }}
              >
                {loading ? "Searching..." : "Track"}
              </button>
            </div>
          </form>

          {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}

          {result && (
            <div style={{ marginTop: "20px" }}>
              {result.type === "complaint" ? (
                <>
                  <h3>📋 Complaint Details</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold", width: "30%" }}>
                          Complaint ID:
                        </td>
                        <td style={{ padding: "10px" }}>{result.complaintId}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Status:
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span
                            style={{
                              backgroundColor: getStatusColor(result.status),
                              color: "white",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            {result.status}
                          </span>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Category:
                        </td>
                        <td style={{ padding: "10px" }}>{result.category}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Priority:
                        </td>
                        <td style={{ padding: "10px" }}>{result.priority || "Not Set"}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Assigned Officer:
                        </td>
                        <td style={{ padding: "10px" }}>
                          {result.assignedOfficer || "Not Assigned"}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Submitted On:
                        </td>
                        <td style={{ padding: "10px" }}>
                          {new Date(result.createdAt).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Description:
                        </td>
                        <td style={{ padding: "10px" }}>{result.description}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Linked FIR */}
                  {result.linkedFIR && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "15px",
                        backgroundColor: "#e8f4f8",
                        borderRadius: "6px",
                        borderLeft: "4px solid #00b4d8",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px 0", color: "#00b4d8" }}>
                        📋 Linked FIR
                      </h4>
                      <p>
                        <strong>FIR ID:</strong> {result.linkedFIR.firId}
                      </p>
                      <p>
                        <strong>Status:</strong> {result.linkedFIR.status}
                      </p>
                      <p>
                        <strong>Assigned Officer:</strong>{" "}
                        {result.linkedFIR.assignedOfficer || "Not Assigned"}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3>📄 FIR Details</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold", width: "30%" }}>
                          FIR ID:
                        </td>
                        <td style={{ padding: "10px" }}>{result.firId}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Status:
                        </td>
                        <td style={{ padding: "10px" }}>
                          <span
                            style={{
                              backgroundColor: getStatusColor(result.status),
                              color: "white",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              fontWeight: "bold",
                            }}
                          >
                            {result.status}
                          </span>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Category:
                        </td>
                        <td style={{ padding: "10px" }}>{result.category}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Priority:
                        </td>
                        <td style={{ padding: "10px" }}>{result.priority || "Not Set"}</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Assigned Officer:
                        </td>
                        <td style={{ padding: "10px" }}>
                          {result.assignedOfficer || "Not Assigned"}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Registered On:
                        </td>
                        <td style={{ padding: "10px" }}>
                          {new Date(result.createdAt).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>
                          Description:
                        </td>
                        <td style={{ padding: "10px" }}>{result.description}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}

              {/* Timeline */}
              {result.timeline && result.timeline.length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "6px",
                  }}
                >
                  <h4>📅 Timeline</h4>
                  {result.timeline.map((event, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px",
                        borderLeft: "3px solid #00b4d8",
                        marginBottom: "10px",
                        paddingLeft: "15px",
                      }}
                    >
                      <p style={{ margin: "0", fontWeight: "bold", color: "#00b4d8" }}>
                        {new Date(event.date).toLocaleString()}
                      </p>
                      <p style={{ margin: "5px 0 0 0", color: "#333" }}>
                        {event.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

export default TrackFIR;
