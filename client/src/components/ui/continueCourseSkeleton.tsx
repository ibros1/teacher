// ContinueCourseSkeleton.tsx
import { Skeleton } from "./skeleton";

const ContinueCourseSkeleton = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex lg:w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        {/* Sidebar header: course title + progress */}
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <Skeleton className="h-4 w-48 rounded-lg" />
          <Skeleton className="h-3 w-36 rounded-lg" />
          <div className="flex items-center justify-between text-xs">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
        </div>

        {/* Chapter + lesson list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-900 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
                <Skeleton className="h-5 w-10 rounded-full shrink-0" />
              </div>
              {/* Lesson items inside chapter */}
              <div className="pl-11 space-y-2">
                {Array.from({ length: i === 0 ? 4 : 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                    <Skeleton className="h-3 flex-1 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0">
        <div className="px-4 sm:px-6 lg:px-10 py-6 space-y-6">
          {/* Top bar: back + status badge */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile sidebar toggle */}
              <Skeleton className="lg:hidden h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-40 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>

          {/* Video player placeholder */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-sm">
            <Skeleton className="w-full h-full rounded-xl" />
          </div>

          {/* Navigation buttons row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-12 w-full sm:w-44 rounded-xl" />
            <Skeleton className="h-12 w-full sm:w-48 rounded-xl" />
            <Skeleton className="h-12 w-full sm:w-44 rounded-xl sm:ml-auto" />
          </div>

          {/* Content tabs + body */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Tab row */}
            <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 px-2">
              {["Lesson Content", "Assignment", "Community Discussion", "Student Info"].map((_, i) => (
                <div key={i} className="px-4 sm:px-5 py-4">
                  <Skeleton className={`h-4 rounded ${i === 0 ? "w-28" : i === 1 ? "w-20" : i === 2 ? "w-36" : "w-24"}`} />
                </div>
              ))}
            </div>

            {/* Tab body */}
            <div className="p-6 space-y-4">
              <Skeleton className="h-7 w-2/3 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-11/12 rounded" />
              <Skeleton className="h-4 w-10/12 rounded" />
              <Skeleton className="h-4 w-9/12 rounded" />
              <Skeleton className="h-4 w-8/12 rounded" />
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
