import React, { useState, useEffect } from "react";
import API from "../../api/axiosInstance";
import { showSuccess, showError } from "../../components/ToastMessage";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/orders?page=${page}&limit=10`);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      showError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? data : o)));
      showSuccess("Order status updated!");
    } catch (err) {
      showError("Failed to update order status");
    }
  };

  const statusColor = (status) => {
    const colors = {
      pending: "bg-gray-100 text-gray-700",
      confirmed: "bg-yellow-100 text-yellow-700",
      shipped: "bg-blue-100 text-blue-700",
      delivered: "bg-sky-100 text-sky-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><p className="text-gray-500 text-lg">Loading orders...</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <p className="text-gray-500 text-lg">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: <span className="font-mono">{order._id.slice(-8)}</span></p>
                  <p className="text-sm text-gray-500">Customer: <span className="font-medium text-gray-800">{order.userId?.name || "N/A"} ({order.userId?.email || ""})</span></p>
                  <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">&#8377;{order.totalAmount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3 mb-3">
                <p className="text-sm font-semibold mb-2">Items ({order.items?.length || 0}):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} | {item.duration} | &#8377;{item.totalPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.shippingAddress && (
                <div className="border-t pt-3 mb-3">
                  <p className="text-sm font-semibold mb-1">Shipping Address:</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.fullName}, {order.shippingAddress.phone}<br />
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              )}

              <div className="border-t pt-3 flex items-center gap-3">
                <label className="text-sm font-medium">Update Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition ${page === p ? "bg-gray-900 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
