import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import SubscriptionTable from "../components/SubscriptionTable";
import { authApi } from "../services/authApi";
import { subscriptionApi } from "../services/subscriptionApi";
import { paymentApi } from "../services/paymentApi";
import { formatCurrency, formatDate, statusColor } from "../utils/format";
import toast from "react-hot-toast";

const TABS = [
  "Users",
  "Plans",
  "Subscriptions",
  "Payments",
  "Invoices",
  "Coupons",
];

export default function Admin() {
  const [tab, setTab] = useState("Users");

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Admin Panel
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Manage all platform resources.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t
                ? "border-b-2 border-brand-600 text-brand-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Users" && <UsersTab />}
        {tab === "Plans" && <PlansTab />}
        {tab === "Subscriptions" && <SubscriptionsTab />}
        {tab === "Payments" && <PaymentsTab />}
        {tab === "Invoices" && <InvoicesTab />}
        {tab === "Coupons" && <CouponsTab />}
      </div>
    </Layout>
  );
}

/* ---------------- Users ---------------- */
function UsersTab() {
  const [users, setUsers] = useState([]);

  const load = () =>
    authApi.getUsers().then((res) => setUsers(res.data.users)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id) => {
    try {
      await authApi.toggleUserStatus(id);
      toast.success("Status updated");
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await authApi.deleteUser(id);
      toast.success("User deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="table-wrap">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Plan</th>
            <th className="px-4 py-3 text-left">Active</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {users.map((u) => (
            <tr key={u._id}>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {u.name}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {u.email}
              </td>
              <td className="px-4 py-3">
                <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {u.currentSubscription?.plan?.name || "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`badge ${
                    u.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.isActive ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => toggle(u._id)}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                  {u.role !== "admin" && (
                    <button
                      onClick={() => remove(u._id)}
                      className="btn-danger !px-3 !py-1.5 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {!users.length && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No users.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Plans ---------------- */
function PlansTab() {
  const [plans, setPlans] = useState([]);
  const empty = {
    name: "",
    description: "",
    price: "",
    billingCycle: "monthly",
    tier: 1,
    features: "",
    isPopular: false,
  };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = () =>
    subscriptionApi
      .getPlans(true)
      .then((res) => setPlans(res.data.plans))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      tier: Number(form.tier),
      features: form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
    };
    try {
      if (editId) {
        await subscriptionApi.updatePlan(editId, payload);
        toast.success("Plan updated");
      } else {
        await subscriptionApi.createPlan(payload);
        toast.success("Plan created");
      }
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const edit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      billingCycle: p.billingCycle,
      tier: p.tier,
      features: (p.features || []).join(", "),
      isPopular: p.isPopular,
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Deactivate this plan?")) return;
    await subscriptionApi.deletePlan(id);
    toast.success("Plan deactivated");
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card lg:col-span-1">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
          {editId ? "Edit Plan" : "Create Plan"}
        </h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <input
            className="input"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <select
            className="input"
            value={form.billingCycle}
            onChange={(e) =>
              setForm({ ...form, billingCycle: e.target.value })
            }
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            className="input"
            type="number"
            placeholder="Tier (1=basic)"
            value={form.tier}
            onChange={(e) => setForm({ ...form, tier: e.target.value })}
          />
          <textarea
            className="input"
            placeholder="Features (comma separated)"
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) =>
                setForm({ ...form, isPopular: e.target.checked })
              }
            />
            Mark as popular
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              {editId ? "Update" : "Create"}
            </button>
            {editId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditId(null);
                  setForm(empty);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 table-wrap">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Cycle</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {plans.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {p.name}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {formatCurrency(p.price, p.currency)}
                </td>
                <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-400">
                  {p.billingCycle}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => edit(p)}
                      className="btn-secondary !px-3 !py-1.5 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p._id)}
                      className="btn-danger !px-3 !py-1.5 text-xs"
                    >
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Subscriptions ---------------- */
function SubscriptionsTab() {
  const [subs, setSubs] = useState([]);
  useEffect(() => {
    subscriptionApi
      .getAllSubscriptions()
      .then((res) => setSubs(res.data.subscriptions))
      .catch(() => {});
  }, []);
  return <SubscriptionTable subscriptions={subs} showUser />;
}

/* ---------------- Payments ---------------- */
function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  useEffect(() => {
    paymentApi
      .getAllPayments()
      .then((res) => setPayments(res.data.payments))
      .catch(() => {});
  }, []);

  return (
    <div className="table-wrap">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-left">Plan</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {payments.map((p) => (
            <tr key={p._id}>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-white">
                  {p.user?.name}
                </div>
                <div className="text-xs text-gray-500">{p.user?.email}</div>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {p.plan?.name || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {formatCurrency(p.amount, p.currency)}
              </td>
              <td className="px-4 py-3">
                <span className={`badge ${statusColor(p.status)}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {formatDate(p.createdAt)}
              </td>
            </tr>
          ))}
          {!payments.length && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No payments.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Invoices ---------------- */
function InvoicesTab() {
  const [invoices, setInvoices] = useState([]);
  useEffect(() => {
    paymentApi
      .getAllInvoices()
      .then((res) => setInvoices(res.data.invoices))
      .catch(() => {});
  }, []);

  const download = async (inv) => {
    try {
      const res = await paymentApi.downloadInvoice(inv._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${inv.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className="table-wrap">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left">Invoice #</th>
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-left">Total</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                {inv.invoiceNumber}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {inv.user?.name}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {formatCurrency(inv.total, inv.currency)}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {formatDate(inv.issuedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => download(inv)}
                  className="btn-secondary !px-3 !py-1.5 text-xs"
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
          {!invoices.length && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No invoices.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Coupons ---------------- */
function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const empty = {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "",
    minAmount: "",
    usageLimit: "",
    expiresAt: "",
  };
  const [form, setForm] = useState(empty);

  const load = () =>
    subscriptionApi
      .getCoupons()
      .then((res) => setCoupons(res.data.coupons))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      minAmount: form.minAmount ? Number(form.minAmount) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
    };
    try {
      await subscriptionApi.createCoupon(payload);
      toast.success("Coupon created");
      setForm(empty);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete coupon?")) return;
    await subscriptionApi.deleteCoupon(id);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card lg:col-span-1">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
          Create Coupon
        </h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="CODE"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
            required
          />
          <input
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <select
            className="input"
            value={form.discountType}
            onChange={(e) =>
              setForm({ ...form, discountType: e.target.value })
            }
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input
            className="input"
            type="number"
            placeholder="Discount Value"
            value={form.discountValue}
            onChange={(e) =>
              setForm({ ...form, discountValue: e.target.value })
            }
            required
          />
          <input
            className="input"
            type="number"
            placeholder="Max Discount (optional)"
            value={form.maxDiscount}
            onChange={(e) =>
              setForm({ ...form, maxDiscount: e.target.value })
            }
          />
          <input
            className="input"
            type="number"
            placeholder="Min Amount (optional)"
            value={form.minAmount}
            onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Usage Limit (optional)"
            value={form.usageLimit}
            onChange={(e) =>
              setForm({ ...form, usageLimit: e.target.value })
            }
          />
          <input
            className="input"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
          <button type="submit" className="btn-primary w-full">
            Create Coupon
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 table-wrap">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Used</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {coupons.map((c) => (
              <tr key={c._id}>
                <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">
                  {c.code}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {c.discountType === "percentage"
                    ? `${c.discountValue}%`
                    : formatCurrency(c.discountValue)}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.isActive ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(c._id)}
                    className="btn-danger !px-3 !py-1.5 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!coupons.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No coupons.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
