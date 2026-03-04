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

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex-shrink-0">
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
      <main className="flex-1 bg-gray-100 overflow-auto">
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
