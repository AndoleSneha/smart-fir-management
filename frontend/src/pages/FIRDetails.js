import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function FIRDetails() {
  const [fir, setFir] = useState(null);

  const id = window.location.pathname.split("/")[2];

  useEffect(() => {
    fetchDetails();
  }, []);

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

  if (!fir) return <h2 style={{ color: "white" }}>Loading...</h2>;

  return (
    <>
      <Navbar />

      <div className="details-page">
        <h2>FIR Details</h2>

        <div className="details-card">
          <p><b>FIR ID:</b> {fir.firId}</p>
          <p><b>Status:</b> {fir.status}</p>
          <p><b>Category:</b> {fir.category}</p>
          <p><b>Email:</b> {fir.email}</p>
          <p><b>Date:</b> {new Date(fir.createdAt).toLocaleString()}</p>

          <hr />

          <h3>Description</h3>
          <p>{fir.description}</p>
        </div>
      </div>
    </>
  );
}

export default FIRDetails;
