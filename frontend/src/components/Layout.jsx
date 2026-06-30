import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children, sidebar = true }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar onToggleSidebar={() => setOpen((o) => !o)} />
      <div className="flex">
        {sidebar && <Sidebar open={open} onClose={() => setOpen(false)} />}
        <main
          className={`min-h-[calc(100vh-4rem)] flex-1 p-4 md:p-6 ${
            sidebar ? "lg:ml-64" : ""
          }`}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
