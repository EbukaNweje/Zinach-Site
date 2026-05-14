const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true }, // MongoDB _id of the product
  slug: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String, default: "" },
  price: { type: String, required: true },
  image: { type: String, default: "" },
  packageOption: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    // We use a sessionId (stored in localStorage) to identify anonymous carts
    sessionId: { type: String, required: true, unique: true, index: true },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cart", cartSchema);
