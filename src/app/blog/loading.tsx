import React from "react";

export default function BlogLoading() {
  return (
    <div className="pt-28 sm:pt-36 min-h-screen bg-white">
      {/* Header Skeleton */}
      <div className="bg-[#0F2C59] py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 animate-pulse">
          <div className="w-24 h-4 bg-white/10 rounded-md" />
          <div className="w-64 h-8 bg-white/20 rounded-xl" />
          <div className="w-96 h-4 bg-white/10 rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="w-full h-80 bg-slate-100 rounded-3xl animate-pulse" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
