import React, { useState, useEffect } from "react";
import API from "../../api/axiosInstance";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await API.get("/admin/stats");
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen for new order events to auto-refresh
    const handler = () => fetchStats();
    window.addEventListener("new-order", handler);
    return () => window.removeEventListener("new-order", handler);
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><p className="text-gray-500 dark:text-gray-400 text-lg">Loading dashboard...</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-sky-400">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats?.totalOrders || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats?.totalProducts || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">&#8377;{stats?.totalRevenue || 0}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {stats?.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Order ID</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm font-mono">{order._id.slice(-8)}</td>
                    <td className="py-3 px-4 text-sm">{order.userId?.name || "N/A"}</td>
                    <td className="py-3 px-4 text-sm font-semibold">&#8377;{order.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === "delivered" ? "bg-sky-100 text-sky-700" :
                          order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                            order.status === "confirmed" ? "bg-yellow-100 text-yellow-700" :
                              order.status === "cancelled" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                        }`}>{order.status}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6">No orders yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
