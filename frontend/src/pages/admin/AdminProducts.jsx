import React, { useState, useEffect } from "react";
import API from "../../api/axiosInstance";
import { showSuccess, showError } from "../../components/ToastMessage";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    id: "", name: "", brand: "", category: "", price: "", week: "", month: "",
    security: "", description: "", images: [""],
  });

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/products?page=${page}&limit=10`);
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      showError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ id: "", name: "", brand: "", category: "", price: "", week: "", month: "", security: "", description: "", images: [""] });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      week: product.week,
      month: product.month,
      security: product.security,
      description: product.description,
      images: product.images?.length > 0 ? [...product.images] : [""],
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      week: Number(form.week),
      month: Number(form.month),
      security: Number(form.security),
      images: form.images.map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingProduct) {
        await API.put(`/admin/products/${editingProduct.id}`, payload);
      } else {
        await API.post("/admin/products", payload);
      }
      await fetchProducts();
      resetForm();
      showSuccess(editingProduct ? "Product updated!" : "Product added!");
    } catch (err) {
      showError("Failed to save product");
    }
  };

  const handleDelete = async (productId, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await API.delete(`/admin/products/${productId}`);
      fetchProducts();
      showSuccess("Product deleted!");
    } catch (err) {
      showError("Failed to delete product");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><p className="text-gray-500 dark:text-gray-400 text-lg">Loading products...</p></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition">
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product ID</label>
              <input type="text" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })}
                placeholder="e.g. mouse-007" className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!!editingProduct} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                required className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand *</label>
              <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                required className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                required className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Price *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                required className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weekly Price *</label>
              <input type="number" value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })}
                required className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Price *</label>
              <input type="number" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
                required className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Deposit *</label>
              <input type="number" value={form.security} onChange={(e) => setForm({ ...form, security: e.target.value })}
                required className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URLs</label>
                <button type="button" onClick={() => setForm({ ...form, images: [...form.images, ""] })}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium">
                  <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-lg leading-none">+</span>
                  Add URL
                </button>
              </div>
              <div className="space-y-2">
                {form.images.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={url}
                      onChange={(e) => {
                        const updated = [...form.images];
                        updated[idx] = e.target.value;
                        setForm({ ...form, images: updated });
                      }}
                      placeholder={`Image URL ${idx + 1}`}
                      className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    {form.images.length > 1 && (
                      <button type="button"
                        onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                        className="text-red-500 hover:text-red-700 px-2 font-bold text-lg">
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                required rows="3" className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition">
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-medium transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-700">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Image</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Brand</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Category</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Price (D/W/M)</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Security</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <img src={p.images?.[0] || "https://via.placeholder.com/40"} alt={p.name}
                      className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{p.name}</td>
                  <td className="py-3 px-4 text-sm">{p.brand}</td>
                  <td className="py-3 px-4 text-sm">{p.category}</td>
                  <td className="py-3 px-4 text-sm">&#8377;{p.price} / &#8377;{p.week} / &#8377;{p.month}</td>
                  <td className="py-3 px-4 text-sm">&#8377;{p.security}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No products found.</p>}
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

export default AdminProducts;
