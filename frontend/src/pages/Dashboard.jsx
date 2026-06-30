import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import SubscriptionTable from "../components/SubscriptionTable";
import { fetchMySubscription } from "../redux/subscriptionSlice";
import { subscriptionApi } from "../services/subscriptionApi";
import { paymentApi } from "../services/paymentApi";
import { formatCurrency, formatDate } from "../utils/format";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { current } = useSelector((s) => s.subscription);
  const [history, setHistory] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    dispatch(fetchMySubscription());
    subscriptionApi
      .getMyHistory()
      .then((res) => setHistory(res.data.subscriptions))
      .catch(() => {});
    paymentApi
      .getHistory()
      .then((res) => setPayments(res.data.payments))
      .catch(() => {});
  }, [dispatch]);

  const totalSpent = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Here's an overview of your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Plan"
          value={current?.plan?.name || "None"}
          icon="💳"
          accent="brand"
        />
        <StatCard
          title="Status"
          value={current?.status || "Inactive"}
          icon="✅"
          accent={current?.status === "active" ? "green" : "yellow"}
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          icon="💰"
          accent="green"
        />
        <StatCard
          title="Renews On"
          value={current ? formatDate(current.endDate) : "—"}
          icon="📅"
          accent="brand"
        />
      </div>

      {current ? (
        <div className="card mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {current.plan?.name} Plan
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(current.amountPaid, current.plan?.currency)} /{" "}
                {current.plan?.billingCycle}
                {current.cancelAtPeriodEnd && (
                  <span className="ml-2 text-red-500">
                    (Cancels on {formatDate(current.endDate)})
                  </span>
                )}
              </p>
            </div>
            <Link to="/billing" className="btn-primary">
              Manage Subscription
            </Link>
          </div>
        </div>
      ) : (
        <div className="card mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            You don't have an active subscription yet.
          </p>
          <Link to="/pricing" className="btn-primary mt-4 inline-flex">
            Browse Plans
          </Link>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Subscription History
        </h2>
        <SubscriptionTable subscriptions={history} />
      </div>
    </Layout>
  );
}
