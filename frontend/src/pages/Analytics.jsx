import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import {
  RevenueLineChart,
  RevenueBarChart,
  PlanDistributionChart,
} from "../components/RevenueChart";
import { subscriptionApi } from "../services/subscriptionApi";
import { formatCurrency } from "../utils/format";
import toast from "react-hot-toast";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionApi
      .getAnalytics()
      .then((res) => setData(res.data.analytics))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="grid min-h-[50vh] place-items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <p className="text-gray-500">No analytics data available.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Analytics
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Revenue, churn, and subscriber insights.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon="💰"
          accent="green"
        />
        <StatCard
          title="Active Subscribers"
          value={data.activeSubscribers}
          icon="👥"
          accent="brand"
        />
        <StatCard
          title="Churn Rate"
          value={`${data.churnRate}%`}
          icon="📉"
          accent="red"
        />
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          icon="🧑"
          accent="yellow"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Monthly Revenue
          </h3>
          {data.revenueChart?.length ? (
            <RevenueLineChart data={data.revenueChart} />
          ) : (
            <p className="py-10 text-center text-gray-500">No data yet.</p>
          )}
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Payments per Month
          </h3>
          {data.revenueChart?.length ? (
            <RevenueBarChart data={data.revenueChart} />
          ) : (
            <p className="py-10 text-center text-gray-500">No data yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6 card">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
          Active Plan Distribution
        </h3>
        {data.planDistribution?.length ? (
          <div className="mx-auto max-w-md">
            <PlanDistributionChart data={data.planDistribution} />
          </div>
        ) : (
          <p className="py-10 text-center text-gray-500">
            No active subscriptions yet.
          </p>
        )}
      </div>
    </Layout>
  );
}
