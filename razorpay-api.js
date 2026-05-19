/**
 * Razorpay orders + payment verification for Christ Mission School.
 * Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on Render (.env locally).
 */
const express = require("express");
const crypto = require("crypto");

function isRazorpayConfigured() {
  const id = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!id || !secret) return false;
  if (id.indexOf("YOUR_") >= 0 || secret.indexOf("YOUR_") >= 0) return false;
  return true;
}

function createRazorpayApiRouter() {
  const router = express.Router();

  router.get("/config", function (req, res) {
    res.json({
      enabled: isRazorpayConfigured(),
      keyId: isRazorpayConfigured() ? process.env.RAZORPAY_KEY_ID : "",
      currency: "INR",
    });
  });

  router.post("/create-order", async function (req, res) {
    const body = req.body || {};
    const amountInr = Number(body.amount);
    const amountPaise = Math.round(amountInr * 100);

    if (!amountPaise || amountPaise < 100) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (!isRazorpayConfigured()) {
      return res.json({
        success: true,
        demoMode: true,
        transactionId: "CMS-DEMO-" + Date.now(),
        message: "Razorpay keys not configured — demo payment only.",
      });
    }

    let Razorpay;
    try {
      Razorpay = require("razorpay");
    } catch (e) {
      return res.status(500).json({ success: false, message: "Razorpay module missing" });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const receipt = String(body.receipt || "cms_" + Date.now()).slice(0, 40);
    const notes = body.notes && typeof body.notes === "object" ? body.notes : {};
    if (body.purpose) notes.purpose = String(body.purpose).slice(0, 200);

    try {
      const order = await instance.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: receipt,
        notes: notes,
      });
      res.json({
        success: true,
        demoMode: false,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: amountPaise,
        currency: "INR",
      });
    } catch (err) {
      console.error("Razorpay create order:", err.message || err);
      res.status(500).json({
        success: false,
        message: err.error && err.error.description ? err.error.description : "Could not create order",
      });
    }
  });

  router.post("/verify", function (req, res) {
    const body = req.body || {};
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    if (!isRazorpayConfigured()) {
      return res.json({
        success: true,
        demoMode: true,
        paymentId: paymentId,
        orderId: orderId,
        reference: paymentId,
      });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    res.json({
      success: true,
      demoMode: false,
      paymentId: paymentId,
      orderId: orderId,
      reference: paymentId,
    });
  });

  return router;
}

module.exports = { createRazorpayApiRouter, isRazorpayConfigured };
