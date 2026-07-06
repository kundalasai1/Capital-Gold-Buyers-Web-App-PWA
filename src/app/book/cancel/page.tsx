'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarX, AlertTriangle, CheckCircle, Mail, Key } from 'lucide-react';
import Link from 'next/link';

function CancelForm() {
  const searchParams = useSearchParams();
  const [appointmentId, setAppointmentId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setAppointmentId(id);
    }
  }, [searchParams]);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!appointmentId || !email) {
      setErrorMsg('Appointment ID and email address are required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setErrorMsg(data.error || 'Failed to cancel appointment. Please check your details.');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success ? (
        /* SUCCESS PANEL */
        <div className="glass border border-gold-600/20 rounded-xl p-8 text-center space-y-6 animate-slide-in">
          <div className="h-16 w-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Appointment Cancelled</h1>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
              Your appointment reservation has been successfully removed from our schedule. A confirmation email has been dispatched.
            </p>
          </div>
          <Link
            href="/book"
            className="block w-full py-3 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider text-center transition-colors btn-gold-glow"
          >
            Book New Appointment
          </Link>
        </div>
      ) : (
        /* CANCELLATION FORM */
        <div className="glass border border-gold-600/10 rounded-xl p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-gold-600/10 pb-4">
            <CalendarX className="h-7 w-7 text-red-500" />
            <div>
              <h1 className="text-lg font-bold text-white uppercase tracking-wider">Cancel Booking</h1>
              <p className="text-[10px] text-gray-400">Security verification required</p>
            </div>
          </div>

          <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold flex items-center">
                <Key className="h-3.5 w-3.5 mr-1 text-gold-600" />
                Appointment ID
              </label>
              <input
                type="text"
                placeholder="e.g. 1a2b3c4d-5e6f-..."
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1 text-gold-600" />
                Customer Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email used during booking"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-start space-x-2 text-xs text-red-400 font-semibold">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              {loading ? 'Processing cancellation...' : 'Confirm Cancellation'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default function CancelPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Suspense fallback={
        <div className="glass border border-gold-600/10 rounded-xl p-8 text-center py-20 text-gray-400 text-xs animate-pulse">
          Loading verification form...
        </div>
      }>
        <CancelForm />
      </Suspense>
    </div>
  );
}
