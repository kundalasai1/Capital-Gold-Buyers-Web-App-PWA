'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, AlertTriangle, Coins, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login
        router.refresh(); // Refresh page session context
        router.push('/admin'); // Redirect to dashboard home
      } else {
        setErrorMsg(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass border border-gold-600/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 bg-gold-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* Logo and title header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="h-14 w-14 bg-gold-600/10 border border-gold-600/25 rounded-full flex items-center justify-center mb-1 shadow-lg animate-float">
            <User className="h-7 w-7 text-gold-600" />
          </div>
          <Link href="/" className="inline-flex items-center space-x-2 justify-center mx-auto">
            <span className="font-sans text-xl font-bold tracking-wider text-gold-600 uppercase">
              Capital Gold <span className="text-white">Buyers</span>
            </span>
          </Link>
          <h2 className="text-md font-bold text-gray-300 uppercase tracking-widest pt-2">
            Staff Portal Access
          </h2>
          <p className="text-xs text-gray-500">
            Sign in to access leads, appointments, calling logs, and analytics.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1 text-gold-600" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@capitalgold.com"
                className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3.5 text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1 text-gold-600" />
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3.5 text-white focus:outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center space-x-2 text-xs text-red-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 mt-6 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider transition-colors btn-gold-glow shadow-lg"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
