export const formatCurrency = (amount, currency = "INR") => {
  const symbols = { INR: "₹", USD: "$", EUR: "€" };
  const symbol = symbols[currency] || "";
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const statusColor = (status) => {
  const map = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    created:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    expired: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    paused:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    refunded:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};
