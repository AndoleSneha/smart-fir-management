const FIR = require("../models/FIR");
const axios = require("axios");

exports.fileFIR = async (req, res) => {
  const { description } = req.body;

  // Call ML service
  const mlResponse = await axios.post("http://localhost:5000/predict", {
    text: description
  });

  const fir = await FIR.create({
    description,
    category: mlResponse.data.category,
    priority: mlResponse.data.priority
  });

  res.json(fir);
};

exports.getFIRs = async (req, res) => {
  const firs = await FIR.find();
  res.json(firs);
};
