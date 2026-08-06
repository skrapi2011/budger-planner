export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-8 w-1/3" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="skeleton w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
            <div className="skeleton h-4 w-16 ml-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton w-10 h-10 rounded-lg" />
        <div className="skeleton h-4 w-2/3" />
      </div>
      <div className="skeleton h-8 w-1/2" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-slate-700">
      <div className="skeleton h-5 w-48 mb-4" />
      <div className="skeleton h-64 w-full rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="skeleton h-4 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}
