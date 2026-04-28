'use client';

import { useState, useEffect, useMemo } from 'react';
import { busApi } from '@/lib/busApi';

/**
 * CollapsibleSection - Reusable wrapper for sidebar filter groups.
 */
const CollapsibleSection = ({ title, children, isOpen, onToggle }) => (
  <div className="border-b border-gray-50 last:border-0">
    <button
      onClick={onToggle}
      className="w-full py-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
    >
      <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider group-hover:text-primary transition-colors">{title}</span>
      <span className={`material-symbols-outlined text-gray-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
        expand_more
      </span>
    </button>
    {isOpen && <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
  </div>
);

/**
 * SearchFilter - In-section search input for long lists like Operators or Points.
 */
const SearchFilter = ({ placeholder, value, onChange }) => (
  <div className="relative mb-4">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-base">search</span>
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-9 pr-3 text-[11px] focus:outline-none focus:border-primary/20 transition-all placeholder:text-gray-300"
    />
  </div>
);

/**
 * BusFilterSidebar - Context-aware sidebar that handles multiple filter categories.
 * Restricts Boarding/Dropping points based on the current search results or cities.
 */
export default function BusFilterSidebar({ 
  onFilterChange, 
  origin = '', 
  destination = '', 
  boardingPoints = [], 
  droppingPoints = [] 
}) {
  // --- Data State ---
  const [operators, setOperators] = useState([]);
  const [allStops, setAllStops] = useState([]);
  
  // --- UI State ---
  const [operatorQuery, setOperatorQuery] = useState('');
  const [boardingQuery, setBoardingQuery] = useState('');
  const [droppingQuery, setDroppingQuery] = useState('');
  
  const [filters, setFilters] = useState({
    departureTimes: [],
    arrivalTimes: [],
    types: [],
    operators: [],
    boardingPoints: [],
    droppingPoints: []
  });

  const [openSections, setOpenSections] = useState({
    time: true,
    arrival: true,
    busType: true,
    operator: true,
    boarding: true,
    dropping: true,
  });

  // --- Initial Data Fetch ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ops, stops] = await Promise.all([
          busApi.getOperators(),
          busApi.getBusStops('')
        ]);
        setOperators(ops || []);
        setAllStops(stops || []);
      } catch (err) {
        console.error("Failed to fetch sidebar reference data", err);
      }
    };
    fetchData();
  }, []);

  // Sync state with parent component
  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  // --- Helpers ---
  
  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const isSelected = current.includes(value);
      return {
        ...prev,
        [category]: isSelected ? current.filter(i => i !== value) : [...current, value]
      };
    });
  };

  const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const clearAll = () => {
    setFilters({ departureTimes: [], arrivalTimes: [], types: [], operators: [], boardingPoints: [], droppingPoints: [] });
    setOperatorQuery('');
    setBoardingQuery('');
    setDroppingQuery('');
  };

  // --- Filtered Reference Data ---

  const filteredOperators = useMemo(() => 
    operators.filter(op => op.name.toLowerCase().includes(operatorQuery.toLowerCase())),
    [operators, operatorQuery]
  );

  const finalBoardingList = useMemo(() => {
    if (boardingPoints.length > 0) return boardingPoints.filter(p => p.toLowerCase().includes(boardingQuery.toLowerCase()));
    return allStops
      .filter(s => (s.city || '').toLowerCase() === origin.toLowerCase())
      .filter(s => (s.name || '').toLowerCase().includes(boardingQuery.toLowerCase()))
      .map(s => s.name);
  }, [boardingPoints, allStops, origin, boardingQuery]);

  const finalDroppingList = useMemo(() => {
    if (droppingPoints.length > 0) return droppingPoints.filter(p => p.toLowerCase().includes(droppingQuery.toLowerCase()));
    return allStops
      .filter(s => (s.city || '').toLowerCase() === destination.toLowerCase())
      .filter(s => (s.name || '').toLowerCase().includes(droppingQuery.toLowerCase()))
      .map(s => s.name);
  }, [droppingPoints, allStops, destination, droppingQuery]);

  // --- Render Helpers ---

  const renderCheckboxes = (list, category, isSelectedFn) => {
    if (list.length === 0) return <p className="text-[10px] text-gray-400 italic text-center py-2">No options found</p>;
    return list.map(item => {
      const label = item.name || item;
      const isSelected = isSelectedFn(label);
      return (
        <label key={label} className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={isSelected} 
            onChange={() => toggleFilter(category, label)}
            className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary/20 cursor-pointer" 
          />
          <span className={`text-[11px] transition-colors ${isSelected ? 'text-primary font-bold' : 'text-gray-500 group-hover:text-primary'}`}>
            {label}
          </span>
        </label>
      );
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-32">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
        <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest">Filters</h3>
        <button onClick={clearAll} className="text-[10px] font-bold text-secondary uppercase hover:text-primary transition-colors">
          Clear All
        </button>
      </div>

      <div className="flex flex-col">
        {/* Departure Time */}
        <CollapsibleSection title="Departure Time" isOpen={openSections.time} onToggle={() => toggleSection('time')}>
          <div className="grid grid-cols-2 gap-2">
            {['Before 6 am', '6 am - 12 pm', '12 pm - 6 pm', 'After 6 pm'].map(t => (
              <button key={t} onClick={() => toggleFilter('departureTimes', t)}
                className={`py-2 px-1 border rounded text-[9px] font-bold uppercase transition-all ${
                  filters.departureTimes.includes(t) ? 'bg-primary border-primary text-white shadow-sm' : 'border-gray-100 text-gray-400 hover:border-secondary/30'
                }`}>{t}</button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Arrival Time */}
        <CollapsibleSection title="Arrival Time" isOpen={openSections.arrival} onToggle={() => toggleSection('arrival')}>
          <div className="grid grid-cols-2 gap-2">
            {['Before 6 am', '6 am - 12 pm', '12 pm - 6 pm', 'After 6 pm'].map(t => (
              <button key={t} onClick={() => toggleFilter('arrivalTimes', t)}
                className={`py-2 px-1 border rounded text-[9px] font-bold uppercase transition-all ${
                  filters.arrivalTimes.includes(t) ? 'bg-primary border-primary text-white shadow-sm' : 'border-gray-100 text-gray-400 hover:border-secondary/30'
                }`}>{t}</button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Bus Type */}
        <CollapsibleSection title="Bus Type" isOpen={openSections.busType} onToggle={() => toggleSection('busType')}>
          <div className="flex flex-wrap gap-2">
            {['AC', 'Non-AC', 'Sleeper', 'Seater', 'Semi-Sleeper'].map(type => (
              <button key={type} onClick={() => toggleFilter('types', type)}
                className={`px-3 py-1.5 border rounded text-[9px] font-bold uppercase transition-all ${
                  filters.types.includes(type) ? 'bg-primary border-primary text-white' : 'border-gray-100 text-gray-400 hover:border-secondary/30'
                }`}>{type}</button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Operators */}
        <CollapsibleSection title="Operators" isOpen={openSections.operator} onToggle={() => toggleSection('operator')}>
          <SearchFilter placeholder="Search Operator..." value={operatorQuery} onChange={setOperatorQuery} />
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {renderCheckboxes(filteredOperators, 'operators', (name) => filters.operators.includes(name))}
          </div>
        </CollapsibleSection>

        {/* Boarding Points */}
        <CollapsibleSection title="Boarding Points" isOpen={openSections.boarding} onToggle={() => toggleSection('boarding')}>
          <SearchFilter placeholder="Search Points..." value={boardingQuery} onChange={setBoardingQuery} />
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {renderCheckboxes(finalBoardingList, 'boardingPoints', (name) => filters.boardingPoints.includes(name))}
          </div>
        </CollapsibleSection>

        {/* Dropping Points */}
        <CollapsibleSection title="Dropping Points" isOpen={openSections.dropping} onToggle={() => toggleSection('dropping')}>
          <SearchFilter placeholder="Search Points..." value={droppingQuery} onChange={setDroppingQuery} />
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {renderCheckboxes(finalDroppingList, 'droppingPoints', (name) => filters.droppingPoints.includes(name))}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
