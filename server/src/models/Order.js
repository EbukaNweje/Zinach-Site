const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String },
  name: { type: String, required: true },
  brand: { type: String },
  price: { type: String },
  quantity: { type: Number, default: 1 },
  packageOption: { type: String },
});

const orderSchema = new mongoose.Schema(
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

// Auto-generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${String(count + 1001).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
