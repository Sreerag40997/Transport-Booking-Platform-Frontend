'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { busApi } from '@/lib/busApi';

export default function CityInput({ label, placeholder, value, onChange, className = "" }) {
  const [query, setQuery] = useState(value || '');
  const [allStops, setAllStops] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showList, setShowList] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Sync internal query with external value (for Swap button)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load all stops once on first focus
  const loadStops = useCallback(async () => {
    if (fetched) return;
    try {
      setFetching(true);
      const results = await busApi.getBusStops('');
      const stops = Array.isArray(results) ? results : [];
      setAllStops(stops);
      setFiltered(stops);
      setFetched(true);
    } catch {
      setAllStops([]);
      setFiltered([]);
    } finally {
      setFetching(false);
    }
  }, [fetched]);

  const handleFocus = () => {
    setShowList(true);
    loadStops();
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setShowList(true);

    // Filter locally with debounce
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!val.trim()) {
        setFiltered(allStops);
        return;
      }
      const q = val.toLowerCase();
      setFiltered(
        allStops.filter(s =>
          (s.city || '').toLowerCase().includes(q) ||
          (s.name || '').toLowerCase().includes(q) ||
          (s.state || '').toLowerCase().includes(q)
        )
      );
    }, 150);
  };

  const handleSelect = (stop) => {
    const displayName = stop.city || stop.name || '';
    setQuery(displayName);
    onChange(displayName);
    setShowList(false);
  };

  const isQueryEmpty = !query.trim();
  const visibleStops = isQueryEmpty ? filtered.slice(0, 3) : filtered.slice(0, 8);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="block text-[9px] text-gray-400 uppercase font-bold leading-none mb-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-0 focus:outline-none"
        autoComplete="off"
      />

      {showList && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden min-w-[240px]">
          {fetching ? (
            <div className="flex items-center gap-3 px-5 py-4 text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-100 border-t-[#D84E55] rounded-full animate-spin shrink-0" />
              <span className="text-xs">Loading stops...</span>
            </div>
          ) : visibleStops.length === 0 ? (
            <div className="px-5 py-4 text-xs text-gray-400">No stops found</div>
          ) : (
            <>
              {isQueryEmpty && (
                <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Top Destinations</p>
                </div>
              )}
              {visibleStops.map((stop, i) => {
                const cityName = stop.city || 'Unknown';
                const subLabel = [stop.state, stop.name].filter(Boolean).join(', ');

                return (
                  <button
                    key={stop.id || i}
                    type="button"
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                    onClick={() => handleSelect(stop)}
                  >
                    <span className="material-symbols-outlined text-gray-300 text-base shrink-0">location_on</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate">{cityName}</p>
                      {subLabel && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{subLabel}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          )}
          {!fetching && !isQueryEmpty && filtered.length > 8 && (
            <div className="px-5 py-2 border-t border-gray-100 text-[10px] text-gray-400 text-center">
              +{filtered.length - 8} more stops — type to narrow down
            </div>
          )}
        </div>
      )}
    </div>
  );
}
