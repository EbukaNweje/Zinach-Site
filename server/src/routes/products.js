const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { uploadProductImage, cloudinary } = require("../utils/cloudinary");

// GET /api/products — list all products
router.get("/", async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:slug — single product
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products — create product (with optional image upload)
router.post("/", uploadProductImage.single("image"), async (req, res) => {
  try {
    const { name, brand, price, description, packageOptions } = req.body;

    const product = new Product({
      name,
      brand,
      price,
      description,
      image: req.file ? req.file.path : "",
      imagePublicId: req.file ? req.file.filename : "",
      packageOptions: packageOptions ? JSON.parse(packageOptions) : [],
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id — update product
router.put("/:id", uploadProductImage.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const { name, brand, price, description, packageOptions } = req.body;

    // If a new image was uploaded, delete the old one from Cloudinary
    if (req.file && product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    product.name = name ?? product.name;
    product.brand = brand ?? product.brand;
    product.price = price ?? product.price;
    product.description = description ?? product.description;
    if (req.file) {
      product.image = req.file.path;
      product.imagePublicId = req.file.filename;
    }
    if (packageOptions) {
      product.packageOptions = JSON.parse(packageOptions);
    }

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
