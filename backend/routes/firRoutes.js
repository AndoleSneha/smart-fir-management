const express = require("express");
const router = express.Router();
const FIR = require("../models/FIR");
const auth = require("../middleware/authMiddleware");
const axios = require("axios");
const sendEmail = require("../utils/sendEmail");




/* ===============================
   FILE FIR (Citizen only)
================================ */
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({ error: "Only citizens can file FIR" });
    }

    const { description, email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const count = await FIR.countDocuments();
    const year = new Date().getFullYear();
    const firId = `FIR-${year}-${String(count + 1).padStart(4, "0")}`;

    const mlRes = await axios.post("http://127.0.0.1:5001/predict", {
      description,
    });

    const category = mlRes.data.category || "Uncategorized";


    const fir = new FIR({
      firId,
      description,
      category,
      status: "Pending",
      email, // ✅ SAVE EMAIL
    });

    await fir.save();

    // 📧 SEND EMAIL
    await sendEmail(
      email,
      "FIR Submitted Successfully",
      `Your FIR has been registered successfully.

FIR ID: ${firId}
Category: ${category}
Status: Pending`
    );

    res.status(201).json({
      message: "FIR submitted successfully",
      firId,
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* ===============================
   VIEW ALL FIRs (Police only)
================================ */
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "police") {
    return res.status(403).json({ error: "Access denied" });
  }

  const firs = await FIR.find().sort({ createdAt: -1 });
  res.json(firs);
});

/* ===============================
   UPDATE FIR STATUS (Police only)
================================ */
router.put("/:id/status", auth, async (req, res) => {
  try {
    console.log("🔁 Status update API hit");

    if (req.user.role !== "police") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { status } = req.body;

    const fir = await FIR.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    console.log("📄 FIR after update:", fir);

    if (!fir) {
      return res.status(404).json({ error: "FIR not found" });
    }

    if (fir.email) {
      console.log("📧 Sending status update email to:", fir.email);

      await sendEmail(
        fir.email,
        "FIR Status Updated",
        `Your FIR status has been updated.

FIR ID: ${fir.firId}
New Status: ${status}`
      );

      console.log("✅ STATUS EMAIL SENT");
    } else {
      console.log("❌ FIR email not found");
    }

    res.json({ message: "Status updated" });
  } catch (error) {
    console.error("❌ STATUS EMAIL ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
});


/* ===============================
   TRACK FIR (Public / Citizen)
================================ */
router.get("/track/:firId", async (req, res) => {
  try {
    const fir = await FIR.findOne({ firId: req.params.firId });

    if (!fir) {
      return res.status(404).json({ message: "FIR not found" });
    }

    res.json(fir);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
