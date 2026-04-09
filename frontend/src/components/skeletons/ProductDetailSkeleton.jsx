import React from "react";

const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
    <div className="flex flex-col md:flex-row gap-10">
      <div className="md:w-1/2 flex gap-4">
        <div className="flex flex-col space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl h-80"></div>
      </div>
      <div className="md:w-1/2 space-y-5">
        <div className="flex gap-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
          ))}
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;
