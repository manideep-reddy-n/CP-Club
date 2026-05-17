import React from "react";

export function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8">
      {/* Header Skeleton */}
      <div className="w-full max-w-7xl mb-8">
        <div className="h-12 sm:h-14 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-lg w-64 mb-2 animate-pulse" />
        <div className="h-4 bg-zinc-800 rounded w-48 animate-pulse" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 w-40 glass border border-white/10 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Table Card Skeleton */}
      <div className="w-full max-w-7xl glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead>
              <tr className="bg-zinc-900 border-b border-white/10">
                <th className="p-3 sm:p-4 text-left">
                  <div className="h-4 bg-matrix-200/20 rounded w-12 animate-pulse" />
                </th>
                <th className="p-3 sm:p-4 text-left">
                  <div className="h-4 bg-matrix-200/20 rounded w-16 animate-pulse" />
                </th>
                <th className="p-3 sm:p-4">
                  <div className="h-4 bg-matrix-200/20 rounded w-12 mx-auto animate-pulse" />
                </th>
                <th className="p-3 sm:p-4">
                  <div className="h-4 bg-matrix-200/20 rounded w-20 mx-auto animate-pulse" />
                </th>
                <th className="p-3 sm:p-4">
                  <div className="h-4 bg-matrix-200/20 rounded w-20 mx-auto animate-pulse" />
                </th>
                <th className="p-3 sm:p-4">
                  <div className="h-4 bg-matrix-200/20 rounded w-16 mx-auto animate-pulse" />
                </th>
                <th className="p-3 sm:p-4">
                  <div className="h-4 bg-matrix-200/20 rounded w-16 mx-auto animate-pulse" />
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {Array.from({ length: 10 }).map((_, index) => (
                <tr
                  key={index}
                  className={`border-b border-white/5 animate-pulse ${index % 2 === 0 ? "bg-black/30" : "bg-zinc-900/30"
                    }`}
                >
                  {/* Rank */}
                  <td className="p-3 sm:p-4 text-center">
                    <div className="h-6 w-6 bg-zinc-700 rounded mx-auto" />
                  </td>

                  {/* Name with Avatar */}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-700 rounded-full ring-2 ring-zinc-600" />
                      <div className="h-4 bg-zinc-700 rounded w-24 sm:w-32" />
                    </div>
                  </td>

                  {/* Year */}
                  <td className="p-3 sm:p-4">
                    <div className="h-4 bg-zinc-700 rounded w-10 mx-auto" />
                  </td>

                  {/* LeetCode Rating */}
                  <td className="p-3 sm:p-4">
                    <div className="h-4 bg-zinc-700 rounded w-12 mx-auto" />
                  </td>

                  {/* CF Rating */}
                  <td className="p-3 sm:p-4">
                    <div className="h-4 bg-zinc-700 rounded w-12 mx-auto" />
                  </td>

                  {/* Rank Badge */}
                  <td className="p-3 sm:p-4">
                    <div className="h-6 bg-zinc-700 rounded-md w-16 mx-auto" />
                  </td>

                  {/* Attendance */}
                  <td className="p-3 sm:p-4">
                    <div className="flex gap-2 items-center justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-zinc-700 rounded-full" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ContestTableSkeleton() {
  return (
    <div className="w-full px-4 py-8 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Table Skeleton */}
        <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="bg-zinc-900 border-b border-white/10 p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-4 bg-green-500/20 rounded w-16" />
              <div className="h-4 bg-green-500/20 rounded w-20" />
              <div className="h-4 bg-green-500/20 rounded w-20" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="bg-black">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="border-b border-white/5 p-4"
              >
                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Rank */}
                  <div className="flex items-center space-x-2">
                    {index < 3 ? (
                      <>
                        <div className="w-6 h-6 bg-zinc-700 rounded-full" />
                        <div className="h-4 bg-zinc-700 rounded w-8" />
                      </>
                    ) : (
                      <div className="h-4 bg-zinc-700 rounded w-8" />
                    )}
                  </div>

                  {/* Name */}
                  <div className="h-4 bg-zinc-700 rounded w-32" />

                  {/* Handle */}
                  <div className="h-4 bg-green-500/20 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}