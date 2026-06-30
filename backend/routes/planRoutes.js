const express = require("express");
const router = express.Router();
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getPlans);
router.get("/:id", getPlan);

router.post("/", protect, admin, createPlan);
router.put("/:id", protect, admin, updatePlan);
router.delete("/:id", protect, admin, deletePlan);

module.exports = router;
