import axiosClient from "./axiosClient";

export const authApi = {
  register: (data) => axiosClient.post("/auth/register", data),
  login: (data) => axiosClient.post("/auth/login", data),
  logout: () => axiosClient.post("/auth/logout"),
  getMe: () => axiosClient.get("/auth/me"),
  updateProfile: (data) => axiosClient.put("/auth/profile", data),
  changePassword: (data) => axiosClient.put("/auth/change-password", data),
  forgotPassword: (data) => axiosClient.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    axiosClient.post(`/auth/reset-password/${token}`, data),

  // Admin
  getUsers: () => axiosClient.get("/auth/users"),
  toggleUserStatus: (id) => axiosClient.put(`/auth/users/${id}/status`),
  deleteUser: (id) => axiosClient.delete(`/auth/users/${id}`),
};
