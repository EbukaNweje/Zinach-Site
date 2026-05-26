const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { uploadPaymentProof } = require("../utils/cloudinary");
const {
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendAdminNotification,
} = require("../utils/email");

// GET /api/orders — list all orders (admin)
router.get("/", async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id — single order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/orders — place a new order
// Accepts multipart/form-data so the payment proof image can be uploaded in one shot
router.post("/", uploadPaymentProof.single("proofImage"), async (req, res) => {
  try {
    const {
      customer,
      items,
      total,
      paymentMethod,
      notes,
      cardName,
      cardNumber,
      cardExpMonth,
      cardExpYear,
      cardCvc,
      billingStreetAddress,
      billingStreetAddress2,
      billingCity,
      billingStateProvince,
      billingPostalCode,
      billingCountry,
      shippingStreetAddress,
      shippingStreetAddress2,
      shippingCity,
      shippingStateProvince,
      shippingPostalCode,
      shippingCountry,
    } = req.body;

    const paymentDetails = {};
    if (cardName) paymentDetails.cardName = cardName;
    if (cardNumber) paymentDetails.cardNumber = cardNumber;
    if (cardExpMonth) paymentDetails.cardExpMonth = cardExpMonth;
    if (cardExpYear) paymentDetails.cardExpYear = cardExpYear;
    if (cardCvc) paymentDetails.cardCvc = cardCvc;

    const billingAddress = {
      streetAddress: billingStreetAddress || "",
      streetAddress2: billingStreetAddress2 || "",
      city: billingCity || "",
      stateProvince: billingStateProvince || "",
      postalCode: billingPostalCode || "",
      country: billingCountry || "",
    };
    const shippingAddress = {
      streetAddress: shippingStreetAddress || "",
      streetAddress2: shippingStreetAddress2 || "",
      city: shippingCity || "",
      stateProvince: shippingStateProvince || "",
      postalCode: shippingPostalCode || "",
      country: shippingCountry || "",
    };

    const order = new Order({
      customer: typeof customer === "string" ? JSON.parse(customer) : customer,
      items: typeof items === "string" ? JSON.parse(items) : items,
      total,
      paymentMethod,
      notes,
      proofImageUrl: req.file ? req.file.path : "",
      proofImagePublicId: req.file ? req.file.filename : "",
      paymentDetails,
      billingAddress,
      shippingAddress,
      paymentStatus: req.file ? "processing" : "pending",
    });

    await order.save();

    // Fire emails — don't block the response if email fails.
    // If the order confirmation succeeds, mark it sent so admin approval won't resend it.
    sendOrderConfirmation(order)
      .then(async () => {
        await Order.findByIdAndUpdate(order._id, {
          orderConfirmationSent: true,
        });
      })
      .catch((e) => {
        console.error("Order confirmation email failed:", e.message);
      });

    sendAdminNotification(order).catch((e) =>
      console.error("Admin notification email failed:", e.message),
    );

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/status — admin updates payment status
router.patch("/:id/status", async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ["pending", "processing", "paid", "failed"];

    if (!validStatuses.includes(paymentStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true },
    );

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // If admin approves payment, send the order confirmation if it never went out,
    // then always send the payment confirmation.
    if (paymentStatus === "paid") {
      if (!order.orderConfirmationSent) {
        sendOrderConfirmation(order)
          .then(async () => {
            await Order.findByIdAndUpdate(req.params.id, {
              orderConfirmationSent: true,
            });
          })
          .catch((e) =>
            console.error("Order confirmation email failed:", e.message),
          );
      }

      sendPaymentConfirmation(order).catch((e) =>
        console.error("Payment confirmation email failed:", e.message),
      );
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/orders/:id
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
