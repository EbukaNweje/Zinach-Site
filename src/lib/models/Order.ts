import { Schema, model, models } from "mongoose";

const orderItemSchema = new Schema({
  productId: { type: String },
  name: { type: String, required: true },
  brand: { type: String },
  price: { type: String },
  quantity: { type: Number, default: 1 },
  packageOption: { type: String },
});

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String },
      address: { type: String },
    },
    items: [orderItemSchema],
    total: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },
    proofImageUrl: { type: String, default: "" },
    proofImagePublicId: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export default models.Order || model("Order", orderSchema);
