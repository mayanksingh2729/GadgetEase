import React from "react";

const OrderSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 ml-auto"></div>
      </div>
    </div>
    <div className="border-t pt-3 space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const OrderSkeletonGroup = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <OrderSkeleton key={i} />
    ))}
  </div>
);

export default OrderSkeleton;
