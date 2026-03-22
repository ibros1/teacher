// ContinueCourseSkeleton.tsx
"use client";

import { Skeleton } from "./skeleton";

const ContinueCourseSkeleton = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      <aside className="hidden lg:flex lg:w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <Skeleton className="h-5 w-52 rounded-lg" />
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-10 rounded" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-100 dark:border-slate-900 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <div className="space-y-2 min-w-0">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <div className="mt-3 space-y-2 pl-11">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
              <Skeleton className="h-5 w-40 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>

          <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            <Skeleton className="w-full h-full" />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-12 w-full sm:w-44 rounded-xl" />
            <Skeleton className="h-12 w-full sm:w-44 rounded-xl" />
            <Skeleton className="h-12 w-full sm:w-44 rounded-xl sm:ml-auto" />
          </div>

          <div className="mt-8 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
              <div className="px-4 sm:px-6 py-4">
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <div className="px-4 sm:px-6 py-4">
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="px-4 sm:px-6 py-4">
                <Skeleton className="h-4 w-36 rounded" />
              </div>
              <div className="px-4 sm:px-6 py-4">
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>

            <div className="p-6 space-y-4">
              <Skeleton className="h-7 w-2/3 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-11/12 rounded" />
              <Skeleton className="h-4 w-10/12 rounded" />
              <Skeleton className="h-4 w-9/12 rounded" />
              <div className="pt-2">
                <Skeleton className="h-11 w-44 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContinueCourseSkeleton;
