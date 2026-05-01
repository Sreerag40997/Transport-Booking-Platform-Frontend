'use client';

export default function SortBar({
  busCount,
  sortBy,
  sortOrder,
  onSortToggle,
  loading
}) {
  const sortCategories = [
    { id: 'ratings', label: 'Ratings' },
    { id: 'departure', label: 'Departure' },
    { id: 'price', label: 'Price' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center justify-between">
      <span className="text-sm font-bold text-primary">
        {loading ? 'Updating results...' : `${busCount} buses found`}
      </span>
      
      <div className="flex items-center gap-6">
        <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Sort By:</span>
        {sortCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSortToggle(cat.id)}
            className={`flex items-center gap-1 text-[11px] font-bold uppercase transition-all ${
              sortBy === cat.id ? 'text-secondary' : 'text-outline hover:text-primary'
            }`}
          >
            {cat.label}
            {sortBy === cat.id && (
              <span className="material-symbols-outlined text-[14px]">
                {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
