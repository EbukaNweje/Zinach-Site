import mongoose, { Schema, model, models } from "mongoose";

const packageOptionSchema = new Schema({
  label: { type: String, required: true },
  price: { type: String, required: true },
});

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    packageOptions: [packageOptionSchema],
    slug: { type: String, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

productSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = (this.name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export const Product = models.Product || model("Product", productSchema);
