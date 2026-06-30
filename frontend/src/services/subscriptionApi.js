import axiosClient from "./axiosClient";

export const subscriptionApi = {
  // Plans
  getPlans: (all = false) =>
    axiosClient.get(`/plans${all ? "?all=true" : ""}`),
  getPlan: (id) => axiosClient.get(`/plans/${id}`),
  createPlan: (data) => axiosClient.post("/plans", data),
  updatePlan: (id, data) => axiosClient.put(`/plans/${id}`, data),
  deletePlan: (id) => axiosClient.delete(`/plans/${id}`),

  // Subscriptions
  getMySubscription: () => axiosClient.get("/subscriptions/me"),
  getMyHistory: () => axiosClient.get("/subscriptions/history"),
  cancel: () => axiosClient.put("/subscriptions/cancel"),
  resume: () => axiosClient.put("/subscriptions/resume"),
  pause: () => axiosClient.put("/subscriptions/pause"),
  changePreview: (data) =>
    axiosClient.post("/subscriptions/change-preview", data),

  // Admin
  getAllSubscriptions: () => axiosClient.get("/subscriptions"),
  getAnalytics: () => axiosClient.get("/subscriptions/analytics"),

  // Coupons
  applyCoupon: (data) => axiosClient.post("/coupons/apply", data),
  getCoupons: () => axiosClient.get("/coupons"),
  createCoupon: (data) => axiosClient.post("/coupons", data),
  updateCoupon: (id, data) => axiosClient.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => axiosClient.delete(`/coupons/${id}`),
};
