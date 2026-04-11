'use client';

export default function FlightFilterSidebar() {
  return (
    <div className="space-y-12">
      <div className="border-b border-outline-variant/10 pb-6 mb-10">
        <div className="flex items-center gap-3 text-secondary mb-2">
            <span className="material-symbols-outlined text-sm animate-pulse">tune</span>
            <h3 className="font-label text-[10px] uppercase font-black tracking-[0.4em]">Filter Manifest</h3>
        </div>
        <h2 className="font-headline text-3xl text-primary tracking-tight">Refine Orchestration</h2>
      </div>

      <div className="space-y-12">
        {/* Stops Filter */}
        <section className="space-y-6">
          <label className="font-label text-[9px] text-outline uppercase tracking-[0.3em] font-black border-l-2 border-secondary pl-3 block">
            Sector Count
          </label>
          <div className="space-y-4 pt-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-headline text-on-surface-variant group-hover:text-primary transition-colors">Direct Gateway</span>
              <input type="checkbox" className="w-4 h-4 rounded-none border-outline-variant text-primary focus:ring-0 transition-all cursor-pointer" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-headline text-primary group-hover:text-secondary transition-colors">Multi-Leg Transition</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded-none border-outline-variant text-primary focus:ring-0 transition-all cursor-pointer" />
            </label>
          </div>
        </section>
        
        {/* Cabin Class Filter */}
        <section className="space-y-6">
          <label className="font-label text-[9px] text-outline uppercase tracking-[0.3em] font-black border-l-2 border-secondary pl-3 block">
            Service Tier
          </label>
          <div className="grid grid-cols-1 gap-1 pt-2">
            {['Economy', 'Business', 'First Class'].map((cls) => (
              <button 
                key={cls}
                className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-black transition-all border ${cls === 'First Class' ? 'bg-primary text-secondary border-primary' : 'text-outline hover:bg-surface-container-low hover:text-primary border-transparent'}`}
              >
                {cls}
              </button>
            ))}
          </div>
        </section>
        
        {/* Price Range */}
        <section className="space-y-8">
          <label className="font-label text-[9px] text-outline uppercase tracking-[0.3em] font-black border-l-2 border-secondary pl-3 block">
            Investment Range
          </label>
          <div className="pt-4 px-2">
            <div className="relative h-[1px] bg-outline-variant/20 rounded-full mb-8">
              <div className="absolute h-full bg-secondary w-2/3 left-0"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 bg-primary border border-secondary transition-transform hover:scale-150 cursor-pointer"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-2/3 w-2 h-2 bg-primary border border-secondary transition-transform hover:scale-150 cursor-pointer"></div>
            </div>
            <div className="flex justify-between text-[10px] font-headline text-primary tracking-widest font-bold">
              <span>₹12,400</span>
              <span>₹84,500</span>
            </div>
          </div>
        </section>
      </div>
      
      {/* Featured Experience Card */}
      <div className="relative aspect-[3/4] overflow-hidden group cursor-pointer editorial-shadow border border-outline-variant/10">
          <img 
            className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110" 
            alt="luxury airplane interior first class suite" 
            src="/images/first_class.png" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="font-label text-[9px] text-secondary uppercase tracking-[0.4em] mb-4 block font-black border-b border-secondary/30 pb-2 w-fit">Registry Pick</span>
              <h5 className="text-white font-headline text-2xl leading-tight tracking-tight">The Sky Residence</h5>
              <p className="text-white/40 text-[10px] mt-4 font-black uppercase tracking-widest leading-relaxed">Experience our premium flagship lie-flat suites.</p>
          </div>
      </div>
    </div>
  );
}
