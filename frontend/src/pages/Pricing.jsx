import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/Layout";
import PlanCard from "../components/PlanCard";
import { fetchPlans, fetchMySubscription } from "../redux/subscriptionSlice";
import { paymentApi } from "../services/paymentApi";
import { subscriptionApi } from "../services/subscriptionApi";
import { formatCurrency } from "../utils/format";
import toast from "react-hot-toast";

export default function Pricing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, current } = useSelector((s) => s.subscription);
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [cycle, setCycle] = useState("all");
  const [processing, setProcessing] = useState(false);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    dispatch(fetchPlans());
    if (isAuthenticated) dispatch(fetchMySubscription());
  }, [dispatch, isAuthenticated]);

  const filtered =
    cycle === "all" ? plans : plans.filter((p) => p.billingCycle === cycle);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSelect = async (plan) => {
    if (!isAuthenticated) {
      toast("Please log in to subscribe");
      navigate("/login");
      return;
    }

    setProcessing(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error("Failed to load payment gateway");
        return;
      }

      const { data } = await paymentApi.createOrder({
        planId: plan._id,
        couponCode: coupon || undefined,
      });

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "SubHub",
        description: `${plan.name} Subscription`,
        order_id: data.order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#6366f1" },
        handler: async (response) => {
          try {
            await paymentApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Subscription activated!");
            dispatch(fetchMySubscription());
            navigate("/dashboard");
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Payment verification failed"
            );
          }
        },
        modal: {
          ondismiss: () => toast("Payment cancelled"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start payment");
    } finally {
      setProcessing(false);
    }
  };

  const applyCoupon = async () => {
    if (!coupon) return;
    if (!filtered.length) return;
    try {
      const { data } = await subscriptionApi.applyCoupon({
        code: coupon,
        planId: filtered[0]._id,
      });
      toast.success(
        `Coupon valid! Save ${formatCurrency(data.discount)} on checkout.`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
    }
  };

  return (
    <Layout sidebar={isAuthenticated}>
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Simple, transparent pricing
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Choose the plan that's right for you.
        </p>

        <div className="mt-6 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
          {["all", "monthly", "quarterly", "yearly"].map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ${
                cycle === c
                  ? "bg-brand-600 text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {isAuthenticated && (
          <div className="mx-auto mt-6 flex max-w-sm items-center gap-2">
            <input
              className="input"
              placeholder="Have a coupon? Enter code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            />
            <button onClick={applyCoupon} className="btn-secondary shrink-0">
              Apply
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            current={current}
            loading={processing}
            onSelect={handleSelect}
            ctaLabel={
              current && current.plan
                ? plan.tier > current.plan.tier
                  ? "Upgrade"
                  : plan.tier < current.plan.tier
                  ? "Downgrade"
                  : "Subscribe"
                : "Subscribe"
            }
          />
        ))}
      </div>

      {!filtered.length && (
        <p className="mt-10 text-center text-gray-500">No plans available.</p>
      )}
    </Layout>
  );
}
