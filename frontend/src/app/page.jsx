"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bus, Train, Plane, Car, Sparkles, ShieldCheck, Zap, Headset, 
  MapPin, Calendar, ArrowRightLeft, Search 
} from 'lucide-react';

const services = [
  { name: 'Bus Tickets', icon: Bus, id: 'bus' },
  { name: 'Train Tickets', icon: Train, id: 'train' },
  { name: 'Flight Tickets', icon: Plane, id: 'flight' },
  { name: 'Taxi Rentals', icon: Car, id: 'taxi' },
];

const offers = [
  { title: 'Flat 15% Off on Flights', code: 'TRIPFLY15', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop' },
  { title: 'Save ₹500 on First Bus', code: 'NEWBUS500', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop' },
  { title: 'Free Taxi Upgrades', code: 'PREMIUMRIDE', img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=600&auto=format&fit=crop' },
];

const destinations = [
  { name: 'Munnar, Kerala', tours: '120+ options', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Goa Beaches', tours: '85+ options', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop' },
  { name: 'Manali Mountains', tours: '90+ options', img: 'https://images.unsplash.com/photo-1605649487212-4dcb1b600228?q=80&w=800&auto=format&fit=crop' },
];

const features = [
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Our smart AI suggests the fastest and cheapest routes based on your history.' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: '100% secure transactions with top-tier encryption and fraud detection.' },
  { icon: Zap, title: 'Instant Booking', desc: 'Confirm your tickets in seconds with real-time seat locking and availability.' },
  { icon: Headset, title: '24/7 AI Chatbot', desc: 'Get help, track rides, or book directly through our WhatsApp AI assistant.' },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('bus');
  const [fromLocation, setFromLocation] = useState('Kochi');
  const [toLocation, setToLocation] = useState('Bangalore');

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  return (
    <div className="relative overflow-hidden bg-slate-50">
      
      {/* --- HERO SECTION (redBus Style) --- */}
      <div className="relative pt-20 pb-32 lg:pt-28 lg:pb-40">
        {/* Scenic Background Image with Emerald Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2069&auto=format&fit=crop" 
            alt="Beautiful Mountain Road" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/90 via-emerald-800/80 to-slate-50"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4"
            >
              India's Smartest Travel Platform
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-emerald-50"
            >
              Instantly book buses, trains, flights, and taxis with AI-powered recommendations.
            </motion.p>
          </div>

          {/* THE SEARCH COMPONENT */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl shadow-emerald-900/20 overflow-hidden border border-slate-100"
          >
            {/* Service Tabs */}
            <div className="flex overflow-x-auto bg-slate-50/80 border-b border-slate-200 hide-scrollbar">
              {services.map((service) => {
                const isActive = activeTab === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => setActiveTab(service.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-5 px-6 font-semibold transition-all min-w-[150px]
                      ${isActive 
                        ? 'bg-white text-emerald-600 border-b-2 border-emerald-500 shadow-sm' 
                        : 'text-slate-500 hover:text-emerald-500 hover:bg-emerald-50/50'
                      }`}
                  >
                    <service.icon size={20} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
                    {service.name}
                  </button>
                );
              })}
            </div>

            {/* Form Inputs */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                
                {/* From Input */}
                <div className="flex-1 w-full px-6 py-4 hover:bg-slate-50 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none transition cursor-text group border-b md:border-b-0 md:border-r border-slate-300 relative">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">From</label>
                  <div className="flex items-center gap-3">
                    <MapPin size={24} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="w-full text-xl md:text-2xl font-bold text-slate-900 bg-transparent focus:outline-none truncate placeholder:font-normal placeholder:text-slate-400" 
                      placeholder="Leaving from..." 
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <button 
                  onClick={handleSwap}
                  className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 z-10 p-3 bg-white border border-slate-300 rounded-full text-emerald-600 hover:bg-emerald-50 hover:scale-110 shadow-md transition-all flex-shrink-0"
                >
                  <ArrowRightLeft size={20} />
                </button>

                {/* To Input */}
                <div className="flex-1 w-full px-6 py-4 hover:bg-slate-50 transition cursor-text group border-b md:border-b-0 md:border-r border-slate-300">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">To</label>
                  <div className="flex items-center gap-3">
                    <MapPin size={24} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      className="w-full text-xl md:text-2xl font-bold text-slate-900 bg-transparent focus:outline-none truncate placeholder:font-normal placeholder:text-slate-400" 
                      placeholder="Going to..." 
                    />
                  </div>
                </div>

                {/* Date Input */}
                <div className="flex-[0.8] w-full px-6 py-4 hover:bg-slate-50 transition cursor-text group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Travel Date</label>
                  <div className="flex items-center gap-3">
                    <Calendar size={24} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="date" 
                      className="w-full text-xl font-bold text-slate-900 bg-transparent focus:outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100" 
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button className="w-full md:w-auto h-full m-2 md:m-3 px-8 py-5 md:py-0 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xl rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95">
                  <Search size={24} />
                  <span>Search</span>
                </button>

              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- OFFERS SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Exclusive Offers</h2>
            <p className="text-slate-500 mt-2">Best deals on your favorite transport</p>
          </div>
          <button className="text-emerald-600 font-semibold hover:text-emerald-700 hidden sm:block">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative rounded-3xl overflow-hidden shadow-lg h-48 cursor-pointer group"
            >
              <img src={offer.img} alt={offer.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-transparent p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white mb-2 max-w-[70%]">{offer.title}</h3>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/40 rounded-lg text-sm font-bold w-max">
                  Use Code: {offer.code}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- POPULAR DESTINATIONS SECTION --- */}
      <div className="bg-white py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Explore Destinations</h2>
          <p className="text-slate-500 mb-10">Discover India's most loved travel spots</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((dest, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-slate-100 group cursor-pointer"
              >
                <div className="h-56 overflow-hidden relative">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900">{dest.name}</h3>
                  <p className="text-emerald-600 font-medium mt-1">{dest.tours} available</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- ABOUT / WHY CHOOSE US SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900">Why Book With TRIPneO?</h2>
          <p className="text-slate-500 mt-4">We combine cutting-edge AI with a seamless booking experience to bring you the future of travel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100 hover:bg-emerald-50 transition-colors"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}