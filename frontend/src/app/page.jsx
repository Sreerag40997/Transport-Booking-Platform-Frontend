"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Train, Plane, Car, Sparkles, ShieldCheck, Zap, Headset, 
  MapPin, Calendar, ArrowRightLeft, Search, Facebook, Twitter, Instagram, Linkedin, Mail, PhoneCall, MapPin as MapPinIcon,
  CarTaxiFront,
  CarTaxiFrontIcon
} from 'lucide-react';

const services = [
  { name: 'Bus Tickets', icon: Bus, id: 'bus' },
  { name: 'Train Tickets', icon: Train, id: 'train' },
  { name: 'Flight Tickets', icon: Plane, id: 'flight' },
  { name: 'Taxi', icon: CarTaxiFrontIcon, id: 'taxi' },
];

const backgroundImages = [ 
  "/images/Flight.png",
  "/images/Taxi.avif",
  "/images/train.avif",
  "/images/Bus.avif"
];

const offers = [
  { title: 'Flat 15% Off on Flights', code: 'TRIPFLY15', img: "/images/offers/flightoffer.png" },
  { title: 'Save ₹500 on First Bus', code: 'NEWBUS500', img: "/images/offers/Bus.avif" },
  { title: 'Free Taxi Upgrades', code: 'PREMIUMRIDE', img: "/images/offers/taxioffer.avif" },
];

const destinations = [
  { name: 'Munnar, Kerala', tours: '120+ options', img: "/images/destinations/munnar.jpg" },
  { name: 'Goa Beaches', tours: '85+ options', img: "/images/destinations/goa.jpg" },
  { name: 'Manali Mountains', tours: '90+ options', img: "/images/destinations/manali.avif" },
];

const features = [
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Our smart AI suggests the fastest and cheapest routes based on your history.' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: '100% secure transactions with top-tier encryption and fraud detection.' },
  { icon: Zap, title: 'Instant Booking', desc: 'Confirm your tickets in seconds with real-time seat locking and availability.' },
  { icon: Headset, title: '24/7 AI Chatbot', desc: 'Get help, track rides, or book directly through our WhatsApp AI assistant.' },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('flight');
  const [fromLocation, setFromLocation] = useState('Kochi');
  const [toLocation, setToLocation] = useState('Bangalore');
  const [currentBg, setCurrentBg] = useState(0);

  // Background Slider Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prevBg) => (prevBg + 1) % backgroundImages.length);
    }, 5000); // Changes image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  return (
    <div className="relative overflow-hidden bg-slate-50">
      
      {/* --- HERO SECTION --- */}
      <div className="relative pt-20 pb-32 lg:pt-28 lg:pb-40">
        
        {/* Animated Background Image Slider */}
        <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.img 
              key={currentBg}
              src={backgroundImages[currentBg]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              alt="Transport Background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/90 via-emerald-900/70 to-slate-50"></div>
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
            className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl shadow-emerald-900/20 overflow-hidden"
          >
            {/* Service Tabs */}
            <div className="flex overflow-x-auto bg-white border-b border-slate-200 hide-scrollbar px-2 pt-2">
              {services.map((service) => {
                const isActive = activeTab === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => setActiveTab(service.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all min-w-[160px] relative
                      ${isActive 
                        ? 'text-emerald-600' 
                        : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-50 rounded-t-xl'
                      }`}
                  >
                    <service.icon size={20} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
                    {service.name}
                    {/* Active Bottom Border Line */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form Inputs */}
            <div className="p-6 md:p-8">
              {/* The Inner Outline Box */}
              <div className="flex flex-col md:flex-row items-stretch bg-white border border-slate-300 rounded-xl hover:border-emerald-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-sm">
                
                {/* FROM & TO WRAPPER (Relative for the swap button) */}
                <div className="flex flex-col md:flex-row flex-[2] relative">
                  
                  {/* From Input */}
                  <div className="flex-1 px-6 py-4 hover:bg-slate-50 transition cursor-text group md:border-r border-b md:border-b-0 border-slate-300 rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">From</label>
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="text" 
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        className="w-full text-2xl font-bold text-slate-900 bg-transparent focus:outline-none truncate placeholder:font-normal placeholder:text-slate-300" 
                        placeholder="Leaving from..." 
                      />
                    </div>
                  </div>

                  {/* Perfectly Centered Swap Button */}
                  <button 
                    onClick={handleSwap}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-slate-200 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shadow-md flex items-center justify-center hover:scale-105 transition-all"
                  >
                    <ArrowRightLeft size={18} className="rotate-90 md:rotate-0" />
                  </button>

                  {/* To Input */}
                  <div className="flex-1 px-6 py-4 hover:bg-slate-50 transition cursor-text group md:border-r border-b md:border-b-0 border-slate-300">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">To</label>
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="text" 
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        className="w-full text-2xl font-bold text-slate-900 bg-transparent focus:outline-none truncate placeholder:font-normal placeholder:text-slate-300" 
                        placeholder="Going to..." 
                      />
                    </div>
                  </div>
                </div>

                {/* Date Input */}
                <div className="flex-[1] px-6 py-4 hover:bg-slate-50 transition cursor-text group w-full">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Travel Date</label>
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="date" 
                      className="w-full text-xl font-bold text-slate-900 bg-transparent focus:outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100" 
                    />
                  </div>
                </div>

                {/* Search Button Container */}
                <div className="p-2 w-full md:w-auto flex-shrink-0 bg-slate-50 md:bg-transparent rounded-b-xl md:rounded-b-none border-t md:border-t-0 border-slate-300 flex items-center justify-center">
                  <button className="w-full md:w-auto h-full px-10 py-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95">
                    <Search size={22} />
                    <span>Search</span>
                  </button>
                </div>

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

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="space-y-6">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent tracking-tight">
                TRIPneO
              </span>
              <p className="text-slate-400 text-sm leading-relaxed">
                The scalable microservices-based transport booking platform. We use AI to help you find the best routes for Bus, Train, Flight, and Taxi rentals across India.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"><Twitter size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"><Linkedin size={18} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Book Tickets</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Search Flights</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Book Bus Tickets</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">IRCTC Train Booking</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Airport Taxi Rentals</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Check PNR Status</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">24/7 AI Chatbot Help</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Cancellation & Refunds</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Report Fraud</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Contact Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPinIcon size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm leading-relaxed">Thurakkal, Manjeri<br/>Kerala, India 673016</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneCall size={18} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">+91 99999 99999</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">support@tripneo.com</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} TRIPneO. All rights reserved. Built with Go & Next.js.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">Secured by</span>
              <ShieldCheck size={20} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}