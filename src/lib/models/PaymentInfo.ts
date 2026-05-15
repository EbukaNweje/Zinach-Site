import { Schema, model, models } from "mongoose";

const paymentInfoSchema = new Schema(
  {
    method: {
      type: String,
      required: true,
      unique: true,
    },
    fields: {
      type: Map,
      of: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const PaymentInfo =
  models.PaymentInfo || model("PaymentInfo", paymentInfoSchema);
