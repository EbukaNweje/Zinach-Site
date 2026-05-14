const express = require("express");
const router = express.Router();
const PaymentInfo = require("../models/PaymentInfo");

// GET /api/payments — get all saved payment method details
router.get("/", async (_req, res) => {
  try {
    const info = await PaymentInfo.find();
    res.json({ success: true, data: info });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/:method — get details for one method
router.get("/:method", async (req, res) => {
  try {
    const info = await PaymentInfo.findOne({ method: req.params.method });
    if (!info)
      return res
        .status(404)
        .json({ success: false, message: "Payment method not found" });
    res.json({ success: true, data: info });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/payments/:method — upsert payment method details (admin)
router.put("/:method", async (req, res) => {
  try {
    const { fields } = req.body;

    const info = await PaymentInfo.findOneAndUpdate(
      { method: req.params.method },
      { method: req.params.method, fields },
      { new: true, upsert: true, runValidators: true },
    );

    res.json({ success: true, data: info });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
