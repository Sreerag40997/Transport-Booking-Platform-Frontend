'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { busApi } from '@/lib/busApi';
import BusFilterSidebar from '@/components/buses/BusFilterSidebar';
import BusDetailsDrawer from '@/components/buses/BusDetailsDrawer';
import SearchHeader from '@/components/buses/results/SearchHeader';
import SortBar from '@/components/buses/results/SortBar';
import ResultList from '@/components/buses/results/ResultList';

/**
 * BusResultsPage - The main results view for bus searches.
 * Handles data enrichment, filtering, sorting, and state orchestration.
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

  // --- Data Fetching & Enrichment ---

  const fetchBuses = useCallback(async (searchOrigin, searchDest, searchDate) => {
    if (!searchOrigin || !searchDest || !searchDate) return;
    try {
      setLoading(true);
      setError('');
      // Clear old data to prevent stale filters/results
      setBuses([]);
      setUniqueBoardingPoints([]);
      setUniqueDroppingPoints([]);
      setActiveFilters({ departureTimes: [], arrivalTimes: [], types: [], operators: [], boardingPoints: [], droppingPoints: [] });

      const res = await busApi.searchBuses({
        origin: searchOrigin,
        destination: searchDest,
        travel_date: searchDate,
        departure_date: searchDate,
      });

      const busList = Array.isArray(res) ? res : [];

      // Concurrently enrich each bus
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
          return { ...bus, route_boarding_points: [], route_dropping_points: [], all_fares: [], available_count: 0, bus_amenities: [] };
        }
      }));

      setBuses(enrichedBuses);

      // Collect unique stops
      const bPoints = new Set();
      const dPoints = new Set();
      enrichedBuses.forEach(b => {
        const extractName = (p) => {
          if (typeof p === 'string') return p;
          return p?.name || p?.stop_name || p?.stop?.name || p?.stop?.stop_name;
        };

        (b.route_boarding_points || []).forEach(p => bPoints.add(extractName(p)));
        (b.route_dropping_points || []).forEach(p => dPoints.add(extractName(p)));
        
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
    const handleScroll = () => setIsHeaderSticky(window.scrollY > 120);
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

  return (
    <main className="min-h-screen bg-surface pt-16 md:pt-20">
      {/* Search Header (Sticky logic inside) */}
      <SearchHeader
        hOrigin={hOrigin}
        hDest={hDest}
        hDate={hDate}
        setHOrigin={setHOrigin}
        setHDest={setHDest}
        setHDate={setHDate}
        onSearch={handleSearch}
        loading={loading}
        busCount={buses.length}
        isHeaderSticky={isHeaderSticky}
      />

      {/* Main Content Area */}
      <div className={`max-w-[1240px] mx-auto px-10 py-8 transition-all duration-300 ${isHeaderSticky ? 'mt-[100px]' : ''}`}>
        <div className="flex gap-10">
          {/* Sidebar - Resized to be narrower */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <BusFilterSidebar
              filters={activeFilters}
              onFilterChange={setActiveFilters}
              origin={hOrigin}
              destination={hDest}
              boardingPoints={uniqueBoardingPoints}
              droppingPoints={uniqueDroppingPoints}
            />
          </aside>

          {/* Results Section */}
          <section className="flex-1 min-w-0">
            <SortBar
              busCount={filteredBuses.length}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortToggle={toggleSort}
              loading={loading}
            />

            <ResultList
              buses={sortedBuses}
              loading={loading}
              error={error}
              onSelect={handleSelect}
              onClearFilters={() => setActiveFilters({ departureTimes: [], arrivalTimes: [], types: [], operators: [], boardingPoints: [], droppingPoints: [] })}
              onTryAgain={() => fetchBuses(hOrigin, hDest, hDate)}
            />
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
