import { Schema, model, models } from "mongoose";

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

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default models.Product || model("Product", productSchema);
