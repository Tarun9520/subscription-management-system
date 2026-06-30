import React from "react";
import { formatCurrency } from "../utils/format";

export default function PlanCard({
  plan,
  current,
  onSelect,
  loading,
  ctaLabel,
}) {
  const isCurrent = current && current.plan && current.plan._id === plan._id;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition hover:shadow-lg ${
        plan.isPopular
          ? "border-brand-500 ring-2 ring-brand-500"
          : "border-gray-200 dark:border-gray-700"
      } bg-white dark:bg-gray-800`}
    >
      {plan.isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}

      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {plan.description}
      </p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {formatCurrency(plan.price, plan.currency)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          /{plan.billingCycle}
        </span>
      </div>

      <ul className="mt-5 flex-1 space-y-2">
        {plan.features?.map((f, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <span className="text-green-500">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        disabled={loading || isCurrent}
        onClick={() => onSelect && onSelect(plan)}
        className={`mt-6 w-full ${
          plan.isPopular ? "btn-primary" : "btn-secondary"
        }`}
      >
        {isCurrent ? "Current Plan" : ctaLabel || "Choose Plan"}
      </button>
    </div>
  );
}
