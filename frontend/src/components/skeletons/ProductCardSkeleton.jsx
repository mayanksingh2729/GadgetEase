import React from "react";

const ProductCardSkeleton = () => (
  <div className="flex bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden w-[280px] h-[180px] min-w-[280px] animate-pulse">
    <div className="w-1/2 bg-gray-200 dark:bg-gray-700"></div>
    <div className="w-2/3 p-3 flex flex-col justify-between">
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
);

export const ProductCardSkeletonGroup = ({ count = 6 }) => (
  <div className="flex-grow mt-10 px-4">
    <div className="mt-8">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4 animate-pulse"></div>
      <div className="flex space-x-6 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
    <div className="mt-8">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4 animate-pulse"></div>
      <div className="flex space-x-6 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export default ProductCardSkeleton;
