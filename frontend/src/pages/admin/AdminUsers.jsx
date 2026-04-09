import React, { useState, useEffect } from "react";
import API from "../../api/axiosInstance";
import { showSuccess, showError } from "../../components/ToastMessage";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/users?page=${page}&limit=10`);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      showError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
      showSuccess("User deleted!");
    } catch (err) {
      showError("Failed to delete user");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><p className="text-gray-500 dark:text-gray-400 text-lg">Loading users...</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-700">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Avatar</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Role</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }}
                    />
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                      }`}>{u.role}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {u.role !== "admin" && (
                      <button onClick={() => handleDelete(u._id, u.name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No users found.</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition ${page === p ? "bg-gray-900 text-white" : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                }`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
