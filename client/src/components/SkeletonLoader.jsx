import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 animate-pulse shadow-sm">
      <div className="w-full h-48 bg-gray-100 rounded-xl" />
      <div className="space-y-2">
        <div className="w-1/3 h-3 bg-gray-100 rounded" />
        <div className="w-3/4 h-4 bg-gray-200 rounded" />
        <div className="w-1/2 h-3 bg-gray-100 rounded" />
        <div className="w-2/3 h-6 bg-gray-200 rounded pt-1" />
      </div>
      <div className="pt-2 flex gap-2">
        <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 animate-pulse text-center shadow-sm">
      <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto" />
      <div className="w-2/3 h-4 bg-gray-200 rounded mx-auto" />
    </div>
  );
};
