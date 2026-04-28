"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Train, Plane, CarTaxiFront, 
  Calendar, ArrowRightLeft, Search, Facebook, Twitter, 
  Instagram, Linkedin, Mail, PhoneCall,
  Percent, ChevronDown, Clock,
  MapPin as MapPinIcon, ShieldCheck, Globe2, CreditCard, Headset
} from 'lucide-react';

const services = [
  { name: 'Flights', icon: Plane, id: 'flight', link: '/flights' },
  { name: 'Buses', icon: Bus, id: 'bus', link: '/bus' },
  { name: 'Trains', icon: Train, id: 'train', link: '/train' },
  { name: 'Cabs', icon: CarTaxiFront, id: 'taxi', link: '/taxi' },
];

const backgroundImages = [ 
  "/images/Flight.png", 
  "/images/Taxi.avif", 
  "/images/train.avif", 
  "/images/Bus.avif" 
];

const offers = [
  { title: 'Flat 15% Off on Domestic Flights', code: 'TRIPFLY15', category: 'Flights', img: "/images/offers/flightoffer.png" },
  { title: 'Save ₹500 on First Bus Booking', code: 'NEWBUS500', category: 'Buses', img: "/images/offers/Bus.avif" },
  { title: 'Free Taxi Upgrades to Sedan', code: 'PREMIUMRIDE', category: 'Cabs', img: "/images/offers/taxioffer.avif" },
];

const destinations = [
  { name: 'Munnar, Kerala', tours: '120+ options', img: "/images/destinations/munnar.jpg" },
  { name: 'Goa Beaches', tours: '85+ options', img: "/images/destinations/goa.jpg" },
  { name: 'Manali Mountains', tours: '90+ options', img: "/images/destinations/manali.avif" },
  { name: 'Jaipur, Rajasthan', tours: '150+ options', img: "/images/kyoto.png" }, // Reusing an existing image for layout balance
];

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('flight');
  const [fromLocation, setFromLocation] = useState('Kochi');
  const [toLocation, setToLocation] = useState('Bangalore');
  const [currentBg, setCurrentBg] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    const timer = setInterval(() => setCurrentBg((prev) => (prev + 1) % backgroundImages.length), 8000);
    return () => { clearInterval(timer); window.removeEventListener('resize', handleResize); };
  }, []);

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  const handleSearch = () => {
    if (activeTab === 'flight') {
      // Direct user to real flight search if that's what they selected
      // We can also pass standard code or just direct to app
      router.push('/flights');
    } else {
      // Direct others to placeholder
      const selectedService = services.find(s => s.id === activeTab);
      router.push(selectedService?.link || '/');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 md:pb-0 selection:bg-emerald-500 selection:text-white">
      
      {/* --- PREMIUM HERO SECTION --- */}
      <div className="relative pt-32 pb-44 md:pt-48 md:pb-64 flex flex-col justify-center items-center overflow-hidden">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          <AnimatePresence mode="popLayout">
            <motion.img 
              key={currentBg} src={backgroundImages[currentBg]}
              initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-50"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12 md:mb-20">
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
              Unrivaled Travel Experience
            </span>
            <h1 className="text-5xl md:text-[5.5rem] leading-[1.1] font-black text-white tracking-tight drop-shadow-2xl">
              Elevate Your <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Journey.</span>
            </h1>
            <p className="hidden md:block text-xl md:text-2xl text-slate-300 mt-6 max-w-2xl mx-auto font-medium drop-shadow-md">
              Discover a world of seamless bookings, exclusive luxury, and unforgettable destinations.
            </p>
          </motion.div>

          {/* --- ENHANCED GLASSMORPHISM SEARCH WIDGET --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring', damping: 20 }}
            className="w-full max-w-5xl mx-auto relative z-20"
          >
            {/* Tab Navigation */}
            <div className="flex justify-center md:justify-start mb-2 px-2 md:px-6 relative top-4 z-10">
              <div className="flex bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-2xl md:rounded-t-2xl md:rounded-b-none border border-white/10 border-b-0 shadow-lg">
                {services.map((service) => {
                  const isActive = activeTab === service.id;
                  return (
                    <button 
                      key={service.id} 
                      onClick={() => setActiveTab(service.id)} 
                      className={`flex items-center gap-2 py-3 px-5 md:px-8 rounded-xl font-bold transition-all text-xs md:text-sm tracking-wide ${
                        isActive ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <service.icon size={16} /> {service.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Search Bar */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-white/40 p-3 md:p-4 pb-14 md:pb-4 relative">
              <div className="flex flex-col md:flex-row gap-2 md:gap-0 md:items-center bg-slate-50 md:bg-transparent rounded-2xl md:rounded-none">
                
                {/* Locations */}
                <div className="flex flex-1 relative md:border-r border-slate-200">
                  <div className="flex-1 p-4 md:p-6 hover:bg-slate-100/50 rounded-l-2xl cursor-text transition-colors group">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Leaving From</span>
                    <input type="text" value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} className="w-full text-xl md:text-3xl font-black text-slate-800 bg-transparent focus:outline-none truncate mt-1" />
                    <p className="text-[10px] md:text-sm text-slate-500 truncate mt-1 font-medium">Select Origin</p>
                  </div>

                  <button onClick={handleSwap} className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center text-emerald-600 shadow-xl hover:bg-emerald-50 transition-all hover:scale-110 active:scale-95">
                    <ArrowRightLeft size={18} />
                  </button>

                  <div className="flex-1 p-4 md:p-6 hover:bg-slate-100/50 rounded-r-2xl cursor-text transition-colors group pl-6 md:pl-10">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Going To</span>
                    <input type="text" value={toLocation} onChange={(e) => setToLocation(e.target.value)} className="w-full text-xl md:text-3xl font-black text-slate-800 bg-transparent focus:outline-none truncate mt-1" />
                    <p className="text-[10px] md:text-sm text-slate-500 truncate mt-1 font-medium">Select Destination</p>
                  </div>
                </div>

                {/* Dates & Extras */}
                <div className="flex-1 flex flex-row divide-x divide-slate-200 border-t md:border-t-0 border-slate-200">
                  <div className="flex-1 p-4 md:p-6 hover:bg-slate-100/50 transition-colors cursor-pointer group">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 group-hover:text-emerald-500 transition-colors"><Calendar size={14}/> Departure</span>
                    <h3 className="text-lg md:text-3xl font-black text-slate-800 mt-1">15 <span className="text-sm md:text-xl font-bold">Mar</span></h3>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-1 font-medium">Wednesday</p>
                  </div>

                  <div className="flex-1 p-4 md:p-6 hover:bg-slate-100/50 transition-colors cursor-pointer group rounded-r-2xl md:rounded-none">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between group-hover:text-emerald-500 transition-colors">
                       {activeTab === 'flight' ? 'Traveler' : activeTab === 'taxi' ? 'Time' : 'Class'} <ChevronDown size={14}/>
                    </span>
                    <h3 className="text-lg md:text-3xl font-black text-slate-800 mt-1">
                      {activeTab === 'taxi' ? '10 ' : '1 '} 
                      <span className="text-sm md:text-xl font-bold">{activeTab === 'taxi' ? 'AM' : activeTab === 'flight' ? 'Adult' : 'B'}</span>
                    </h3>
                    <p className="text-[10px] md:text-sm text-emerald-600 font-bold truncate mt-1">
                      {activeTab === 'flight' ? 'Economy' : activeTab === 'train' ? 'Sleeper' : activeTab === 'taxi' ? 'Sedan' : 'AC Seater'}
                    </p>
                  </div>
                </div>

                {/* Desktop Search Button */}
                <div className="hidden md:flex px-4 items-center">
                  <button onClick={handleSearch} className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xl px-10 py-6 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex justify-center items-center gap-3">
                    <Search size={24} className="text-emerald-400" /> Let's Go
                  </button>
                </div>
              </div>
              
              {/* Mobile Search Button */}
              <div className="md:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%]">
                <button onClick={handleSearch} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-lg py-4 rounded-xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex justify-center items-center gap-3 uppercase tracking-widest">
                  <Search size={20} className="text-emerald-400" /> Explore Now
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="bg-white py-20 relative z-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { icon: Globe2, title: "Global Reach", desc: "Access thousands of destinations with dynamic route optimization." },
              { icon: ShieldCheck, title: "Secure Transactions", desc: "Bank-grade encryption safeguards your premium bookings." },
              { icon: Headset, title: "Concierge Support", desc: "24/7 dedicated assistance for all your travel requirements." }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-inner">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- EXCLUSIVE OFFERS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-emerald-600 font-bold text-xs uppercase tracking-[0.2em] block mb-2">Special Promotions</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Exclusive Offers</h2>
          </div>
          <button className="hidden md:block bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-6 py-3 rounded-full transition-colors text-sm">
            View All Deals
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative rounded-3xl overflow-hidden shadow-xl h-64 cursor-pointer group bg-slate-900 transition-transform duration-500"
            >
              <img src={offer.img} alt={offer.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent p-6 md:p-8 flex flex-col justify-end">
                <span className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  {offer.category}
                </span>
                <h3 className="text-2xl font-black text-white mb-4 leading-tight drop-shadow-md">{offer.title}</h3>
                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Coupon Code</span>
                  <span className="text-emerald-400 font-black tracking-wider bg-emerald-400/10 px-3 py-1 rounded-md border border-emerald-400/20">
                    {offer.code}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- INSPIRATIONAL DESTINATIONS --- */}
      <div className="bg-slate-900 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-[0.2em] block mb-3">Discover</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Breathtaking Destinations</h2>
            <p className="text-lg text-slate-400 mt-4 font-medium max-w-2xl mx-auto">Immerse yourself in spectacular landscapes and vibrant cultures meticulously curated for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group cursor-pointer">
                <div className="h-[400px] rounded-[2rem] overflow-hidden relative mb-4">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md mb-1">{dest.name.split(',')[0]}</h3>
                    <p className="text-emerald-400 text-sm font-bold">{dest.name.split(',')[1]?.trim()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-slate-950 pt-24 pb-12 border-t border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
            
            <div className="space-y-6">
              <span translate="no" className="text-3xl font-black text-white tracking-tight">TRIP<span className="text-emerald-500">neO</span></span>
              <p className="text-slate-400 text-sm leading-relaxed font-medium pr-4">
                Redefining the modern travel experience through seamless infrastructure and uncompromising elegance.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"><Icon size={16} /></a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-black text-lg mb-6">Explore</h4>
              <ul className="space-y-4">
                {['Premium Flights', 'Luxury Taxi Services', 'Train Adventures', 'Charter Buses', 'Corporate Travel'].map(item => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-lg mb-6">Concierge</h4>
              <ul className="space-y-4">
                {['Priority Support', 'Cancellation Policy', 'Elite Membership', 'Travel Advisory', 'Privacy & Terms'].map(item => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-lg mb-6">Contact</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4"><div className="mt-1"><MapPinIcon size={18} className="text-emerald-500" /></div><span className="text-slate-400 text-sm font-medium leading-loose">Tech Park, Bengaluru<br/>Karnataka, India 560001</span></li>
                <li className="flex items-center gap-4"><div><PhoneCall size={18} className="text-emerald-500" /></div><span className="text-slate-400 text-sm font-medium">+91 1800-TRIPNEO</span></li>
                <li className="flex items-center gap-4"><div><Mail size={18} className="text-emerald-500" /></div><span className="text-slate-400 text-sm font-medium">elite@tripneo.com</span></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm font-medium">&copy; {new Date().getFullYear()} TRIPneO Premium Travel. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Secured by</span>
              <ShieldCheck size={18} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}