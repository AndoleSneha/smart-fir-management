import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

function FIRDetails() {
  const { id } = useParams();
  const [fir, setFir] = useState(null);

  useEffect(() => {
  const fetchDetails = async () => {
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
  };

  fetchDetails();
}, [id]);


  const fetchDetails = async () => {
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
  };

  if (!fir) return <h2 style={{ color: "white", padding: 20 }}>Loading...</h2>;

  return (
  <>
    <Navbar />

    <div className="details-page">
      <div className="details-card">

        {/* HEADER */}
        <div className="fir-header">
          <h1>POLICE DEPARTMENT</h1>
          <h2>FIRST INFORMATION REPORT</h2>
        </div>

        {/* BASIC INFO */}
        <div className="fir-section">
          <p><b>FIR Number:</b> {fir.firId}</p>
          <p><b>Date:</b> {new Date(fir.createdAt).toLocaleString()}</p>
          <p><b>Status:</b> {fir.status}</p>
          <p><b>Category:</b> {fir.category}</p>
        </div>

        {/* COMPLAINANT */}
        <div className="fir-section">
          <p><b>Complainant Email:</b> {fir.email}</p>
        </div>

        <hr />

        {/* DESCRIPTION */}
        <div className="fir-section">
          <h3>Complaint Details</h3>
          <div className="description-box">
            {fir.description}
          </div>
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

        {/* PRINT BUTTON */}
        <div className="actions">
          <button onClick={() => window.print()}>
            🖨 Print / Save PDF
          </button>
        </div>

      </div>
    </div>
  </>
);


}

export default FIRDetails;
