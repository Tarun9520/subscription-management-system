import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "bottom" },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

export function RevenueLineChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.map((d) => d.revenue),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.15)",
        fill: true,
        tension: 0.35,
      },
    ],
  };
  return (
    <div className="h-72">
      <Line data={chartData} options={baseOptions} />
    </div>
  );
}

export function RevenueBarChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: "Payments",
        data: data.map((d) => d.count),
        backgroundColor: "#818cf8",
        borderRadius: 6,
      },
    ],
  };
  return (
    <div className="h-72">
      <Bar data={chartData} options={baseOptions} />
    </div>
  );
}

export function PlanDistributionChart({ data }) {
  const palette = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#a855f7",
  ];
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((_, i) => palette[i % palette.length]),
        borderWidth: 0,
      },
    ],
  };
  return (
    <div className="h-72">
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </div>
  );
}
