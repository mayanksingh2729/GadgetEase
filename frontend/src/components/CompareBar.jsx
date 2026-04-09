import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompareContext } from "../context/CompareContext";

const CompareBar = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompareContext();
  const navigate = useNavigate();

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-3 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Compare ({compareItems.length}/3):</span>
          <div className="flex gap-3 overflow-x-auto max-w-full">
            {compareItems.map((product) => (
              <div key={product._id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/30"}
                  alt={product.name}
                  className="w-8 h-8 object-contain rounded"
                />
                <span className="text-xs max-w-[80px] sm:max-w-[100px] truncate">{product.name}</span>
                <button
                  onClick={() => removeFromCompare(product._id)}
                  className="text-gray-400 hover:text-red-400 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCompare}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5"
          >
            Clear
          </button>
          <button
            onClick={() => navigate("/compare")}
            disabled={compareItems.length < 2}
            className="bg-sky-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
