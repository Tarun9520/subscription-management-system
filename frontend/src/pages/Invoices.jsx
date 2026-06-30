import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { paymentApi } from "../services/paymentApi";
import { formatCurrency, formatDate, statusColor } from "../utils/format";
import toast from "react-hot-toast";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    paymentApi
      .getMyInvoices()
      .then((res) => setInvoices(res.data.invoices))
      .catch(() => {});
  }, []);

  const handleDownload = async (invoice) => {
    setBusyId(invoice._id);
    try {
      const res = await paymentApi.downloadInvoice(invoice._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download invoice");
    } finally {
      setBusyId(null);
    }
  };

  const handleEmail = async (invoice) => {
    setBusyId(invoice._id);
    try {
      await paymentApi.emailInvoice(invoice._id);
      toast.success("Invoice emailed to you");
    } catch (err) {
      toast.error("Failed to email invoice");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Invoices
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Download or email your invoices.
      </p>

      <div className="mt-6 table-wrap">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">Invoice #</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {inv.invoiceNumber}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {inv.plan?.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {formatDate(inv.issuedAt)}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {formatCurrency(inv.total, inv.currency)}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${statusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleDownload(inv)}
                      disabled={busyId === inv._id}
                      className="btn-secondary !px-3 !py-1.5 text-xs"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleEmail(inv)}
                      disabled={busyId === inv._id}
                      className="btn-primary !px-3 !py-1.5 text-xs"
                    >
                      Email
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!invoices.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
