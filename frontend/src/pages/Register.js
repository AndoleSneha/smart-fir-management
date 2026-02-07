import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:4000/api/auth/register", {
        name,
        email,
        password,
        role: "citizen", // ⭐ important
      });

      alert("✅ Registration successful! Please login.");

      // clear form
      setName("");
      setEmail("");
      setPassword("");

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "❌ Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <PageWrapper>
        <div className="card">
          <h2>Register</h2>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p style={{ marginTop: "20px", textAlign: "center" }}>
            Already have an account?{" "}
            <span
              style={{ color: "#00c2ff", cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </PageWrapper>
    </>
  );
}

export default Register;
