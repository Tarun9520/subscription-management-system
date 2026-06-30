import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/Layout";
import { fetchMySubscription } from "../redux/subscriptionSlice";
import { subscriptionApi } from "../services/subscriptionApi";
import { paymentApi } from "../services/paymentApi";
import { formatCurrency, formatDate, statusColor } from "../utils/format";
import toast from "react-hot-toast";

export default function Billing() {
  const dispatch = useDispatch();
  const { current } = useSelector((s) => s.subscription);
  const [payments, setPayments] = useState([]);
  const [busy, setBusy] = useState(false);

  const loadPayments = () => {
    paymentApi
      .getHistory()
      .then((res) => setPayments(res.data.payments))
      .catch(() => {});
  };

  useEffect(() => {
    dispatch(fetchMySubscription());
    loadPayments();
  }, [dispatch]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel subscription at end of billing period?"))
      return;
    setBusy(true);
    try {
      await subscriptionApi.cancel();
      toast.success("Subscription will cancel at period end");
      dispatch(fetchMySubscription());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setBusy(false);
    }
  };

  const handleResume = async () => {
    setBusy(true);
    try {
      await subscriptionApi.resume();
      toast.success("Subscription resumed");
      dispatch(fetchMySubscription());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resume");
    } finally {
      setBusy(false);
    }
  };

  const handlePause = async () => {
    setBusy(true);
    try {
      await subscriptionApi.pause();
      toast.success("Subscription paused");
      dispatch(fetchMySubscription());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pause");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Billing & Subscription
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Manage your plan and view payment history.
      </p>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Current Subscription
        </h2>

        {current ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {current.plan?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(current.amountPaid, current.plan?.currency)} /{" "}
                  {current.plan?.billingCycle}
                </p>
              </div>
              <span className={`badge ${statusColor(current.status)}`}>
                {current.status}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-xs text-gray-500">Started</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(current.startDate)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-xs text-gray-500">
                  {current.cancelAtPeriodEnd ? "Ends" : "Renews"}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(current.endDate)}
                </p>
              </div>
            </div>

            {current.cancelAtPeriodEnd && (
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                Your subscription is set to cancel on{" "}
                {formatDate(current.endDate)}. You can resume anytime before
                then.
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/pricing" className="btn-primary">
                Upgrade / Downgrade
              </Link>
              {current.cancelAtPeriodEnd ? (
                <button
                  onClick={handleResume}
                  disabled={busy}
                  className="btn-secondary"
                >
                  Resume Subscription
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePause}
                    disabled={busy}
                    className="btn-secondary"
                  >
                    Pause
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={busy}
                    className="btn-danger"
                  >
                    Cancel Subscription
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No active subscription.
            </p>
            <Link to="/pricing" className="btn-primary mt-3 inline-flex">
              Choose a Plan
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Payment History
        </h2>
        <div className="table-wrap">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {p.plan?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatCurrency(p.amount, p.currency)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {p.discount ? formatCurrency(p.discount) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!payments.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
