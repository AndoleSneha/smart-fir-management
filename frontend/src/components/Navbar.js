import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <h3 style={styles.title}>FIR Management System</h3>

      <div style={styles.buttons}>
        {/* NOT LOGGED IN */}
        {!token && (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </>
        )}

        {/* CITIZEN */}
        {token && role === "citizen" && (
          <>
            <button onClick={() => navigate("/file-fir")}>File FIR</button>
            <button onClick={() => navigate("/track-fir")}>Track FIR</button>
            <button onClick={logout}>Logout</button>
          </>
        )}

        {/* POLICE */}
        {token && role === "police" && (
          <>
            <button onClick={() => navigate("/admin")}>
              Admin Dashboard
            </button>
            <button onClick={logout}>Logout</button>
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
    background: "#f5f5f5",
    alignItems: "center",
  },
  title: {
    margin: 0,
  },
  buttons: {
    display: "flex",
    gap: "10px",
  },
};

export default Navbar;
