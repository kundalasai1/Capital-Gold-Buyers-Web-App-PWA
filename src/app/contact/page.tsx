'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Clock, MapPin, CheckCircle, AlertTriangle, Send } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function ContactPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState('');
  const [message, setMessage] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load branches for drop down selection
  useEffect(() => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data: Branch[]) => {
        setBranches(data);
        if (data.length > 0) setBranchId(data[0].id);
      })
      .catch((err) => console.error('Failed to load branches:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg('Please fill in your name, email, and phone number');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          branchId: branchId || null,
          message,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit contact request');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl flex items-center justify-center space-x-2">
          <Mail className="h-8 w-8 text-gold-600 animate-float" />
          <span>Contact <span className="text-gold-600 text-gold-gradient">Our Support Team</span></span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Have questions about rates, purity testing, or large asset estate selling? Drop us a message below, and our branch managers will follow up.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        {/* Left Side: Contact Form */}
        <div className="lg:col-span-7 glass border border-gold-600/10 rounded-xl p-6">
          {success ? (
            <div className="p-8 text-center space-y-4 animate-slide-in">
              <div className="h-14 w-14 bg-green-500/10 border border-green-500/25 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-white">Message Submitted!</h2>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
                Thank you for contacting Capital Gold Buyers. A branch representative will review your message and contact you within 24 business hours.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded text-xs uppercase tracking-wider transition-colors btn-gold-glow"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-sm font-bold text-white mb-4 border-b border-gold-600/10 pb-2 uppercase tracking-wider">
                Send an Inquiry
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <label className="text-xs text-gray-400 font-semibold">Preferred Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                >
                  <option value="">None / Corporate Office</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">Your Message</label>
                <textarea
                  placeholder="Detail your inquiry here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                />
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
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider transition-colors btn-gold-glow shadow-xl"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass border border-gold-600/10 rounded-xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gold-600/10 pb-2">
              Corporate Contacts
            </h2>

            <div className="space-y-4 text-xs text-gray-400">
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Headquarters</p>
                  <p>100 Financial Center Blvd, Metropolis</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone className="h-4.5 w-4.5 text-gold-600 shrink-0" />
                <div>
                  <p className="font-semibold text-white inline mr-2">Hotline:</p>
                  <a href="tel:+15550199000" className="underline hover:text-gold-600">
                    +1 (555) 019-9000
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <Mail className="h-4.5 w-4.5 text-gold-600 shrink-0" />
                <div>
                  <p className="font-semibold text-white inline mr-2">Email:</p>
                  <a href="mailto:support@capitalgoldbuyers.com" className="underline hover:text-gold-600">
                    support@capitalgoldbuyers.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Clock className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Support Hours</p>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
