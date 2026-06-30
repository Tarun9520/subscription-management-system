import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../components/Layout";
import { authApi } from "../services/authApi";
import { setUser } from "../redux/authSlice";
import toast from "react-hot-toast";

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: "", phone: "", avatar: "" });
  const [preview, setPreview] = useState("");
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "", avatar: "" });
      setPreview(user.avatar?.url || "");
    }
  }, [user]);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, avatar: reader.result }));
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.avatar) payload.avatar = form.avatar;
      const res = await authApi.updateProfile(payload);
      dispatch(setUser({ ...user, ...res.data.user }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      await authApi.changePassword(pwForm);
      toast.success("Password changed");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Profile Settings
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-900/40">
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.[0]?.toUpperCase()
                )}
              </div>
              <div>
                <label className="label">Avatar</label>
                <input type="file" accept="image/*" onChange={handleAvatar} />
              </div>
            </div>

            <div>
              <label className="label">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={user?.email || ""} disabled />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 90000 00000"
              />
            </div>

            <button type="submit" disabled={busy} className="btn-primary">
              Save Changes
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Change Password
          </h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                className="input"
                value={pwForm.currentPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, currentPassword: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input"
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPassword: e.target.value })
                }
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
