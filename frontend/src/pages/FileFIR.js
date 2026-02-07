import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import { CATEGORIES } from "../constants/categories";

function FileFIR() {
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Other");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) window.location.href = "/login";
    if (role === "police") window.location.href = "/admin";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:4000/api/fir",
        { description, email, category },
        {
          headers: { Authorization: token },
        }
      );

      alert(`FIR Submitted!\nID: ${res.data.firId}`);

      setDescription("");
      setEmail("");
      setCategory("Other");
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

            {/* ⭐ CATEGORY DROPDOWN ⭐ */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

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
