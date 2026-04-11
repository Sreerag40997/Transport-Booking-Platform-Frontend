'use client';
import { useRouter } from 'next/navigation';

export default function FlightResultCard({ flight, isRecommended, onSelect }) {
  const router = useRouter();

  const handleSelect = () => {
    if (onSelect) {
      onSelect();
      return;
    }
    router.push('/flights/fare-selection');
  };

  return (
    <div className={`bg-surface-container-lowest editorial-shadow overflow-hidden border transition-all duration-300 hover:bg-surface-bright hover:border-outline-variant/20 ${isRecommended ? 'border-l-4 border-l-secondary border-outline-variant/5' : 'border-outline-variant/5'}`}>
      {isRecommended && (
        <div className="bg-secondary/5 py-2 px-8 border-b border-secondary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
            <span className="font-label text-[9px] text-secondary uppercase tracking-[0.3em] font-black">Best Available</span>
          </div>
          <span className="font-label text-[9px] text-outline uppercase tracking-widest">Platform Recommendation</span>
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          
          {/* Flight Timing */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
            
            {/* Origin */}
            <div className="text-center md:text-left">
              <span className="block text-4xl font-headline text-primary mb-1 tracking-tighter">{flight.departureTime}</span>
              <span className="font-label text-[10px] text-outline uppercase tracking-[0.3em] font-black block">{flight.originCode}</span>
              {flight.originCity !== flight.originCode && (
                <span className="font-label text-[9px] text-outline/60 uppercase tracking-wider">{flight.originCity}</span>
              )}
            </div>
            
            {/* Route Line */}
            <div className="flex-1 flex flex-col items-center px-4 md:px-10 relative w-full md:w-auto">
              <span className="text-[9px] font-label uppercase tracking-widest text-outline mb-3 font-black">{flight.duration}</span>
              <div className="w-full h-px bg-outline-variant/20 relative flex items-center justify-center">
                <div className="absolute left-0 w-1.5 h-1.5 bg-outline-variant/40"></div>
                <div className="absolute right-0 w-1.5 h-1.5 bg-outline-variant/40"></div>
                {flight.stops === 0 ? (
                  <span className="material-symbols-outlined absolute bg-surface-container-lowest px-3 text-outline/40 text-base">flight</span>
                ) : (
                  <div className="absolute w-2 h-2 bg-outline-variant/40 border-4 border-surface-container-lowest"></div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[9px] text-outline font-label uppercase tracking-tight font-black">
                  {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`}
                </span>
                <span className="w-0.5 h-0.5 rounded-full bg-outline-variant/40"></span>
                <span className="text-[9px] text-outline/60 font-label">{flight.aircraft}</span>
              </div>
            </div>
            
            {/* Destination */}
            <div className="text-center md:text-right">
              <span className="block text-4xl font-headline text-primary mb-1 tracking-tighter">
                {flight.arrivalTime}
                {flight.nextDay && <span className="text-sm align-top text-secondary ml-0.5 font-label font-black">+1</span>}
              </span>
              <span className="font-label text-[10px] text-outline uppercase tracking-[0.3em] font-black block">{flight.destinationCode}</span>
              {flight.destinationCity !== flight.destinationCode && (
                <span className="font-label text-[9px] text-outline/60 uppercase tracking-wider">{flight.destinationCity}</span>
              )}
            </div>
          </div>
          
          {/* Pricing & Action */}
          <div className="md:w-56 flex flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-outline-variant/10 pt-6 md:pt-0 md:pl-8">
            <div className="flex flex-col items-center md:items-end mb-4">
              <span className="text-[9px] text-outline mb-1 uppercase tracking-[0.3em] font-black opacity-50">Starts from / Person</span>
              <span className="text-4xl font-headline text-primary tracking-tighter">₹{flight.price?.toLocaleString()}</span>
              {flight.faresCount > 1 && (
                <span className="text-[9px] text-secondary font-label font-black uppercase tracking-widest mt-1">{flight.faresCount} fare options</span>
              )}
            </div>
            <button 
              onClick={handleSelect} 
              className={`w-full py-4 px-6 transition-all uppercase tracking-[0.3em] text-[9px] font-black border relative overflow-hidden group/btn ${
                isRecommended 
                  ? "bg-primary text-secondary border-primary" 
                  : "bg-transparent border-primary/20 text-primary hover:bg-primary/5"
              }`}
            >
              {isRecommended && (
                <div className="absolute inset-0 bg-secondary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              )}
              <span className="relative z-10 group-hover/btn:text-primary transition-colors">Select Experience</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
