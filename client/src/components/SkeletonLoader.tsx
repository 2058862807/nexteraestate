export default function SkeletonLoader() {
  return (
    <div className="dashboard-container overflow-x-hidden">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}