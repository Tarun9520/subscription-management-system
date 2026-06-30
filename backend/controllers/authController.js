const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendEmail } = require("../config/email");
const { uploadImage, deleteImage } = require("../config/cloudinary");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// @desc Register
// @route POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.cookie("token", token, cookieOptions);

  // Welcome email (non-blocking)
  sendEmail({
    to: user.email,
    subject: "Welcome to Subscription Platform 🎉",
    html: `<h2>Hi ${user.name},</h2><p>Welcome aboard! Your account has been created successfully.</p>`,
  });

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// @desc Login
// @route POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res
      .status(403)
      .json({ success: false, message: "Account is deactivated" });
  }

  const token = generateToken(user._id);
  res.cookie("token", token, cookieOptions);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// @desc Logout
// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};

// @desc Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "currentSubscription",
    populate: { path: "plan" },
  });
  res.json({ success: true, user });
};

// @desc Update profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const { name, phone, avatar } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  if (avatar && avatar.startsWith("data:")) {
    if (user.avatar && user.avatar.publicId) {
      await deleteImage(user.avatar.publicId);
    }
    const uploaded = await uploadImage(avatar, "avatars");
    user.avatar = uploaded;
  }

  await user.save();

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
};

// @desc Change password
// @route PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    return res
      .status(400)
      .json({ success: false, message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password changed successfully" });
};

// @desc Forgot password
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Do not reveal whether email exists
    return res.json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below (valid for 15 minutes):</p>
    <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail({ to: user.email, subject: "Password Reset", html });

  res.json({
    success: true,
    message: "If that email exists, a reset link has been sent",
  });
};

// @desc Reset password
// @route POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
};

// ===== ADMIN =====

// @desc Get all users
// @route GET /api/auth/users
exports.getUsers = async (req, res) => {
  const users = await User.find()
    .populate({ path: "currentSubscription", populate: { path: "plan" } })
    .sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
};

// @desc Toggle user active status
// @route PUT /api/auth/users/:id/status
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: "User status updated", user });
};

// @desc Delete user
// @route DELETE /api/auth/users/:id
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (user.avatar && user.avatar.publicId) {
    await deleteImage(user.avatar.publicId);
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
};
