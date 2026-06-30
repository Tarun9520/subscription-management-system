const express = require("express");
const router = express.Router();
const {
  getMyInvoices,
  getInvoice,
  downloadInvoice,
  emailInvoice,
  getAllInvoices,
} = require("../controllers/invoiceController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/me", protect, getMyInvoices);
router.get("/:id", protect, getInvoice);
router.get("/:id/download", protect, downloadInvoice);
router.post("/:id/email", protect, emailInvoice);

// Admin
router.get("/", protect, admin, getAllInvoices);

module.exports = router;
