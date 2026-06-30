const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Admin
router.get("/users", protect, admin, getUsers);
router.put("/users/:id/status", protect, admin, toggleUserStatus);
router.delete("/users/:id", protect, admin, deleteUser);

module.exports = router;
