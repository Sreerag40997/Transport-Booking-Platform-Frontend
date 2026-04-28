'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { busApi } from '@/lib/busApi';
import BusFilterSidebar from '@/components/buses/BusFilterSidebar';
import BusResultCard from '@/components/buses/BusResultCard';
import CityInput from '@/components/buses/CityInput';
import BusDetailsDrawer from '@/components/buses/BusDetailsDrawer';

/**
 * BusResultsPage - The main results view for bus searches.
 * Handles deep data enrichment, filtering, sorting, and header state management.
 */
export default function BusResultsPage() {
  const router = useRouter();

  // --- Store State ---
  const setBusSearchQuery = useBookingStore((s) => s.setBusSearchQuery);
  const busSearchQuery = useBookingStore((s) => s.busSearchQuery);
  const setBusSelectedInstance = useBookingStore((s) => s.setBusSelectedInstance);

  // --- UI State ---
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Bus Details Drawer State ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  // --- Data & Filtering State ---
  const [buses, setBuses] = useState([]);
  const [uniqueBoardingPoints, setUniqueBoardingPoints] = useState([]);
  const [uniqueDroppingPoints, setUniqueDroppingPoints] = useState([]);
  const [sortBy, setSortBy] = useState('ratings');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeFilters, setActiveFilters] = useState({
    departureTimes: [],
    arrivalTimes: [],
    types: [],
    operators: [],
    boardingPoints: [],
    droppingPoints: []
  });

  // --- Search Bar State (Header) ---
  const [hOrigin, setHOrigin] = useState('');
  const [hDest, setHDest] = useState('');
  const [hDate, setHDate] = useState('');

  // Derived values for display
  const origin = busSearchQuery?.origin || '';
  const dest = busSearchQuery?.destination || '';
  const date = busSearchQuery?.departureDate || busSearchQuery?.date || '';

  // --- Data Fetching & Enrichment ---

  /**
   * fetchBuses - Deep fetches all required data for each bus result.
   */
  const fetchBuses = useCallback(async (searchOrigin, searchDest, searchDate) => {
    if (!searchOrigin || !searchDest || !searchDate) return;
    try {
      setLoading(true);
      setError('');

      const res = await busApi.searchBuses({
        origin: searchOrigin,
        destination: searchDest,
        travel_date: searchDate,
        departure_date: searchDate,
      });

      const busList = Array.isArray(res) ? res : [];

      // Concurrently enrich each bus with detailed route/fare/seat/amenity data
      const enrichedBuses = await Promise.all(busList.map(async (bus) => {
        try {
          const [bP, dP, fares, seatData, amenities] = await Promise.all([
            busApi.getBoardingPoints(bus.id),
            busApi.getDroppingPoints(bus.id),
            busApi.getFares(bus.id),
            busApi.getSeats(bus.id),
            busApi.getAmenities(bus.id)
          ]);

          const seats = seatData?.seats || seatData || [];
          const availableCount = Array.isArray(seats)
            ? seats.filter(s => s.seat_available === true || s.is_available === true || s.status === 'AVAILABLE').length
            : 0;

          return {
            ...bus,
            route_boarding_points: bP || [],
            route_dropping_points: dP || [],
            all_fares: fares || [],
            available_count: availableCount,
            bus_amenities: amenities || []
          };
        } catch (e) {
          console.error("Error enriching bus", bus.id, e);
          return { ...bus, route_boarding_points: [], route_dropping_points: [], all_fares: [], available_count: 0, bus_amenities: [] };
        }
      }));

      setBuses(enrichedBuses);

      // Collect unique stops for the contextual sidebar filter
      const bPoints = new Set();
      const dPoints = new Set();
      enrichedBuses.forEach(b => {
        b.route_boarding_points.forEach(p => bPoints.add(p.name || p.stop?.name));
        b.route_dropping_points.forEach(p => dPoints.add(p.name || p.stop?.name));
        if (b.bus?.origin_stop?.name) bPoints.add(b.bus.origin_stop.name);
        if (b.bus?.destination_stop?.name) dPoints.add(b.bus.destination_stop.name);
      });

      setUniqueBoardingPoints(Array.from(bPoints).filter(Boolean).sort());
      setUniqueDroppingPoints(Array.from(dPoints).filter(Boolean).sort());

    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch buses.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Handlers ---

  const handleSearch = () => {
    if (!hOrigin || !hDest || !hDate) return;
    const p = new URLSearchParams();
    p.set('origin', hOrigin);
    p.set('destination', hDest);
    p.set('date', hDate);

    router.push(`/buses/results?${p.toString()}`);
    fetchBuses(hOrigin, hDest, hDate);

    setBusSearchQuery({
      ...busSearchQuery,
      origin: hOrigin,
      destination: hDest,
      date: hDate,
      departureDate: hDate
    });
  };

  const handleSelect = (bus) => {
    setBusSelectedInstance(bus);
    setSelectedBus(bus);
    setIsDrawerOpen(true);
  };

  const toggleSort = (category) => {
    if (sortBy === category) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(category);
      setSortOrder(category === 'price' ? 'asc' : 'desc');
    }
  };

  // --- Lifecycle Hooks ---

  useEffect(() => {
    const handleScroll = () => setIsHeaderSticky(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const urlDate = p.get('date') || '';
    const urlOrigin = p.get('origin') || '';
    const urlDest = p.get('destination') || '';

    if (!urlDate) {
      setLoading(false);
      setError('Departure date is required.');
      return;
    }

    setHOrigin(urlOrigin);
    setHDest(urlDest);
    setHDate(urlDate);

    setBusSearchQuery({
      origin: urlOrigin,
      destination: urlDest,
      departureDate: urlDate,
      date: urlDate,
      adults: 1,
      class: 'AC'
    });

    fetchBuses(urlOrigin, urlDest, urlDate);
  }, [fetchBuses, setBusSearchQuery]);

  // --- Helper Logic ---

  const isTimeInRange = (timeStr, slot) => {
    const hour = new Date(timeStr).getHours();
    if (slot === 'Before 6 am') return hour < 6;
    if (slot === '6 am - 12 pm') return hour >= 6 && hour < 12;
    if (slot === '12 pm - 6 pm') return hour >= 12 && hour < 18;
    if (slot === 'After 6 pm') return hour >= 18;
    return true;
  };

  const fmtDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // --- Filter & Sort Implementation ---

  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      const busInfo = bus.bus || {};
      const busType = busInfo.bus_type || {};
      const operator = busInfo.operator || {};
      const opName = operator.name || bus.operator_name || '';
      const isAC = busType.ac ?? false;
      const seatLayout = busType.seat_layout || {};

      // Time Filters
      const depTime = bus.departure_at || bus.departure_time;
      const arrTime = bus.arrival_at || bus.arrival_time;
      if (activeFilters.departureTimes.length > 0 && !activeFilters.departureTimes.some(slot => isTimeInRange(depTime, slot))) return false;
      if (activeFilters.arrivalTimes.length > 0 && !activeFilters.arrivalTimes.some(slot => isTimeInRange(arrTime, slot))) return false;

      // Category Filters
      if (activeFilters.types.length > 0) {
        const matchesType = activeFilters.types.some(type => {
          const t = type.toLowerCase();
          if (t === 'ac') return isAC;
          if (t === 'non-ac') return !isAC;
          if (t === 'sleeper') return (seatLayout.sleeper?.lower_berths || 0) > 0 || busType.name?.toLowerCase().includes('sleeper');
          if (t === 'seater') return (seatLayout.seater?.rows || 0) > 0 || busType.name?.toLowerCase().includes('seater');
          if (t === 'semi-sleeper') return (seatLayout.semi_sleeper?.rows || 0) > 0 || busType.name?.toLowerCase().includes('semi');
          return true;
        });
        if (!matchesType) return false;
      }

      // Operator & Route Filters
      if (activeFilters.operators.length > 0 && !activeFilters.operators.includes(opName)) return false;

      if (activeFilters.boardingPoints?.length > 0) {
        const busStops = [busInfo.origin_stop?.name, ...(bus.route_boarding_points || []).map(p => p.name || p.stop?.name)].filter(Boolean);
        if (!activeFilters.boardingPoints.some(p => busStops.includes(p))) return false;
      }
      if (activeFilters.droppingPoints?.length > 0) {
        const busStops = [busInfo.destination_stop?.name, ...(bus.route_dropping_points || []).map(p => p.name || p.stop?.name)].filter(Boolean);
        if (!activeFilters.droppingPoints.some(p => busStops.includes(p))) return false;
      }

      return true;
    });
  }, [buses, activeFilters]);

  const sortedBuses = useMemo(() => {
    return [...filteredBuses].sort((a, b) => {
      let comp = 0;
      const getMin = (item) => {
        const prices = [item.current_price_seater, item.current_price_semi_sleeper, item.current_price_sleeper].filter(p => p > 0);
        return prices.length > 0 ? Math.min(...prices) : (item.starting_fare || 0);
      };

      if (sortBy === 'ratings') comp = (b.bus?.operator?.rating || b.rating || 0) - (a.bus?.operator?.rating || a.rating || 0);
      else if (sortBy === 'departure') comp = new Date(a.departure_at || a.departure_time).getTime() - new Date(b.departure_at || b.departure_time).getTime();
      else if (sortBy === 'price') comp = getMin(a) - getMin(b);

      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [filteredBuses, sortBy, sortOrder]);

  // --- Rendering Components ---
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

  return (
    <main className="min-h-screen bg-surface pt-20">
      <header className={`z-[60] border-b transition-all duration-300 ${isHeaderSticky
        ? 'fixed top-0 left-0 right-0 py-5 bg-surface border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
        : 'relative py-6 bg-surface border-gray-200'
        }`}>
        <div className="mx-auto px-10 max-w-[1240px]">
          {!isHeaderSticky && (
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-6">
                <button onClick={() => router.push('/buses')} className="w-9 h-9 flex items-center justify-center text-primary/80 hover:bg-primary/5 rounded-full transition-all">
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div>
                  <div className="flex items-center gap-3 font-bold text-xl text-primary tracking-tight">
                    <span>{hOrigin || origin || 'Searching...'}</span>
                    <span className="material-symbols-outlined text-primary/20">trending_flat</span>
                    <span>{hDest || dest || '...'}</span>
                  </div>
                  <p className="text-[10px] font-bold text-primary/40 uppercase mt-0.5">
                    {loading ? 'Refreshing buses...' : `${buses.length} buses found`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={`flex items-center bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 ${isHeaderSticky ? 'h-[44px] max-w-[1400px] mx-auto' : 'h-[56px]'}`}>
            <div className="flex-1 px-5 border-r border-gray-100">
              <CityInput placeholder="Source" value={hOrigin} onChange={setHOrigin} className="w-full font-bold text-sm text-gray-800 bg-transparent" />
            </div>
            <button onClick={() => { const t = hOrigin; setHOrigin(hDest); setHDest(t); }} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm -mx-4 z-10 hover:border-secondary transition-all">
              <span className="material-symbols-outlined text-lg">swap_horiz</span>
            </button>
            <div className="flex-1 px-5 border-r border-gray-100 pl-8">
              <CityInput placeholder="Destination" value={hDest} onChange={setHDest} className="w-full font-bold text-sm text-gray-800 bg-transparent" />
            </div>
            <div className="flex-[1.2] px-5 flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-300 text-xl">calendar_today</span>
              <input type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer" />
            </div>
            <button onClick={handleSearch} className="h-full px-10 bg-primary rounded-r-xl text-white hover:bg-secondary hover:text-primary transition-all">
              <span className="material-symbols-outlined text-3xl font-bold">search</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1240px] mx-auto px-10 py-8">
        <div className="flex gap-12">
          <aside className="hidden lg:block w-[300px] shrink-0">
            <BusFilterSidebar
              onFilterChange={setActiveFilters}
              origin={hOrigin}
              destination={hDest}
              boardingPoints={uniqueBoardingPoints}
              droppingPoints={uniqueDroppingPoints}
            />
          </aside>

          <section className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-primary">{loading ? 'Updating results...' : `${filteredBuses.length} buses found`}</span>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Sort:</span>
                {['ratings', 'departure', 'price'].map((cat) => (
                  <button key={cat} onClick={() => toggleSort(cat)} className={`flex items-center gap-1 text-[11px] font-bold uppercase transition-all ${sortBy === cat ? 'text-secondary' : 'text-outline hover:text-primary'}`}>
                    {cat}
                    {sortBy === cat && <span className="material-symbols-outlined text-[14px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {loading && buses.length === 0 ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : error ? (
                <div className="bg-white rounded-xl border border-error/10 p-12 text-center shadow-sm">
                  <p className="text-sm text-outline mb-4">{error}</p>
                  <button onClick={() => router.push('/buses')} className="px-8 py-3 bg-secondary/10 text-secondary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-white transition-all">Try again</button>
                </div>
              ) : sortedBuses.length === 0 ? (
                <div className="bg-white rounded-lg border border-dashed border-outline-variant/30 p-16 text-center shadow-sm">
                  <p className="text-on-surface-variant text-xs mb-6">No buses match your filters.</p>
                  <button onClick={() => setActiveFilters({ departureTimes: [], arrivalTimes: [], types: [], operators: [], boardingPoints: [], droppingPoints: [] })} className="px-6 py-2 bg-primary text-white rounded text-xs font-bold uppercase transition-all">Clear filters</button>
                </div>
              ) : (
                <>
                  {loading && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 flex justify-center pt-20 pointer-events-none">
                      <div className="bg-white shadow-xl px-4 py-2 rounded-full border border-gray-100 flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-primary uppercase">Refreshing Results...</span>
                      </div>
                    </div>
                  )}
                  {sortedBuses.map((bus) => (
                    <BusResultCard key={bus.id} bus={bus} onSelect={() => handleSelect(bus)} />
                  ))}
                  <div className="py-10 text-center text-[11px] text-gray-400 font-bold uppercase tracking-widest">End of results</div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Bus Details Slide-up Drawer */}
      <BusDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        bus={selectedBus}
      />
    </main>
  );
}
