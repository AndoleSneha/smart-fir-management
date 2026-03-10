import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

function FIRDetails() {
  const { id } = useParams();

  const [fir, setFir] = useState(null);
  const [comment, setComment] = useState("");

  /* ================= FETCH ================= */
  const fetchDetails = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:4000/api/fir/${id}`,
        { headers: { Authorization: token } }
      );

      setFir(res.data);
    } catch {
      alert("Error loading FIR");
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();

    // 🚀 LIVE REFRESH every 10 sec
    const interval = setInterval(fetchDetails, 10000);
    return () => clearInterval(interval);
  }, [fetchDetails]);

  /* ================= ADD COMMENT ================= */
  const addComment = async () => {
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:4000/api/fir/${id}/comment`,
        { comment },
        { headers: { Authorization: token } }
      );

      setComment("");
      fetchDetails();
    } catch {
      alert("Failed to add comment");
    }
  };

  /* ================= ASSIGN OFFICER ================= */
  const assignOfficer = async (officer) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:4000/api/fir/${id}/assign`,
        { officer },
        { headers: { Authorization: token } }
      );

      fetchDetails();
    } catch {
      alert("Assignment failed");
    }
  };

  const downloadFIRPdf = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:4000/api/fir/${id}/download`,
        {
          headers: { Authorization: token },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `FIR-${fir.firId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download FIR PDF");
    }
  };

  if (!fir) return <h2 style={{ color: "white", padding: 20 }}>Loading...</h2>;

  return (
    <>
      <Navbar />

      <div className="details-page">
        <div className="details-card ministry">

          {/* HEADER */}
          <div className="fir-header">
            <h1>POLICE DEPARTMENT</h1>
            <h2>FIRST INFORMATION REPORT</h2>
          </div>

          {/* BASIC INFO */}
          <div className="fir-section">
            <p><b>FIR Number:</b> {fir.firId}</p>
            <p>
              <b>Date:</b>{" "}
              {fir.createdAt
                ? new Date(fir.createdAt).toLocaleString()
                : "-"}
            </p>

            <p>
              <b>Status:</b>{" "}
              <span className={`status-${(fir.status || "")
                .toLowerCase()
                .replace(" ", "")}`}>
                {fir.status}
              </span>
            </p>

            <p><b>Category:</b> {fir.category}</p>
            <p><b>Complainant Name:</b> {fir.complainantName || "-"}</p>
            <p><b>Contact Email:</b> {fir.email || "-"}</p>
            <p><b>Location:</b> {fir.location || "-"}</p>
            {/* ⭐ PRIORITY */}
            <p>
              <b>Priority:</b>{" "}
              <span className={`priority ${fir.priority || "medium"}`}>
                {fir.priority || "Medium"}
              </span>
            </p>

            {/* ⭐ ASSIGNED OFFICER */}
            <p>
              <b>Assigned Officer:</b>{" "}
              {fir.assignedOfficer || "Unassigned"}
            </p>
          </div>

          {/* ASSIGN */}
          <div className="assign-box no-print">
            <h3>Assign Officer</h3>
            <select
              onChange={(e) => assignOfficer(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Select officer
              </option>
              <option>Inspector Raj</option>
              <option>Inspector Sharma</option>
              <option>SI Kavya</option>
            </select>
          </div>


          {/* DESCRIPTION */}
          <div className="fir-section">
            <h3>Complaint Details</h3>
            <div className="description-box">
              {fir.description}
            </div>
          </div>

          <hr />

          {/* COMMENT */}
          <div className="comment-box no-print">
            <h3>Add Investigation Note</h3>

            <textarea
              placeholder="Write comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button onClick={addComment}>Add</button>
          </div>

          {/* TIMELINE */}
          <h3>Case Timeline</h3>

          <div className="timeline">
            {!fir.timeline || fir.timeline.length === 0 ? (
              <p>No updates yet</p>
            ) : (
              fir.timeline.map((t, index) => (
                <div key={index} className="timeline-item">
                  <div className="dot"></div>
                  <div>
                    <p>{t.message}</p>
                    <small>
                      {t.date
                        ? new Date(t.date).toLocaleString()
                        : ""}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER */}
          <div className="fir-footer">
            <div>
              <p>Officer Name:</p>
              <div className="line"></div>
            </div>

            <div>
              <p>Signature:</p>
              <div className="line"></div>
            </div>

            <div>
              <p>Station Seal:</p>
              <div className="seal"></div>
            </div>
          </div>

          {/* PRINT */}
          <div className="actions no-print">
            <button onClick={() => window.print()}>
              🖨 Print / Save PDF
            </button>
            <button onClick={downloadFIRPdf} style={{ marginLeft: 12 }}>
              📄 Export FIR PDF
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default FIRDetails;
