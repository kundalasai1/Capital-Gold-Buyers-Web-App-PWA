'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, X, User, PhoneOutgoing, PhoneCall, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
  priority: number;
  branchId: string;
  branch: { name: string };
}

export default function CallAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // Call States: 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended'
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  
  // Callback Form
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const [isOffline, setIsOffline] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch agents and check business hours
  useEffect(() => {
    // Check business hours: Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM, Sun: Closed
    const checkBusinessHours = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = now.getHours();
      
      if (day === 0) {
        setIsOffline(true);
      } else if (day === 6) {
        setIsOffline(hour < 10 || hour >= 16);
      } else {
        setIsOffline(hour < 9 || hour >= 18);
      }
    };

    checkBusinessHours();
    // Re-check hourly
    const interval = setInterval(checkBusinessHours, 60000 * 60);

    // Fetch agents
    fetch('/api/calls/agents')
      .then((res) => res.json())
      .then((data: Agent[]) => {
        setAgents(data);
        // Route to first online agent ordered by priority
        const online = data.find((a) => a.isOnline);
        if (online) {
          setSelectedAgent(online);
        } else if (data.length > 0) {
          setSelectedAgent(data[0]);
        }
      })
      .catch((err) => console.error('Error fetching agents:', err));

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. Call duration counter
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [callState]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 3. Trigger Browser WebRTC Simulation
  const startCall = async () => {
    if (!selectedAgent) return;
    setCallState('connecting');
    setCallDuration(0);

    // Simulate connecting -> ringing (takes 1.5s)
    setTimeout(() => {
      setCallState('ringing');
      // Simulate ringing -> connected (takes 2s)
      setTimeout(() => {
        setCallState('connected');
      }, 2000);
    }, 1500);
  };

  // 4. Hang up and save log
  const endCall = async () => {
    const finalDuration = callDuration;
    const finalState = callState;
    setCallState('ended');

    // Post call log to server
    try {
      await fetch('/api/calls/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent?.id || null,
          branchId: selectedAgent?.branchId || null,
          type: 'INSTANT',
          outcome: finalState === 'connected' ? 'CONNECTED' : 'MISSED',
          durationSeconds: finalDuration,
        }),
      });
    } catch (e) {
      console.error('Failed to log call:', e);
    }

    setTimeout(() => {
      setCallState('idle');
      setCallDuration(0);
    }, 2000);
  };

  // 5. Submit Callback Lead
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!callbackName.trim() || !callbackPhone.trim()) {
      setFormError('Please enter your name and phone number');
      return;
    }

    try {
      const res = await fetch('/api/calls/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: callbackName,
          phone: callbackPhone,
          branchId: selectedAgent?.branchId || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      setFormSubmitted(true);
      setCallbackName('');
      setCallbackPhone('');
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    } catch (err) {
      setFormError('Failed to submit callback request. Please try again.');
    }
  };

  return (
    <>
      {/* Desktop Floating Button */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center h-14 w-14 rounded-full text-black transition-all duration-300 shadow-xl ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-90' 
              : 'bg-gold-600 hover:bg-gold-500 animate-pulse-glow hover:scale-105'
          }`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar Call CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-gold-600/20 px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          <p className="font-semibold text-white">Need Live Help?</p>
          <p className="text-[10px] text-gold-600 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {isOffline ? 'Agents Offline' : 'Agents Online Now'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-4 py-2 rounded bg-gold-600 text-black text-xs font-bold shadow-md hover:bg-gold-500 transition-colors"
        >
          <PhoneCall className="h-4 w-4" />
          <span>{isOpen ? 'Close Dialer' : 'Call an Agent'}</span>
        </button>
      </div>

      {/* Panel Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[340px] z-40 glass rounded-lg shadow-2xl border border-gold-600/30 overflow-hidden animate-slide-in max-w-[calc(100vw-2rem)] select-none">
          {/* Header */}
          <div className="bg-charcoal-900 border-b border-gold-600/10 px-4 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gold-600 uppercase tracking-wider">
                Agent Live Connect
              </h3>
              <p className="text-[10px] text-gray-400">
                {isOffline ? 'Outside Business Hours' : 'Instant Browser Call Queue'}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-4">
            {callState !== 'idle' ? (
              /* ACTIVE CALL DIALER SCREEN */
              <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-charcoal-900/50 rounded border border-gold-600/15">
                <div className="relative">
                  <div className={`h-16 w-16 rounded-full bg-gold-600/10 flex items-center justify-center border border-gold-600/30 ${
                    callState === 'ringing' || callState === 'connecting' ? 'animate-pulse' : ''
                  }`}>
                    <PhoneOutgoing className="h-8 w-8 text-gold-600" />
                  </div>
                  {callState === 'connected' && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-charcoal-900" />
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400">Calling Agent</p>
                  <p className="text-sm font-semibold text-white">{selectedAgent?.name || 'Assigned Representative'}</p>
                  <p className="text-[10px] text-gold-600 mt-1 uppercase tracking-wider">{selectedAgent?.branch.name}</p>
                </div>

                <div className="text-center font-mono text-lg font-bold text-white">
                  {callState === 'connecting' && <span className="text-xs text-gray-500 animate-pulse">Connecting...</span>}
                  {callState === 'ringing' && <span className="text-xs text-gold-600 animate-pulse">Ringing agent line...</span>}
                  {callState === 'connected' && formatDuration(callDuration)}
                  {callState === 'ended' && <span className="text-xs text-red-500">Call Ended</span>}
                </div>

                <button
                  onClick={endCall}
                  className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Hang Up
                </button>
              </div>
            ) : (
              /* DIALER OPTIONS SCREEN */
              <div className="space-y-4">
                {/* 1. Instant Calling Panel */}
                <div className="bg-charcoal-900/40 p-3.5 rounded border border-gold-600/10 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-1.5 text-gold-600" />
                    Option 1: Browser WebRTC Call
                  </h4>

                  {isOffline ? (
                    <div className="text-[11px] text-amber-500 bg-amber-500/10 p-2 rounded flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-1.5 shrink-0" />
                      <span>Browser calls are closed. Our hours are Mon-Fri 9AM-6PM, Sat 10AM-4PM. Please use callback request below!</span>
                    </div>
                  ) : selectedAgent?.isOnline ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-gray-400">
                        Connect immediately over your browser. No phone needed. Calls route to <strong>{selectedAgent.name}</strong> ({selectedAgent.branch.name}).
                      </p>
                      <button
                        onClick={startCall}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs shadow-md transition-colors btn-gold-glow"
                      >
                        <PhoneCall className="h-4 w-4" />
                        <span>Start Call Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-500 bg-amber-500/10 p-2 rounded flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-1.5 shrink-0" />
                      <span>All agents are currently offline or busy. Please request a callback below.</span>
                    </div>
                  )}

                  {/* Mobile direct tel fallback */}
                  <a
                    href={`tel:${selectedAgent?.phone || '+15550192834'}`}
                    className="block text-center text-[10px] text-gold-600/70 hover:text-gold-600 underline"
                  >
                    Or dial direct: {selectedAgent?.phone || '+1 (555) 019-2834'}
                  </a>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <hr className="w-full border-gray-800" />
                  <span className="absolute bg-slate-900 px-2 text-[10px] text-gray-500 font-bold uppercase">OR</span>
                </div>

                {/* 2. Request a Callback Form */}
                <div className="bg-charcoal-900/40 p-3.5 rounded border border-gold-600/10 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-gold-600" />
                    Option 2: Request a Callback
                  </h4>

                  {formSubmitted ? (
                    <div className="text-[11px] text-green-500 bg-green-500/10 p-3 rounded flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Callback requested! An agent will call you back shortly.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleCallbackSubmit} className="space-y-2.5">
                      <p className="text-[10px] text-gray-500">
                        Leave your number, and an agent will call you back within 15 minutes during business hours.
                      </p>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={callbackName}
                          onChange={(e) => setCallbackName(e.target.value)}
                          className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded px-2.5 py-2 text-white focus:outline-none"
                        />
                        <input
                          type="tel"
                          placeholder="Your Phone Number"
                          value={callbackPhone}
                          onChange={(e) => setCallbackPhone(e.target.value)}
                          className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded px-2.5 py-2 text-white focus:outline-none"
                        />
                      </div>

                      {formError && <p className="text-[10px] text-red-500">{formError}</p>}

                      <button
                        type="submit"
                        className="w-full py-2 rounded border border-gold-600/30 text-gold-600 hover:bg-gold-600/10 font-bold text-xs transition-colors"
                      >
                        Request Callback
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
