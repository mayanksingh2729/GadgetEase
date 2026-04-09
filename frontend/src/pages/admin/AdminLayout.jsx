import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";

const sidebarItems = [
  { label: "Dashboard", path: "/admin", icon: "https://img.icons8.com/?size=100&id=uWyVYfqqdYxW&format=png&color=000000" },
  { label: "Manage Users", path: "/admin/users", icon: "https://img.icons8.com/?size=100&id=2yC9SZKcXDdX&format=png&color=000000" },
  { label: "Manage Orders", path: "/admin/orders", icon: "https://img.icons8.com/?size=100&id=E0vwRtDq3M0w&format=png&color=000000" },
  { label: "Manage Products", path: "/admin/products", icon: "https://img.icons8.com/?size=100&id=obibkelMdpPs&format=png&color=000000" },
];

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-1 relative">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-56 bg-gray-900 text-white flex-shrink-0 transform transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-sky-400">Admin Panel</h2>
        </div>
        <nav className="py-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-700 text-sky-400 border-r-4 border-sky-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <img src={item.icon} alt="" className="w-5 h-5 invert" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto">
        {/* Mobile hamburger button */}
        <div className="md:hidden flex items-center p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 dark:text-gray-200 focus:outline-none"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 text-lg font-bold text-sky-500">Admin Panel</span>
        </div>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
