import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import FileFIR from "./pages/FileFIR";
import MyComplaints from "./pages/MyComplaints";
import ViewFIRs from "./pages/ViewFIRs";
import ReviewComplaints from "./pages/ReviewComplaints";
import TrackFIR from "./pages/TrackFIR";
import FIRDetails from "./pages/FIRDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* CITIZEN */}
        <Route
          path="/file-fir"
          element={
            <ProtectedRoute roleRequired="citizen">
              <FileFIR />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute roleRequired="citizen">
              <MyComplaints />
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

        {/* POLICE */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roleRequired="police">
              <ViewFIRs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review-complaints"
          element={
            <ProtectedRoute roleRequired="police">
              <ReviewComplaints />
            </ProtectedRoute>
          }
        />

        {/* FIR DETAILS */}
        <Route
          path="/fir/:id"
          element={
            <ProtectedRoute roleRequired="police">
              <FIRDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
