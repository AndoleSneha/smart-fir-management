import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";

function FileFIR() {
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (role === "police") {
      window.location.href = "/admin";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:4000/api/fir",
        { description, email },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      alert(
        `FIR Submitted Successfully!\nFIR ID: ${res.data.firId}\nCategory: ${res.data.category}`
      );

      setDescription("");
      setEmail("");
    } catch (error) {
      alert("Failed to submit FIR");
    }
  };

  return (
    <>
      <Navbar />
      <PageWrapper>
        <div className="card">
          <h2>File FIR</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <textarea
              placeholder="Enter FIR description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              required
            />

            <button type="submit" className="btn">
              Submit FIR
            </button>
          </form>
        </div>
      </PageWrapper>
    </>
  );
}

export default FileFIR;
