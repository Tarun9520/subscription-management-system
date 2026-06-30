import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import useDarkMode from "../hooks/useDarkMode";
import toast from "react-hot-toast";

export default function Navbar({ onToggleSidebar }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">
              S
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              SubHub
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/pricing"
            className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300"
          >
            Pricing
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
            title="Toggle theme"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-700 dark:text-gray-300 sm:inline">
                Hi, {user?.name?.split(" ")[0]}
              </span>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
