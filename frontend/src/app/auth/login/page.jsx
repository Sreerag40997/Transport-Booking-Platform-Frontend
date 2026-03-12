"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      setError('');
      // Calls POST http://localhost:8080/api/auth/login
      const response = await api.post('/auth/login', data);
      
      const { token, refresh_token, user } = response.data;
      
      // Save to Zustand (which persists to localStorage)
      setAuth(user, token, refresh_token);
      
      // Redirect to the home page or dashboard
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-sky-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-sky-100"
      >
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-center mb-8">Sign in to manage your bookings</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  {...register('email', { required: 'Email is required' })}
                  className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition" 
                  placeholder="nabeel@gmail.com" 
                />
              </div>
              {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  {...register('password', { required: 'Password is required' })}
                  className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition" 
                  placeholder="••••••••" 
                />
              </div>
              {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message}</span>}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              type="submit" 
              className="w-full flex justify-center items-center bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3 px-4 rounded-xl shadow-3d transition-colors mt-6"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
            </motion.button>
          </form>

          {/* Google OAuth - We can wire this to your backend redirect later */}
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
              className="mt-6 w-full flex justify-center items-center gap-2 border-2 border-slate-200 bg-white text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 transition"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
              Google
            </motion.button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account? <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-500">Sign up here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}