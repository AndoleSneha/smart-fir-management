import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:4000/api/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful! Please login.");
      window.location.href = "/login";
    } catch (error) {
      alert(
        error.response?.data?.message || "Registration failed"
      );
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

            <button type="submit" className="btn">
              Register
            </button>
          </form>

          <p style={{ marginTop: "20px", textAlign: "center" }}>
            Already have an account?{" "}
            <span
              style={{ color: "#00c2ff", cursor: "pointer" }}
              onClick={() => (window.location.href = "/login")}
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
