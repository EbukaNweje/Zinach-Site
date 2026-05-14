const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("../utils/email");

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address." });
    }

    await sendContactEmail({ name, email, subject, message });

    res.json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("Contact email error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to send message. Please try again.",
      });
  }
});

module.exports = router;
