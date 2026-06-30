import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { authApi } from "../services/authApi";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success("If that email exists, a reset link was sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout sidebar={false}>
      <div className="mx-auto max-w-md py-12">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot Password
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your email and we'll send you a reset link.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Check your inbox for the password reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

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
