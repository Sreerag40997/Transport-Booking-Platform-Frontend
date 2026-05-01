'use client';

import BusResultCard from '@/components/buses/BusResultCard';

const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded w-48" />
        <div className="h-2 bg-gray-50 rounded w-24" />
      </div>
      <div className="h-8 bg-gray-100 rounded w-12" />
    </div>
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-50 rounded w-32" />
      <div className="h-6 bg-gray-50 rounded w-24" />
      <div className="h-10 bg-primary/5 rounded-full w-32" />
    </div>
  </div>
);

export default function ResultList({
  buses,
  loading,
  error,
  onSelect,
  onClearFilters,
  onTryAgain
}) {
  if (loading && buses.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-error/10 p-12 text-center shadow-sm">
        <p className="text-sm text-outline mb-4">{error}</p>
        <button
          onClick={onTryAgain}
          className="px-8 py-3 bg-secondary/10 text-secondary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-white transition-all"
        >
          Try again
        </button>
      </div>
    );
  }

  if (buses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-outline-variant/30 p-16 text-center shadow-sm">
        <p className="text-on-surface-variant text-xs mb-6">No buses match your filters.</p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-primary text-white rounded text-xs font-bold uppercase transition-all"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {loading && (
        <div className="absolute inset-x-0 top-0 bg-white/20 backdrop-blur-[1px] z-10 flex justify-center pt-10 pointer-events-none">
          <div className="bg-white shadow-xl px-4 py-2 rounded-full border border-gray-100 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-primary uppercase">Refreshing Results...</span>
          </div>
        </div>
      )}
      
      {buses.map((bus) => (
        <BusResultCard key={bus.id} bus={bus} onSelect={() => onSelect(bus)} />
      ))}
      
      <div className="py-10 text-center text-[11px] text-gray-400 font-bold uppercase tracking-widest">
        End of results
      </div>
    </div>
  );
}
