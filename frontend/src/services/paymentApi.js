import axiosClient from "./axiosClient";

export const paymentApi = {
  createOrder: (data) => axiosClient.post("/payments/order", data),
  verify: (data) => axiosClient.post("/payments/verify", data),
  getHistory: () => axiosClient.get("/payments/history"),

  // Invoices
  getMyInvoices: () => axiosClient.get("/invoices/me"),
  getInvoice: (id) => axiosClient.get(`/invoices/${id}`),
  downloadInvoice: (id) =>
    axiosClient.get(`/invoices/${id}/download`, { responseType: "blob" }),
  emailInvoice: (id) => axiosClient.post(`/invoices/${id}/email`),

  // Admin
  getAllPayments: () => axiosClient.get("/payments"),
  getAllInvoices: () => axiosClient.get("/invoices"),
};
