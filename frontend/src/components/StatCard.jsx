import React from "react";

export default function StatCard({ title, value, icon, accent = "brand" }) {
  const accents = {
    brand: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    yellow:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`grid h-12 w-12 place-items-center rounded-xl text-xl ${accents[accent]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
