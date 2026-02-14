const express = require("express");
const router = express.Router();
const FIR = require("../models/FIR");
const auth = require("../middleware/authMiddleware");
const axios = require("axios");
const sendEmail = require("../utils/sendEmail");





/* ===============================
   FILE FIR (Citizen)
================================ */
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({ error: "Only citizens can file FIR" });
    }

    const { description, email } = req.body;

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
      email,
      timeline: [
  { message: "FIR Registered" }
],

    });

    await fir.save();

    await sendEmail(
      email,
      "FIR Submitted Successfully",
      `FIR ID: ${firId}\nCategory: ${category}\nStatus: Pending`
    );

    res.status(201).json({ message: "FIR submitted", firId, category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



/* ===============================
   VIEW ALL FIRs (Police)
================================ */
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "police") {
    return res.status(403).json({ error: "Access denied" });
  }

  const firs = await FIR.find().sort({ createdAt: -1 });
  res.json(firs);
});



/* ===============================
   UPDATE STATUS (Police)
================================ */
router.put("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "police") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { status } = req.body;

    // 🔥 find FIR first
    const fir = await FIR.findById(req.params.id);

    if (!fir) return res.status(404).json({ error: "FIR not found" });

    // 🔥 update status
    fir.status = status;

    // 🚀 ADD TO TIMELINE
    fir.timeline.push({
      message: `Status changed to ${status}`,
    });

    await fir.save();

    // 📧 email
    if (fir.email) {
      await sendEmail(
        fir.email,
        "FIR Status Updated",
        `FIR ID: ${fir.firId}\nNew Status: ${status}`
      );
    }

    res.json({ message: "Status updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});


/* ===============================
   ASSIGN OFFICER
================================ */
router.put("/:id/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "police") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { officer } = req.body;

    const fir = await FIR.findById(req.params.id);
    if (!fir) return res.status(404).json({ error: "FIR not found" });

    fir.assignedOfficer = officer;

    fir.timeline.push({
      message: `Officer assigned to ${officer}`,
      date: new Date(),
    });

    await fir.save();

    res.json({ message: "Officer assigned" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});


/* ===============================
   ADD COMMENT (Police)
================================ */
router.post("/:id/comment", auth, async (req, res) => {
  try {
    if (req.user.role !== "police") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { comment } = req.body;

    const fir = await FIR.findById(req.params.id);

    if (!fir) return res.status(404).json({ error: "FIR not found" });

    // 🚀 push into timeline
    fir.timeline.push({
      message: `Comment: ${comment}`,
    });

    await fir.save();

    res.json({ message: "Comment added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});


/* ===============================
   ASSIGN OFFICER
================================ */
router.put("/:id/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "police") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { officer } = req.body;

    const fir = await FIR.findById(req.params.id);
    if (!fir) return res.status(404).json({ error: "FIR not found" });

    fir.assignedOfficer = officer;

    fir.timeline.push({
      message: `Assigned to ${officer}`,
    });

    await fir.save();

    res.json({ message: "Officer assigned" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   UPDATE PRIORITY
================================ */
router.put("/:id/priority", auth, async (req, res) => {
  try {
    const { priority } = req.body;

    const fir = await FIR.findById(req.params.id);
    if (!fir) return res.status(404).json({ error: "FIR not found" });

    fir.priority = priority;

    fir.timeline.push({
      message: `Priority set to ${priority}`,
    });

    await fir.save();

    res.json({ message: "Priority updated" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});




/* ===============================
   TRACK FIR
================================ */
router.get("/track/:firId", async (req, res) => {
  try {
    const fir = await FIR.findOne({ firId: req.params.firId });

    if (!fir) return res.status(404).json({ message: "FIR not found" });

    res.json(fir);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


/* ===============================
   GET FIR BY ID
================================ */
router.get("/:id", auth, async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id);

    if (!fir) return res.status(404).json({ message: "Not found" });

    res.json(fir);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
