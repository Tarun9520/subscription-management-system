const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyPayments,
  getAllPayments,
} = require("../controllers/paymentController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/history", protect, getMyPayments);

// Admin
router.get("/", protect, admin, getAllPayments);

module.exports = router;
