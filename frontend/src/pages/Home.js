import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="overlay">
        <h1>Smart FIR Management System</h1>
        <p>AI-Powered • Secure • Transparent Crime Reporting</p>

        <div className="features">
          <span>✔ AI Category Detection</span>
          <span>✔ FIR Tracking</span>
          <span>✔ Email Notifications</span>
        </div>

        <div className="actions">
          <button onClick={() => navigate("/login")} className="btn primary">
            Login
          </button>
          <button onClick={() => navigate("/register")} className="btn outline">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
