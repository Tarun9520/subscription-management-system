const express = require("express");
const router = express.Router();
const {
  getMySubscription,
  getMyHistory,
  cancelSubscription,
  resumeSubscription,
  pauseSubscription,
  changePreview,
  getAllSubscriptions,
  getAnalytics,
} = require("../controllers/subscriptionController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/me", protect, getMySubscription);
router.get("/history", protect, getMyHistory);
router.put("/cancel", protect, cancelSubscription);
router.put("/resume", protect, resumeSubscription);
router.put("/pause", protect, pauseSubscription);
router.post("/change-preview", protect, changePreview);

// Admin
router.get("/", protect, admin, getAllSubscriptions);
router.get("/analytics", protect, admin, getAnalytics);

module.exports = router;
