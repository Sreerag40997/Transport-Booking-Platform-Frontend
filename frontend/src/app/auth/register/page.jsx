"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Phone, Loader2 } from 'lucide-react';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      setError('');
      // Calls POST http://localhost:8080/api/auth/register
      await api.post('/auth/register', data);
      
      // On success, backend returns { "message": "User registered successfully" }
      // Redirect to login page to let them sign in
      router.push('/login?registered=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-sky-50 p-4 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-sky-100"
      >
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-2">Create Account</h2>
          <p className="text-slate-500 text-center mb-8">Join OmniTravel today</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  {...register('name', { required: 'Name is required' })}
                  className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  placeholder="Nabeel" 
                />
              </div>
              {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  {...register('email', { required: 'Email is required' })}
                  className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  placeholder="nabeel@gmail.com" 
                />
              </div>
              {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="tel" 
                  {...register('phone', { required: 'Phone number is required' })}
                  className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  placeholder="9999999999" 
                />
              </div>
              {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500" 
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
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign Up'}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account? <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-500">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}