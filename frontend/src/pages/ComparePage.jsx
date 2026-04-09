import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompareContext } from "../context/CompareContext";

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompareContext();
  const navigate = useNavigate();

  if (compareItems.length < 2) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Compare Products</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Select at least 2 products to compare.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const rows = [
    { label: "Image", render: (p) => (
      <img src={p.images?.[0] || "https://via.placeholder.com/150"} alt={p.name} className="h-32 object-contain mx-auto" />
    )},
    { label: "Name", render: (p) => <span className="font-semibold">{p.name}</span> },
    { label: "Brand", render: (p) => p.brand },
    { label: "Category", render: (p) => <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full">{p.category}</span> },
    { label: "Daily Price", render: (p) => `₹${p.price}`, compare: "price", type: "min" },
    { label: "Weekly Price", render: (p) => `₹${p.week}`, compare: "week", type: "min" },
    { label: "Monthly Price", render: (p) => `₹${p.month}`, compare: "month", type: "min" },
    { label: "Security Deposit", render: (p) => `₹${p.security}`, compare: "security", type: "min" },
    { label: "Description", render: (p) => <span className="text-sm text-gray-600">{p.description?.substring(0, 150)}...</span> },
  ];

  const getMinValue = (field) => Math.min(...compareItems.map((p) => p[field] || 0));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Compare Products</h1>
        <button
          onClick={() => { clearCompare(); navigate("/"); }}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700"
        >
          Clear All
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <tbody>
            {rows.map((row, idx) => {
              const minVal = row.compare ? getMinValue(row.compare) : null;
              return (
                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-700" : "bg-white dark:bg-gray-800"}>
                  <td className="px-3 py-3 sm:px-4 sm:py-4 font-medium text-gray-700 dark:text-gray-300 w-32 sm:w-40 border-r">{row.label}</td>
                  {compareItems.map((product) => {
                    const isBest = row.compare && product[row.compare] === minVal;
                    return (
                      <td key={product._id} className={`px-3 py-3 sm:px-4 sm:py-4 text-center ${isBest ? "text-green-600 font-bold" : ""}`}>
                        {row.render(product)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="bg-gray-50 dark:bg-gray-700">
              <td className="px-3 py-3 sm:px-4 sm:py-4 font-medium text-gray-700 dark:text-gray-300 border-r">Actions</td>
              {compareItems.map((product) => (
                <td key={product._id} className="px-3 py-3 sm:px-4 sm:py-4 text-center">
                  <div className="flex flex-col gap-2 items-center">
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
                    >
                      View Product
                    </button>
                    <button
                      onClick={() => removeFromCompare(product._id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
