import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { authApi } from "../services/authApi";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, { password: form.password });
      toast.success("Password reset successful. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout sidebar={false}>
      <div className="mx-auto max-w-md py-12">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                required
                className="input"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                required
                className="input"
                value={form.confirm}
                onChange={(e) =>
                  setForm({ ...form, confirm: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/login" className="text-brand-600 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
