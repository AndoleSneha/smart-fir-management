import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      {/* Click title → go home */}
      <h3 style={styles.title} onClick={() => navigate("/")}>
        FIR Management System
      </h3>

      <div style={styles.buttons}>
        {/* NOT LOGGED IN */}
        {!token && (
          <>
            <button style={styles.btn} onClick={() => navigate("/login")}>
              Login
            </button>
            <button style={styles.btn} onClick={() => navigate("/register")}>
              Register
            </button>
          </>
        )}

        {/* CITIZEN */}
        {token && role === "citizen" && (
          <>
            <button
              style={isActive("/file-fir") ? styles.activeBtn : styles.btn}
              onClick={() => navigate("/file-fir")}
            >
              File Complaint
            </button>

            <button
              style={isActive("/my-complaints") ? styles.activeBtn : styles.btn}
              onClick={() => navigate("/my-complaints")}
            >
              My Complaints
            </button>

            <button
              style={isActive("/track-fir") ? styles.activeBtn : styles.btn}
              onClick={() => navigate("/track-fir")}
            >
              Track Status
            </button>

            <button style={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </>
        )}

        {/* POLICE */}
        {token && role === "police" && (
          <>
            <button
              style={isActive("/review-complaints") ? styles.activeBtn : styles.btn}
              onClick={() => navigate("/review-complaints")}
            >
              Review Complaints
            </button>

            <button
              style={isActive("/admin") ? styles.activeBtn : styles.btn}
              onClick={() => navigate("/admin")}
            >
              Filed FIRs
            </button>

            <button style={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    alignItems: "center",
    color: "white",
  },
  title: {
    margin: 0,
    cursor: "pointer",
  },
  buttons: {
    display: "flex",
    gap: "10px",
  },
  btn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #00c2ff",
    background: "transparent",
    color: "#00c2ff",
    cursor: "pointer",
  },
  activeBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#00c2ff",
    color: "white",
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#ff4d4f",
    color: "white",
    cursor: "pointer",
  },
};

export default Navbar;
