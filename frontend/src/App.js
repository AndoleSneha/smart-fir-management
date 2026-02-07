import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import FileFIR from "./pages/FileFIR";
import ViewFIRs from "./pages/ViewFIRs";
import TrackFIR from "./pages/TrackFIR";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🏠 Public Home Page */}
        <Route path="/" element={<Home />} />

        {/* 🔐 Auth pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* 👤 Citizen routes */}
        <Route
          path="/file-fir"
          element={
            <ProtectedRoute roleRequired="citizen">
              <FileFIR />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-fir"
          element={
            <ProtectedRoute roleRequired="citizen">
              <TrackFIR />
            </ProtectedRoute>
          }
        />

        {/* 👮 Police/Admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roleRequired="police">
              <ViewFIRs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
