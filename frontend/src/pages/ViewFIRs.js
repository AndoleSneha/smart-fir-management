import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function ViewFIRs() {
  const [firs, setFirs] = useState([]);

  // 🔐 AUTH + INITIAL LOAD
  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "police") {
      window.location.href = "/login";
    } else {
      fetchFIRs();
    }
  }, []);

  // 📥 FETCH ALL FIRs (JWT protected)
  const fetchFIRs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:4000/api/fir", {
        headers: {
          Authorization: token,
        },
      });

      setFirs(res.data);
    } catch (error) {
      alert("Unauthorized access. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  // 🔄 UPDATE FIR STATUS
  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:4000/api/fir/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      fetchFIRs();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <>
      {/* 🔹 NAVBAR */}
      <Navbar />

      {/* 🔹 ADMIN DASHBOARD CARD */}
      <div className="container">
        <h2>Admin / Police Dashboard</h2>

        <table>
          <thead>
            <tr>
              <th>FIR ID</th>
              <th>Description</th>
              <th>Category</th>
              <th>Status</th>
              <th>Change Status</th>
              <th>Date & Time</th>
            </tr>
          </thead>

          <tbody>
            {firs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No FIRs Found
                </td>
              </tr>
            ) : (
              firs.map((fir) => (
                <tr key={fir._id}>
                  <td>{fir.firId || "N/A"}</td>
                  <td>{fir.description}</td>
                  <td>{fir.category}</td>
                  <td className={`status-${fir.status.toLowerCase().replace(" ", "")}`}>
  {fir.status}
</td>

                  <td>
                    <select
                      value={fir.status}
                      onChange={(e) =>
                        updateStatus(fir._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td>{new Date(fir.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ViewFIRs;
