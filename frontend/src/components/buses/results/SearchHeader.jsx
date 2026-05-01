'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CityInput from '@/components/buses/CityInput';

export default function SearchHeader({
  hOrigin,
  hDest,
  hDate,
  setHOrigin,
  setHDest,
  setHDate,
  onSearch,
  loading,
  busCount,
  isHeaderSticky
}) {
  const router = useRouter();
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  const handleToday = () => setHDate(todayStr);
  const handleTomorrow = () => setHDate(tomorrowStr);

  const isTodayActive = hDate === todayStr;
  const isTomorrowActive = hDate === tomorrowStr;

  return (
    <header className={`z-[30] border-b transition-all duration-300 ${isHeaderSticky
      ? 'fixed top-16 md:top-20 left-0 right-0 py-3 bg-white border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
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
                  <span>{hOrigin || 'Searching...'}</span>
                  <span className="material-symbols-outlined text-primary/20">trending_flat</span>
                  <span>{hDest || '...'}</span>
                </div>
                <p className="text-[10px] font-bold text-primary/40 uppercase mt-0.5">
                  {loading ? 'Refreshing buses...' : `${busCount} buses found`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`flex flex-col lg:flex-row items-stretch lg:items-center bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 ${isHeaderSticky ? 'h-auto lg:h-[48px]' : 'h-auto lg:h-[64px]'} p-1`}>
          {/* Origin */}
          <div className="flex-1 px-4 py-2 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-100">
            <CityInput
              label="Boarding Point"
              placeholder="Source"
              value={hOrigin}
              onChange={setHOrigin}
              className="w-full"
            />
          </div>

          {/* Swap */}
          <button
            onClick={() => { const t = hOrigin; setHOrigin(hDest); setHDest(t); }}
            className="hidden lg:flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-full flex shrink-0 -mx-4 z-10 hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">swap_horiz</span>
          </button>

          {/* Destination */}
          <div className="flex-1 px-4 py-2 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-100 lg:pl-8">
            <CityInput
              label="Dropping Point"
              placeholder="Destination"
              value={hDest}
              onChange={setHDest}
              className="w-full"
            />
          </div>

          {/* Date Picker with Today/Tomorrow */}
          <div className="flex-[1.2] px-4 py-2 lg:py-0 border-b lg:border-b-0 border-gray-100 flex flex-col justify-center">
            <label className="block text-[9px] text-gray-400 uppercase font-bold leading-none mb-1">Departure</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 shrink-0 mr-2">
                <button
                  type="button"
                  onClick={handleToday}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all ${isTodayActive
                    ? 'bg-primary text-white'
                    : 'border border-gray-100 text-gray-400 hover:border-primary/30 hover:text-primary'
                    }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleTomorrow}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all ${isTomorrowActive
                    ? 'bg-primary text-white'
                    : 'border border-gray-100 text-gray-400 hover:border-primary/30 hover:text-primary'
                    }`}
                >
                  Tomorrow
                </button>
              </div>
              <input
                type="date"
                value={hDate}
                min={todayStr}
                onChange={(e) => setHDate(e.target.value)}
                className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className={`px-8 lg:px-10 bg-primary text-white hover:bg-secondary hover:text-primary transition-all flex items-center justify-center gap-2 rounded-lg lg:rounded-l-none lg:rounded-r-lg ${isHeaderSticky ? 'h-[40px]' : 'h-[56px]'} mt-2 lg:mt-0`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">search</span>
            <span className="text-xs font-bold uppercase tracking-wider lg:hidden xl:inline">Search</span>
          </button>
        </div>
      </div>
    </header>
  );
}
