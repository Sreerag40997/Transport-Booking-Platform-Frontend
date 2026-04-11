'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SessionExpiryModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/40 backdrop-blur-xl"
        />

        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
           transition={{ type: 'spring', damping: 25, stiffness: 300 }}
           className="relative w-full max-w-[540px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="relative p-10 md:p-16 text-center space-y-10">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-secondary text-4xl animate-pulse">timer_off</span>
                <div className="absolute inset-0 rounded-full border border-secondary/20 animate-ping opacity-30" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-headline text-primary tracking-tight">Session Expired</h2>
              <p className="text-on-surface-variant font-light text-lg leading-relaxed">
                Your exclusive seat hold has timed out. In the world of Tripneo, availability shifts in real-time.
              </p>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => {
                  onClose();
                  router.push('/flights');
                }}
                className="w-full bg-primary text-secondary py-5 font-label text-xs font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all duration-500 shadow-xl shadow-primary/10"
              >
                Return to Search
              </button>
            </div>

            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
              <span className="material-symbols-outlined text-8xl">grid_view</span>
            </div>
          </div>
          
          <div className="h-1 w-full bg-surface-container-low">
            <div className="h-full bg-secondary w-full" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
