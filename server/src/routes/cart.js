const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// All cart routes require a sessionId header
function getSessionId(req) {
  return req.headers["x-session-id"] || null;
}

// GET /api/cart — get cart for this session
router.get("/", async (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId)
    return res
      .status(400)
      .json({ success: false, message: "Missing session ID" });

  try {
    const cart = await Cart.findOne({ sessionId });
    res.json({ success: true, data: cart ? cart.items : [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart/add — add or increment an item
router.post("/add", async (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId)
    return res
      .status(400)
      .json({ success: false, message: "Missing session ID" });

  try {
    const {
      productId,
      slug,
      name,
      brand,
      price,
      image,
      packageOption,
      quantity = 1,
    } = req.body;

    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = new Cart({ sessionId, items: [] });
    }

    const existing = cart.items.find(
      (i) => i.slug === slug && i.packageOption === (packageOption || ""),
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        slug,
        name,
        brand,
        price,
        image,
        packageOption: packageOption || "",
        quantity,
      });
    }

    await cart.save();
    res.json({ success: true, data: cart.items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/cart/update — update quantity of an item
router.patch("/update", async (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId)
    return res
      .status(400)
      .json({ success: false, message: "Missing session ID" });

  try {
    const { slug, packageOption, quantity } = req.body;

    const cart = await Cart.findOne({ sessionId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.slug === slug && i.packageOption === (packageOption || ""),
    );

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => !(i.slug === slug && i.packageOption === (packageOption || "")),
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, data: cart.items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/cart/remove — remove one item
router.delete("/remove", async (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId)
    return res
      .status(400)
      .json({ success: false, message: "Missing session ID" });

  try {
    const { slug, packageOption } = req.body;

    const cart = await Cart.findOne({ sessionId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => !(i.slug === slug && i.packageOption === (packageOption || "")),
    );

    await cart.save();
    res.json({ success: true, data: cart.items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cart/clear — empty the cart
router.delete("/clear", async (req, res) => {
  const sessionId = getSessionId(req);
  if (!sessionId)
    return res
      .status(400)
      .json({ success: false, message: "Missing session ID" });

  try {
    const cart = await Cart.findOne({ sessionId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
