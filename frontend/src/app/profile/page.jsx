"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, MapPin, Edit3, Camera } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50">
        <p className="font-bold text-slate-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar - Profile Summary */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-80 bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col items-center flex-shrink-0"
        >
            <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center text-white text-5xl font-black">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white text-slate-700 rounded-full flex items-center justify-center shadow-md border border-slate-100 hover:text-emerald-500 hover:border-emerald-200 transition-colors">
                    <Camera size={14} />
                </button>
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 text-center">{user?.name || 'Traveler'}</h2>
            <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-1"><MapPin size={14} /> Earth</p>

            <div className="w-full h-px bg-slate-100 mb-6"></div>

            <div className="w-full space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Mail size={18} /></div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                        <p className="font-bold text-sm truncate">{user?.email || 'email@example.com'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><ShieldCheck size={18} /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Status</p>
                        <p className="font-bold text-sm text-emerald-600">Verified</p>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Right Area - Settings & Actions */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="flex-1 flex flex-col gap-6"
        >
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><User size={20} className="text-emerald-500" /> Personal Information</h3>
                    <button className="text-emerald-500 text-sm font-bold flex items-center gap-1 hover:text-emerald-600 transition-colors"><Edit3 size={14} /> Edit</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                        <input type="text" disabled defaultValue={user?.name || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-700" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                        <input type="text" disabled defaultValue="+1 (555) 000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-700" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Passport Number</label>
                        <input type="password" disabled defaultValue="•••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-700 font-mono tracking-widest" />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/30 transition-all">
                <div className="absolute -right-10 -top-10 text-emerald-400/30 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z"></path></svg>
                </div>
                
                <h3 className="text-2xl font-black mb-2 relative z-10">Tripneo Rewards</h3>
                <p className="text-emerald-100 mb-6 max-w-sm relative z-10">Earn miles on every booking. Use them for upgrades, lounge access, and free flights.</p>
                
                <div className="flex items-end gap-4 relative z-10">
                    <div>
                        <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Available Miles</p>
                        <p className="text-4xl font-black font-mono">14,500</p>
                    </div>
                    <Link href="/trips" className="ml-auto bg-white text-emerald-600 font-bold py-2.5 px-6 rounded-full hover:bg-emerald-50 transition-colors text-sm shadow-sm active:scale-95">
                        Book Flight
                    </Link>
                </div>
            </div>
        </motion.div>

      </div>
    </div>
  );
}
