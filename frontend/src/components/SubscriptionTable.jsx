import React from "react";
import { formatCurrency, formatDate, statusColor } from "../utils/format";

export default function SubscriptionTable({ subscriptions = [], showUser }) {
  if (!subscriptions.length) {
    return (
      <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        No subscriptions found.
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {showUser && <th className="px-4 py-3 text-left">User</th>}
            <th className="px-4 py-3 text-left">Plan</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Start</th>
            <th className="px-4 py-3 text-left">End</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {subscriptions.map((s) => (
            <tr key={s._id}>
              {showUser && (
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {s.user?.name}
                  </div>
                  <div className="text-xs text-gray-500">{s.user?.email}</div>
                </td>
              )}
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {s.plan?.name || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {formatCurrency(s.amountPaid, s.plan?.currency)}
              </td>
              <td className="px-4 py-3">
                <span className={`badge ${statusColor(s.status)}`}>
                  {s.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {formatDate(s.startDate)}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {formatDate(s.endDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
