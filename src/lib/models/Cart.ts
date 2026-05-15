import { Schema, model, models } from "mongoose";

const cartItemSchema = new Schema({
  productId: { type: String, required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String, default: "" },
  price: { type: String, required: true },
  image: { type: String, default: "" },
  packageOption: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

export const Cart = models.Cart || model("Cart", cartSchema);
