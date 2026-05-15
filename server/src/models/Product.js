const mongoose = require("mongoose");

const packageOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  price: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" }, // Cloudinary URL
    imagePublicId: { type: String, default: "" }, // Cloudinary public_id for deletion
    packageOptions: [packageOptionSchema],
    slug: { type: String, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

// Auto-generate slug from name before saving
productSchema.pre("save", function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

module.exports = mongoose.model("Product", productSchema);
