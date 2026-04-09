import React, { useState, useEffect } from "react";
import { useUserContext } from "../context/Usercontext";
import API from "../api/axiosInstance";
import { showSuccess, showError } from "../components/ToastMessage";

const Profile = () => {
  const { user, login } = useUserContext();
  const token = user?.token || localStorage.getItem("token");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (token) fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    try {
      const { data } = await API.get("/users/addresses");
      setAddresses(data);
    } catch (err) {
      showError("Failed to load addresses");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const { data } = await API.put("/users/update", { name, email });

      login({ ...user, name: data.user.name, email: data.user.email, token });
      showSuccess("Profile updated successfully!");
      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update profile");
      setMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/users/addresses", addressForm);
      setAddresses(data.addresses);
      setShowAddressForm(false);
      setAddressForm({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });
      showSuccess("Address added successfully!");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add address");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showError("New passwords do not match");
    }
    if (passwordForm.newPassword.length < 6) {
      return showError("New password must be at least 6 characters");
    }
    setChangingPassword(true);
    try {
      await API.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowChangePassword(false);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const { data } = await API.delete(`/users/addresses/${addressId}`);
      setAddresses(data.addresses);
      showSuccess("Address deleted!");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete address");
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-8">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <img
            src={user.avatarUrl || "https://via.placeholder.com/150/0000FF/FFFFFF?text=Avatar"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150/0000FF/FFFFFF?text=Avatar"; }}
          />
        </div>

        {/* Profile Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            {editing ? (
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400" />
            ) : (
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2.5">{user.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            {editing ? (
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400" />
            ) : (
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2.5">{user.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2.5">{user.role || "user"}</p>
          </div>
        </div>

        {message && (
          <p className={`mb-4 text-sm font-medium ${message.includes("success") ? "text-sky-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        {/* Edit / Save / Cancel Buttons */}
        <div className="mb-8">
          {editing ? (
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium transition">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => { setEditing(false); setName(user.name); setEmail(user.email); }}
                className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-medium transition">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition">
              Edit Profile
            </button>
          )}
        </div>

        {/* Divider */}
        <hr className="mb-6 dark:border-gray-700" />

        {/* Change Password Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Change Password</h2>
            <button onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              {showChangePassword ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password *</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="mt-4 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
              >
                {changingPassword ? "Changing..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <hr className="mb-6 dark:border-gray-700" />

        {/* Addresses Section - inside same box */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Saved Addresses</h2>
            <button onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              {showAddressForm ? "Cancel" : "+ Add Address"}
            </button>
          </div>

          {/* Add Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input type="text" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    required className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                  <input type="tel" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required maxLength="10" className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Line 1 *</label>
                  <input type="text" value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    required className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Line 2</label>
                  <input type="text" value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                  <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                  <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode *</label>
                  <input type="text" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    required maxLength="6" className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>
              <button type="submit" className="mt-4 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg font-medium transition">
                Save Address
              </button>
            </form>
          )}

          {/* Address Cards */}
          {addresses.length === 0 && !showAddressForm ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No saved addresses. Add one to speed up checkout.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{addr.fullName} <span className="text-gray-500 dark:text-gray-400 font-normal text-sm">({addr.phone})</span></p>
                    <p className="text-sm text-gray-600">
                      {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium ml-4 shrink-0">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
