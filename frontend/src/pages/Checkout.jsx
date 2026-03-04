import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserContext } from "../context/Usercontext";
import API from "../api/axiosInstance";
import { showSuccess, showError, showWarning } from "../components/ToastMessage";

const Checkout = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = user?.token || localStorage.getItem("token");

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const [address, setAddress] = useState({
    fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (searchParams.get("payment") === "cancelled") {
      showWarning("Payment was cancelled. You can try again.");
    }

    const fetchData = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          API.get("/cart"),
          API.get("/users/addresses"),
        ]);

        setCartItems(cartRes.data.items || []);
        setTotalAmount(cartRes.data.totalAmount || 0);

        const addrs = addrRes.data;
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedAddressId(addrs[0]._id);
        } else {
          setShowNewForm(true);
        }
      } catch (err) {
        showError("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate, searchParams]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setError("");
  };

  const getSelectedAddress = () => {
    if (showNewForm) return address;
    return savedAddresses.find((a) => a._id === selectedAddressId) || null;
  };

  const handlePlaceOrder = async () => {
    const shippingAddress = getSelectedAddress();

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone ||
      !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      showWarning("Please select or fill in a complete shipping address.");
      setError("Please select or fill in a complete shipping address.");
      return;
    }

    if (showNewForm) {
      if (!/^\d{10}$/.test(shippingAddress.phone)) {
        showWarning("Please enter a valid 10-digit phone number.");
        setError("Please enter a valid 10-digit phone number.");
        return;
      }
      if (!/^\d{6}$/.test(shippingAddress.pincode)) {
        showWarning("Please enter a valid 6-digit pincode.");
        setError("Please enter a valid 6-digit pincode.");
        return;
      }
    }

    if (!agreed) {
      showWarning("You must agree to the terms and conditions.");
      setError("You must agree to the terms and conditions.");
      return;
    }

    setError("");
    setPlacing(true);

    try {
      // Save new address to profile if entering manually
      if (showNewForm) {
        await API.post("/users/addresses", shippingAddress);
      }

      // Create Stripe Checkout Session and redirect
      const { data } = await API.post("/payment/create-checkout-session", { shippingAddress });

      // Redirect to Stripe hosted checkout page
      window.location.href = data.url;
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message || err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to initiate payment";
      showError(msg);
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products before checking out.</p>
        <button onClick={() => navigate("/")}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left - Shipping Address */}
        <div className="lg:w-3/5">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="bg-gray-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
              Shipping Address
            </h2>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !showNewForm && (
              <div className="space-y-3 mb-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => { setSelectedAddressId(addr._id); setError(""); }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddressId === addr._id
                        ? "border-sky-400 bg-sky-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <p className="font-semibold text-gray-800">{addr.fullName} <span className="text-gray-500 font-normal text-sm">({addr.phone})</span></p>
                    <p className="text-sm text-gray-600">
                      {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    </p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}
                <button onClick={() => { setShowNewForm(true); setSelectedAddressId(null); }}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-sky-400 hover:text-sky-600 transition font-medium text-sm">
                  + Add New Address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {showNewForm && (
              <>
                {savedAddresses.length > 0 && (
                  <button onClick={() => { setShowNewForm(false); setSelectedAddressId(savedAddresses[0]?._id); }}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium mb-4 block">
                    Use saved address instead
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="fullName" value={address.fullName} onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" name="phone" value={address.phone} onChange={handleChange}
                      placeholder="9876543210" maxLength="10"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input type="text" name="addressLine1" value={address.addressLine1} onChange={handleChange}
                      placeholder="House/Flat No., Building, Street"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input type="text" name="addressLine2" value={address.addressLine2} onChange={handleChange}
                      placeholder="Landmark, Area (optional)"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" name="city" value={address.city} onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input type="text" name="state" value={address.state} onChange={handleChange}
                      placeholder="Maharashtra"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" name="pincode" value={address.pincode} onChange={handleChange}
                      placeholder="400001" maxLength="6"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Terms */}
          <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-gray-900 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
              Terms & Conditions
            </h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)}
                className="mt-1 w-4 h-4 accent-blue-600" />
              <span className="text-sm text-gray-600">
                I agree to the rental terms and conditions. I understand that the security deposit will be refunded upon return of the product in good condition.
              </span>
            </label>
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="lg:w-2/5">
          <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cartItems.map((item, idx) => {
                const prodId = item.productId?._id || item.productId;
                return (
                  <div key={`${prodId}-${item.duration}-${idx}`} className="flex gap-3 p-2 bg-gray-50 rounded-lg">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.duration} x {item.quantity} | &#8377;{item.price}
                      </p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">&#8377;{item.totalPrice}</p>
                  </div>
                );
              })}
            </div>

            <hr className="my-4" />

            {(() => {
              const rentalTotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
              const securityTotal = cartItems.reduce((sum, item) => sum + ((item.security || 0) * item.quantity), 0);
              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rental Amount</span>
                    <span>&#8377;{rentalTotal}</span>
                  </div>
                  {securityTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Security Deposit</span>
                      <span className="text-sky-600">&#8377;{securityTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-sky-500 font-medium">Free</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-sky-500">&#8377;{totalAmount}</span>
                  </div>
                </div>
              );
            })()}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className={`w-full mt-6 py-3.5 rounded-xl text-white font-bold text-lg transition-all ${placing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                }`}
            >
              {placing ? "Redirecting to Payment..." : "Pay & Place Order"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Secure checkout powered by Stripe. Your payment information is protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
