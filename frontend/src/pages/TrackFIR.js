import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";

function TrackFIR() {
  const [firId, setFirId] = useState("");
  const [fir, setFir] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    setFir(null);

    try {
      const res = await axios.get(
        `http://localhost:4000/api/fir/track/${firId}`
      );
      setFir(res.data);
    } catch (err) {
      setError("FIR not found");
    }
  };

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="card">
          <h2>Track FIR</h2>

          <form onSubmit={handleTrack}>
            <input
              type="text"
              placeholder="Enter FIR ID (e.g. FIR-2026-0001)"
              value={firId}
              onChange={(e) => setFirId(e.target.value)}
              required
            />

            <button type="submit" className="btn">
              Track FIR
            </button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {fir && (
            <div style={{ marginTop: "20px" }}>
              <p><b>FIR ID:</b> {fir.firId}</p>
              <p><b>Description:</b> {fir.description}</p>
              <p><b>Category:</b> {fir.category}</p>
              <p><b>Status:</b> {fir.status}</p>
              <p>
                <b>Date:</b>{" "}
                {new Date(fir.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

export default TrackFIR;
