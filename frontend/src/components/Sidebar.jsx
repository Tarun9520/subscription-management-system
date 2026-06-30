import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/pricing", label: "Plans", icon: "💳" },
  { to: "/billing", label: "Billing", icon: "🧾" },
  { to: "/invoices", label: "Invoices", icon: "📄" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const adminLinks = [
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/admin", label: "Admin Panel", icon: "⚙️" },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "admin";

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-brand-600 text-white"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-gray-200 bg-white p-4 transition-transform dark:border-gray-700 dark:bg-gray-900 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={linkClass}
              onClick={onClose}
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="mt-4 px-3 text-xs font-semibold uppercase text-gray-400">
                Admin
              </div>
              {adminLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={linkClass}
                  onClick={onClose}
                >
                  <span>{l.icon}</span>
                  {l.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
          Need help? Contact support@subhub.com
        </div>
      </aside>
    </>
  );
}
