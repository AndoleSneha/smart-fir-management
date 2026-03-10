import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";

function FileFIR() {
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) window.location.href = "/login";
    if (role === "police") window.location.href = "/admin";
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEvidence(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // build form data including files
      const formData = new FormData();
      formData.append("description", description);
      formData.append("email", email);
      evidence.forEach((file) => formData.append("evidence", file));

      const res = await axios.post(
        "http://localhost:4000/api/complaints",
        formData,
        {
          headers: { 
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(`Complaint Submitted Successfully!\nID: ${res.data.complaintId}\n\nYour complaint has been submitted to the police for review.`);

      setDescription("");
      setEmail("");
      setEvidence([]);
      document.getElementById("evidenceInput").value = "";
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit complaint: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <PageWrapper>
        <div className="card">
          <h2>File a Complaint</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Submit a complaint to the police. Your complaint will be reviewed by officers and may be converted to an FIR if approved.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <textarea
              placeholder="Describe your complaint in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              required
            />

            <div>
              <label htmlFor="evidenceInput" style={{ display: "block", marginBottom: "10px", fontWeight: "bold", color: "#333" }}>
                📎 Attach Evidence (Images, Documents, etc.)
              </label>
              <input
                id="evidenceInput"
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                style={{
                  display: "block",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  width: "100%",
                  boxSizing: "border-box",
                  marginBottom: "10px",
                }}
              />
              {evidence.length > 0 && (
                <p style={{ color: "#2ec4b6", fontSize: "14px" }}>
                  ✓ {evidence.length} file(s) selected
                </p>
              )}
            </div>

            <p style={{ color: "#999", fontSize: "12px" }}>
              The category will be automatically determined based on your complaint description.
            </p>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </PageWrapper>
    </>
  );
}

export default FileFIR;
