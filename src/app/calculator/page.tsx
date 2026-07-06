'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, ShieldAlert, CheckCircle, Scale, Coins, Building, ArrowRight } from 'lucide-react';

interface GoldRate {
  id: string;
  metal: string;
  purity: string;
  ratePerGram: number;
  ratePerTola: number;
}

interface Branch {
  id: string;
  name: string;
}

export default function CalculatorPage() {
  const [rates, setRates] = useState<GoldRate[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculator inputs
  const [metal, setMetal] = useState('GOLD');
  const [purity, setPurity] = useState('24K');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('Grams');
  const [customRate, setCustomRate] = useState('');
  const [isCustomRateActive, setIsCustomRateActive] = useState(false);

  // Quote Lead Form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState('');

  // Results
  const [calculatedResult, setCalculatedResult] = useState<any>(null);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch rates and active branches
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ratesRes, branchesRes] = await Promise.all([
          fetch('/api/rates'),
          fetch('/api/branches'),
        ]);

        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          setRates(ratesData.filter((r: any) => r.isPublished));
        }

        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData);
          if (branchesData.length > 0) setBranchId(branchesData[0].id);
        }
      } catch (err) {
        console.error('Failed to load calculator parameters:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Set default purity list based on selected metal
  const purities = metal === 'GOLD' ? ['24K', '22K', '18K'] : ['999'];
  useEffect(() => {
    setPurity(purities[0]);
  }, [metal]);

  // 3. Pre-fill rate based on selected metal/purity
  useEffect(() => {
    if (!isCustomRateActive && rates.length > 0) {
      const match = rates.find((r) => r.metal === metal && r.purity === purity);
      if (match) {
        const rate = unit === 'Grams' ? match.ratePerGram : match.ratePerTola;
        setCustomRate(rate.toString());
      }
    }
  }, [metal, purity, unit, rates, isCustomRateActive]);

  // 4. Calculate Payout
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCalculatedResult(null);

    const numWeight = parseFloat(weight);
    const numRate = parseFloat(customRate);

    if (isNaN(numWeight) || numWeight <= 0) {
      setErrorMsg('Please enter a valid weight');
      return;
    }

    if (isNaN(numRate) || numRate <= 0) {
      setErrorMsg('Please enter a valid valuation rate');
      return;
    }

    const grossValue = numWeight * numRate;
    const DEDUCTION_PCT = 0.08; // 8% service processing fee
    const payout = +(grossValue * (1 - DEDUCTION_PCT)).toFixed(2);

    setCalculatedResult({
      grossValue: +grossValue.toFixed(2),
      deductionPercent: DEDUCTION_PCT * 100,
      payout,
      weight: numWeight,
      unit,
      purity,
      metal,
      rateUsed: numRate,
    });
  };

  // 5. Submit Locked-in Payout Quote request (Lead capture)
  const handleLockQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg('Please fill in your name, email, and phone number to request a quote lock');
      return;
    }

    try {
      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metal,
          purity,
          weight,
          unit,
          name,
          phone,
          email,
          branchId,
        }),
      });

      if (res.ok) {
        setLeadSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit quote request');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl flex items-center justify-center space-x-2">
          <Calculator className="h-8 w-8 text-gold-600 animate-float" />
          <span>Payout Valuation <span className="text-gold-600 text-gold-gradient">Calculator</span></span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Estimate the value of your precious metals instantly. Select metal, purity, and input weight to lock in your live valuation quote.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Calculator Panel */}
        <div className="lg:col-span-6 glass border border-gold-600/10 rounded-xl p-6 relative">
          <h2 className="text-md font-bold text-white mb-4 border-b border-gold-600/10 pb-2 uppercase tracking-wider flex items-center">
            <Scale className="h-4.5 w-4.5 mr-2 text-gold-600" />
            Enter Valuation details
          </h2>

          {loading ? (
            <div className="space-y-4 py-8">
              <div className="h-10 w-full animate-shimmer-bg rounded" />
              <div className="h-10 w-full animate-shimmer-bg rounded" />
              <div className="h-10 w-full animate-shimmer-bg rounded" />
            </div>
          ) : (
            <form onSubmit={handleCalculate} className="space-y-4">
              {/* Metal & Purity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Metal</label>
                  <select
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                  >
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Purity</label>
                  <select
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                  >
                    {purities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weight & Unit */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Weight</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 10.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded p-3 text-white focus:outline-none"
                  >
                    <option value="Grams">Grams</option>
                    <option value="Tolas">Tolas</option>
                  </select>
                </div>
              </div>

              {/* Rate per Gram / Tola */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Rate (₹ per {unit.toLowerCase() === 'grams' ? 'Gram' : 'Tola'})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomRateActive(!isCustomRateActive)}
                    className="text-[10px] text-gold-600 underline font-semibold focus:outline-none"
                  >
                    {isCustomRateActive ? 'Use Market Rate' : 'Edit Rate'}
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  disabled={!isCustomRateActive}
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className={`w-full text-xs bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none ${
                    isCustomRateActive ? 'focus:border-gold-600 border-gold-600/40 text-gold-200' : 'opacity-65 cursor-not-allowed'
                  }`}
                />
              </div>

              {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full py-3.5 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider transition-colors btn-gold-glow shadow-lg"
              >
                Calculate Estimated Value
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Results & Lock-in Form */}
        <div className="lg:col-span-6 space-y-6">
          {calculatedResult ? (
            /* RESULTS DISPLAY */
            <div className="glass border border-gold-600/20 rounded-xl p-6 animate-slide-in relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-gold-600/5 rounded-full blur-2xl pointer-events-none" />
              
              <h2 className="text-md font-bold text-white mb-4 border-b border-gold-600/10 pb-2 uppercase tracking-wider flex items-center">
                <Coins className="h-4.5 w-4.5 mr-2 text-gold-600 animate-float" />
                Calculation Results
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-800 text-sm">
                  <div className="text-gray-400">Total Weight:</div>
                  <div className="text-right text-white font-bold">{calculatedResult.weight} {calculatedResult.unit}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-800 text-sm">
                  <div className="text-gray-400">Purity Rating:</div>
                  <div className="text-right text-white font-bold">{calculatedResult.purity} {calculatedResult.metal}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-800 text-sm">
                  <div className="text-gray-400">Spot Rate Applied:</div>
                  <div className="text-right text-gold-600 font-bold">₹{calculatedResult.rateUsed.toLocaleString('en-IN')} / {calculatedResult.unit.toLowerCase() === 'grams' ? 'g' : 'tola'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-800 text-sm">
                  <div className="text-gray-400">Gross Metal Value:</div>
                  <div className="text-right text-white font-bold">₹{calculatedResult.grossValue.toLocaleString('en-IN')}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-800 text-sm">
                  <div className="text-gray-400">Melt/Assay Fee ({calculatedResult.deductionPercent}%):</div>
                  <div className="text-right text-red-400 font-bold">
                    -₹{(calculatedResult.grossValue * 0.08).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-charcoal-900/60 p-4 rounded border border-gold-600/20 text-center space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Estimated Payout</p>
                  <p className="text-3xl font-extrabold text-gold-600 text-gold-gradient">₹{calculatedResult.payout.toLocaleString('en-IN')}</p>
                </div>

                {/* Lock-in Quote Form */}
                <div className="border-t border-gold-600/10 pt-4 mt-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center">
                    <Building className="h-3.5 w-3.5 mr-1.5 text-gold-600" />
                    Lock in this Payout Quote
                  </h3>
                  
                  {leadSuccess ? (
                    <div className="p-3 bg-green-500/10 border border-green-500/25 rounded text-green-400 text-xs flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 shrink-0" />
                      <span>Quote request logged! A branch manager will contact you within minutes.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleLockQuote} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded px-2.5 py-2 text-white focus:outline-none"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded px-2.5 py-2 text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded px-2.5 py-2 text-white focus:outline-none"
                          required
                        />
                        <select
                          value={branchId}
                          onChange={(e) => setBranchId(e.target.value)}
                          className="text-xs bg-charcoal-900 border border-gray-800 focus:border-gold-600 rounded px-2.5 py-2 text-white focus:outline-none"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center space-x-2 py-3.5 rounded border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-black font-bold text-xs uppercase tracking-wider transition-all duration-300"
                      >
                        <span>Lock In Quote & Request Callback</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </div>

                <div className="p-3 bg-charcoal-950 rounded border border-gray-800 flex items-start space-x-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-gray-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-gray-500 leading-relaxed">
                    Disclaimer: This payout calculation is an estimate based on today&apos;s spot prices. Physical testing of weight, stones content, and exact chemical purity of metals must be performed in-store before final offer checks are printed.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* PRE-CALCULATION DISPLAY */
            <div className="glass border border-gold-600/10 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <Coins className="h-16 w-16 text-gold-600/35 mb-4 animate-float" />
              <h3 className="text-lg font-bold text-white">Value Estimate Awaiting</h3>
              <p className="text-gray-500 text-xs max-w-sm mt-1 leading-relaxed">
                Fill out the metal parameters on the left and click calculate to reveal estimated payouts, processing fees, and lock-in options.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
