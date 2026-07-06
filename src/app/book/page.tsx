'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Mail, Phone, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Branch {
  id: string;
  name: string;
  address: string;
  hours: string;
}

export default function BookPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [branchId, setBranchId] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Slots
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Status
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch active branches
  useEffect(() => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data: Branch[]) => {
        setBranches(data);
        if (data.length > 0) setBranchId(data[0].id);
      })
      .catch((err) => console.error('Failed to fetch branches:', err))
      .finally(() => setLoading(false));
  }, []);

  // Get current date string in YYYY-MM-DD for minimum restriction
  const getMinDateStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 2. Fetch available slots on date or branch change
  useEffect(() => {
    if (!branchId || !slotDate) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSlotTime('');
    setErrorMsg('');

    fetch(`/api/appointments/slots?branchId=${branchId}&date=${slotDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.availableSlots) {
          setAvailableSlots(data.availableSlots);
        } else {
          setAvailableSlots([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load slots:', err);
        setErrorMsg('Failed to load time slots');
      })
      .finally(() => setLoadingSlots(false));
  }, [branchId, slotDate]);

  // 3. Handle Form Submission
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!branchId || !slotDate || !slotTime || !customerName || !phone || !email) {
      setErrorMsg('Please select a branch, date, time slot, and fill out all contact fields');
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId,
          slotDate,
          slotTime,
          customerName,
          phone,
          email,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBookingSuccess(data.appointment);
        // Clear fields
        setSlotDate('');
        setSlotTime('');
        setCustomerName('');
        setPhone('');
        setEmail('');
        setNotes('');
      } else {
        setErrorMsg(data.error || 'Failed to complete appointment booking');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    }
  };

  const selectedBranch = branches.find((b) => b.id === branchId);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl flex items-center justify-center space-x-2">
          <Calendar className="h-8 w-8 text-gold-600 animate-float" />
          <span>Book an Appraisal <span className="text-gold-600 text-gold-gradient">Appointment</span></span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Schedule a secure visit to lock in gold valuation spot rates. Complete the form below and reserve your time slot.
        </p>
      </div>

      {bookingSuccess ? (
        /* SUCCESS SCREEN */
        <div className="max-w-xl mx-auto glass border border-gold-600/30 rounded-xl p-8 text-center space-y-6 animate-slide-in">
          <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mx-auto">
            <CheckCircle className="h-10 w-10 text-green-500 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Booking Confirmed!</h2>
            <p className="text-gray-400 text-xs">
              Your appointment reservation has been saved. A confirmation email has been dispatched to <strong>{bookingSuccess.email}</strong>.
            </p>
          </div>

          <div className="bg-charcoal-900/60 p-4 rounded border border-gold-600/15 text-left text-xs space-y-2.5">
            <p className="text-white font-semibold flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gold-600" />
              Branch: {selectedBranch?.name}
            </p>
            <p className="text-white font-semibold flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gold-600" />
              Date: {bookingSuccess.slotDate}
            </p>
            <p className="text-white font-semibold flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gold-600" />
              Time Slot: {bookingSuccess.slotTime}
            </p>
            <p className="text-gray-500 text-[10px] pt-2 border-t border-gray-800">
              Need to cancel or reschedule? Keep your appointment ID: <strong>{bookingSuccess.id}</strong>. You can cancel this booking online.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link
              href={`/book/cancel?id=${bookingSuccess.id}`}
              className="w-full sm:w-auto text-xs text-red-400 underline font-semibold py-2 px-4 rounded hover:bg-red-500/10 transition-colors"
            >
              Cancel Appointment
            </Link>
            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full sm:w-auto px-6 py-2.5 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider transition-colors btn-gold-glow"
            >
              Book Another Visit
            </button>
          </div>
        </div>
      ) : (
        /* BOOKING FORM SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Left: Booking Inputs */}
          <div className="lg:col-span-7 glass border border-gold-600/10 rounded-xl p-6">
            {loading ? (
              <div className="space-y-4 py-8">
                <div className="h-10 w-full animate-shimmer-bg rounded" />
                <div className="h-10 w-full animate-shimmer-bg rounded" />
                <div className="h-12 w-full animate-shimmer-bg rounded" />
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-5">
                <h2 className="text-sm font-bold text-white mb-4 border-b border-gold-600/10 pb-2 uppercase tracking-wider flex items-center">
                  <BookOpen className="h-4.5 w-4.5 mr-2 text-gold-600" />
                  Appointment Details
                </h2>

                {/* 1. Branch Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Select Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Date Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Preferred Date</label>
                  <input
                    type="date"
                    min={getMinDateStr()}
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                    required
                  />
                </div>

                {/* 3. Slot Selector (Chips) */}
                {slotDate && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Available Time Slots
                    </label>

                    {loadingSlots ? (
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-9 animate-shimmer-bg rounded" />
                        ))}
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSlotTime(time)}
                            className={`py-2 px-3 text-xs font-semibold rounded border transition-all duration-200 ${
                              slotTime === time
                                ? 'bg-gold-600 text-black border-gold-600'
                                : 'bg-charcoal-900/60 text-gray-300 border-gray-850 hover:border-gold-600/50 hover:text-white'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-500 font-medium">
                        No available slots for this branch on the selected date. Branches are typically closed on Sundays.
                      </p>
                    )}
                  </div>
                )}

                {/* 4. Contact Information */}
                {slotTime && (
                  <div className="space-y-4 pt-4 border-t border-gold-600/10 animate-slide-in">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                      <User className="h-3.5 w-3.5 mr-1.5 text-gold-600" />
                      Contact Information
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-semibold">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-400 font-semibold">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-400 font-semibold">Email Address</label>
                        <input
                          type="email"
                          placeholder="johndoe@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-semibold">Special Notes (Optional)</label>
                      <textarea
                        placeholder="Detail items to appraise (e.g. 24K gold bars, 18K coins, silver scrap)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                      />
                    </div>

                    {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 py-4 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider transition-colors btn-gold-glow shadow-xl"
                    >
                      <span>Reserve Appointment Slot</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Right: Branch Info sidebar */}
          <div className="lg:col-span-5 space-y-6">
            {selectedBranch ? (
              <div className="glass border border-gold-600/15 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gold-600/10 pb-2">
                  Selected Store Details
                </h3>

                <div className="space-y-3.5 text-xs text-gray-400">
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Branch Location</p>
                      <p>{selectedBranch.name}</p>
                      <p className="mt-1">{selectedBranch.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 pt-3 border-t border-gray-900">
                    <Clock className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Store Business Hours</p>
                      <p className="leading-relaxed mt-0.5">{selectedBranch.hours}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass border border-gold-600/10 rounded-xl p-6 text-center text-gray-500 text-xs">
                Select a store to load local hours and slot availability.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
