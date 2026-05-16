const mongoose = require("mongoose");

// Stores the admin's payout details for each payment method
const paymentInfoSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "Chime",
        "Apple Pay",
        "Zelle",
        "PayPal",
        "Venmo",
        "BTC",
        "Interac",
      ],
    },
    fields: {
      type: Map,
      of: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PaymentInfo", paymentInfoSchema);
