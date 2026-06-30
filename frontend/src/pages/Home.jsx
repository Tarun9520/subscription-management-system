import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout sidebar={false}>
      <section className="mx-auto max-w-5xl py-16 text-center">
        <span className="inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          Modern SaaS Subscription Platform
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Manage Subscriptions
          <span className="block text-brand-600">the smart way</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Flexible plans, instant payments via Razorpay, automatic invoices,
          coupons, and powerful analytics — everything you need to run a
          subscription business.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Get Started Free
          </Link>
          <Link to="/pricing" className="btn-secondary px-6 py-3 text-base">
            View Pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 py-10 sm:grid-cols-3">
        {[
          {
            icon: "⚡",
            title: "Instant Payments",
            desc: "Secure checkout powered by Razorpay with real-time verification.",
          },
          {
            icon: "📄",
            title: "Auto Invoices",
            desc: "PDF invoices generated and emailed automatically after each payment.",
          },
          {
            icon: "📊",
            title: "Analytics",
            desc: "Track revenue, churn rate, and active subscribers in real time.",
          },
        ].map((f) => (
          <div key={f.title} className="card text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-2xl dark:bg-brand-900/40">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {f.desc}
            </p>
          </div>
        ))}
      </section>
    </Layout>
  );
}
