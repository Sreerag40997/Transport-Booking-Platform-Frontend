"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Phone, Loader2, X } from 'lucide-react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/lib/store';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = useState(initialView);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  // Update view if initialView prop changes
  useEffect(() => {
    setView(initialView);
    setError('');
  }, [initialView, isOpen]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const onSubmit = async (data) => {
    setError('');
    try {
      if (view === 'login') {
        const response = await api.post('/auth/login', { email: data.email, password: data.password });
        const { token, refresh_token, user } = response.data;
        setAuth(user, token, refresh_token);
        onClose(); // Close modal on success
      } else {
        await api.post('/auth/register', data);
        setView('login'); // Switch to login view after successful registration
        reset(); // Clear the form
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${view}. Please try again.`);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
              className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 relative"
            >
              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-2">
                  {view === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-500 text-center mb-8">
                  {view === 'login' ? 'Sign in to manage your bookings' : 'Join TRIPneO today'}
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  
                  {/* Register Only Fields */}
                  <AnimatePresence>
                    {view === 'register' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div>
                          <div className="relative mt-1 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input 
                              type="text" 
                              {...register('name', { required: view === 'register' ? 'Name is required' : false })}
                              className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                              placeholder="Full Name" 
                            />
                          </div>
                          {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                        </div>

                        <div>
                          <div className="relative mt-1 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input 
                              type="tel" 
                              {...register('phone', { required: view === 'register' ? 'Phone is required' : false })}
                              className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                              placeholder="Phone Number" 
                            />
                          </div>
                          {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone.message}</span>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Common Fields (Email & Password) */}
                  <div>
                    <div className="relative mt-1 group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input 
                        type="email" 
                        {...register('email', { required: 'Email is required' })}
                        className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                        placeholder="Email Address" 
                      />
                    </div>
                    {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
                  </div>

                  <div>
                    <div className="relative mt-1 group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input 
                        type="password" 
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                        className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                        placeholder="Password" 
                      />
                    </div>
                    {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message}</span>}
                  </div>

                  {view === 'login' && (
                    <div className="flex justify-end pt-1">
                      <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">Forgot password?</a>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    type="submit" 
                    className="w-full flex justify-center items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-300 disabled:to-emerald-300 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all mt-4"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (view === 'login' ? 'Sign In' : 'Sign Up')}
                  </motion.button>
                </form>

                {/* Google OAuth (Always visible) */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or continue with</span></div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`}
                    type="button"
                    className="mt-6 w-full flex justify-center items-center gap-2 border-2 border-slate-200 bg-white text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                    Google
                  </motion.button>
                </div>

                {/* Toggle View Link */}
                <p className="mt-8 text-center text-sm text-slate-600">
                  {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => { setView(view === 'login' ? 'register' : 'login'); reset(); setError(''); }}
                    className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    {view === 'login' ? 'Sign up here' : 'Log in'}
                  </button>
                </p>

              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}