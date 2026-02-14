const mongoose = require("mongoose");

const firSchema = new mongoose.Schema(
  {
    firId: {
      type: String,
      unique: true,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "Uncategorized",
    },

    status: {
      type: String,
      default: "Pending",
    },

    // 🔑 STORE CITIZEN EMAIL FOR NOTIFICATIONS
    email: {
      type: String,
      required: true,
    },

   assignedOfficer: {
  type: String,
  default: "Not Assigned",
},

priority: {
  type: String,
  default: "Medium",
},

timeline: [
  {
    message: String,
    date: { type: Date, default: Date.now },
  },
],


  },
  {
    timestamps: true, // auto adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("FIR", firSchema); 