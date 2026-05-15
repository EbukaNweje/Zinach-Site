import { Schema, model, models } from "mongoose";

const paymentInfoSchema = new Schema(
  {
    method: {
      type: String,
      required: true,
      unique: true,
      enum: ["Chime", "Apple Pay", "Zelle", "PayPal", "Venmo", "BTC address"],
    },
    fields: {
      type: Map,
      of: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default models.PaymentInfo || model("PaymentInfo", paymentInfoSchema);
