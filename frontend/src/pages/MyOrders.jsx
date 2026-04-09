import React, { useState, useEffect } from "react";
import { useUserContext } from "../context/Usercontext";
import API from "../api/axiosInstance";
import { showSuccess, showError } from "../components/ToastMessage";
import { OrderSkeletonGroup } from "../components/skeletons/OrderSkeleton";

const MyOrders = () => {
  const { user } = useUserContext();
  const token = user?.token || localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/my-orders");
      setOrders(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchOrders();
  }, [token]);

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

  const returnStatusColor = (status) => {
    const colors = {
      "not-returned": "bg-orange-100 text-orange-700",
      "return-requested": "bg-purple-100 text-purple-700",
      "returned": "bg-green-100 text-green-700",
      "deposit-refunded": "bg-emerald-100 text-emerald-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const handleRequestReturn = async (orderId, itemIndex) => {
    try {
      await API.post(`/orders/${orderId}/request-return`, { itemIndex });
      showSuccess("Return requested successfully");
      fetchOrders();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to request return");
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isActiveOrder = (order) => {
    if (order.status === "cancelled") return false;
    return order.items?.some((item) =>
      !item.returnStatus || item.returnStatus === "not-returned" || item.returnStatus === "return-requested"
    );
  };

  const activeOrders = orders.filter(isActiveOrder);
  const pastOrders = orders.filter((o) => !isActiveOrder(o));
  const displayOrders = activeTab === "active" ? activeOrders : pastOrders;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Please log in to view your orders.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <OrderSkeletonGroup />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${activeTab === "active" ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
        >
          Active Rentals ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${activeTab === "past" ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
        >
          Past Rentals ({pastOrders.length})
        </button>
      </div>

      {displayOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {activeTab === "active" ? "No active rentals." : "No past rentals."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order ID: <span className="font-mono font-medium">{order._id.slice(-8)}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Placed on: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">&#8377;{order.totalAmount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t dark:border-gray-700 pt-3">
                <div className="space-y-3">
                  {order.items?.map((item, idx) => {
                    const daysLeft = getDaysRemaining(item.endDate);
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} | {item.duration} | &#8377;{item.totalPrice}
                          </p>
                          {item.startDate && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(item.startDate).toLocaleDateString()} → {new Date(item.endDate).toLocaleDateString()}
                              {daysLeft !== null && (
                                <span className={`ml-2 font-medium ${daysLeft > 0 ? "text-green-600" : "text-red-600"}`}>
                                  {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {item.returnStatus && item.returnStatus !== "not-returned" && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${returnStatusColor(item.returnStatus)}`}>
                              {item.returnStatus.replace("-", " ")}
                            </span>
                          )}
                          {order.status === "delivered" && (!item.returnStatus || item.returnStatus === "not-returned") && (
                            <button
                              onClick={() => handleRequestReturn(order._id, idx)}
                              className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition"
                            >
                              Request Return
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.shippingAddress && (
                <div className="border-t dark:border-gray-700 pt-3 mt-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Delivered to: {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              )}

              {/* Download Invoice */}
              {order.paymentStatus === "paid" && (
                <div className="border-t dark:border-gray-700 pt-3 mt-3">
                  <button
                    onClick={async () => {
                      try {
                        const response = await API.get(`/orders/${order._id}/invoice`, { responseType: "blob" });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", `invoice-${order._id.slice(-8)}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch {
                        showError("Failed to download invoice");
                      }
                    }}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Invoice
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
