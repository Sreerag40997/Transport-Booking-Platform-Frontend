"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PlaneTakeoff, 
  UserCircle, 
  LogOut, 
  Bus, 
  Train, 
  Plane, 
  Car 
} from 'lucide-react';
import AuthModal from '../ui/AuthModal';
import { useAuthStore } from '@/lib/store';

export default function Navbar() {
  // State for the modal
  const [modalConfig, setModalConfig] = useState({ isOpen: false, view: 'login' });
  
  // Zustand state for user
  const { isAuthenticated, user, logout } = useAuthStore();

  const openLogin = () => setModalConfig({ isOpen: true, view: 'login' });
  const openRegister = () => setModalConfig({ isOpen: true, view: 'register' });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  // Navigation Links Array for clean mapping
  const navLinks = [
    { name: 'Buses', href: '/bus', icon: Bus },
    { name: 'Trains', href: '/train', icon: Train },
    { name: 'Flights', href: '/flight', icon: Plane },
    { name: 'Taxis', href: '/taxi', icon: Car },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30"
              >
                <PlaneTakeoff size={28} />
              </motion.div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent tracking-tight">
                TRIPneO
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-2 items-center font-medium text-slate-600">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 group"
                >
                  <link.icon size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Auth / User Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                // Logged In State
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-slate-700 font-medium bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                    <UserCircle size={20} className="text-emerald-500" />
                    Hi, {user?.name || 'Traveler'}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-600 px-4 py-2 rounded-full font-semibold transition-all shadow-sm"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                  </motion.button>
                </div>
              ) : (
                // Logged Out State
                <>
                  <button 
                    onClick={openLogin} 
                    className="text-emerald-600 font-bold px-4 py-2 rounded-full hover:bg-emerald-50 transition-all"
                  >
                    Log in
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openRegister}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-emerald-500/30 transition-all"
                  >
                    Sign Up
                  </motion.button>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Render the Modal here */}
      <AuthModal 
        isOpen={modalConfig.isOpen} 
        initialView={modalConfig.view} 
        onClose={closeModal} 
      />
    </>
  );
}