import React from 'react';
import Link from 'next/link';
import GoldRateWidget from '@/components/GoldRateWidget';
import { ShieldCheck, Scale, Award, ArrowRight, PhoneCall, Calendar, MapPin } from 'lucide-react';
import { prisma } from '@/lib/db';

async function fetchActiveBranches() {
  try {
    return await prisma.branch.findMany({
      where: { isActive: true },
      take: 3,
    });
  } catch (e) {
    return [];
  }
}

export default async function HomePage() {
  const branches = await fetchActiveBranches();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-32 bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-slate-900 border-b border-gold-600/10">
        {/* Luxury Gold Ambient Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] bg-gold-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gold-600/10 text-gold-600 border border-gold-600/20 uppercase tracking-wider">
                Premier Precious Metals Dealer
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Turn Your Gold Into <br className="hidden sm:inline" />
                <span className="text-gold-600 text-gold-gradient">Instant Cash Value</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0">
                Capital Gold Buyers offers the highest market payouts for your gold, silver, and platinum. Get a free, transparent valuation at our branches today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/book"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-sm shadow-lg transition-all duration-300 btn-gold-glow"
                >
                  <Calendar className="h-4.5 w-4.5" />
                  <span>Book Free Valuation</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/calculator"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded border border-gray-700 hover:border-gold-600 hover:bg-gold-600/5 text-white font-bold text-sm transition-colors"
                >
                  <span>Use Gold Calculator</span>
                </Link>
              </div>
            </div>

            {/* Hero Rates Widget & Gold Image */}
            <div className="lg:col-span-5 w-full space-y-4">
              <GoldRateWidget />
              <div className="glass rounded-xl p-2.5 border border-gold-600/15 overflow-hidden relative group">
                <img
                  src="/gold_display.png"
                  alt="Gold Bullion Display"
                  className="rounded-lg shadow-lg object-cover h-40 w-full hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS SECTION */}
      <section className="py-20 bg-charcoal-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why Sell to <span className="text-gold-600">Capital Gold Buyers</span>?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">
              We pride ourselves on offering a transparent, honest, and secure selling environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass p-8 rounded-xl border border-gold-600/10 space-y-4 hover:border-gold-600/30 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-gold-600/10 flex items-center justify-center border border-gold-600/20">
                <ShieldCheck className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="text-lg font-bold text-white">100% Certified Assaying</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our assaying processes are completed in front of you using X-ray fluorescence (XRF) technology, ensuring accurate purity checks without damage.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-8 rounded-xl border border-gold-600/10 space-y-4 hover:border-gold-600/30 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-gold-600/10 flex items-center justify-center border border-gold-600/20">
                <Scale className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="text-lg font-bold text-white">Calibrated Precision Scales</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                All scales are government-certified and calibrated daily. We weigh your metals transparently right in front of you, down to the milligram.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass p-8 rounded-xl border border-gold-600/10 space-y-4 hover:border-gold-600/30 transition-all duration-300">
              <div className="h-12 w-12 rounded-lg bg-gold-600/10 flex items-center justify-center border border-gold-600/20">
                <Award className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="text-lg font-bold text-white">Best Payout Guarantee</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We monitor international gold markets continuously. We promise to beat any written local quote for your precious metals by up to 5%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE LOCATIONS / BRANCHES */}
      <section className="py-20 bg-gradient-to-b from-charcoal-950 to-slate-900 border-t border-gold-600/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Visit Our <span className="text-gold-600">Local Branches</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-xl">
                Pop into one of our secure storefronts. Our staff are waiting to assist you with instant appraisals.
              </p>
            </div>
            <Link
              href="/branches"
              className="text-gold-600 font-bold hover:text-gold-500 text-sm flex items-center space-x-1"
            >
              <span>View All Branch Locations</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="glass p-6 rounded-xl border border-gold-600/10 flex flex-col justify-between space-y-6 hover:border-gold-600/30 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gold-600" />
                    <h3 className="text-lg font-bold text-white">{branch.name}</h3>
                  </div>
                  <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
                    <p><strong>Address:</strong> {branch.address}</p>
                    <p><strong>Phone:</strong> {branch.phone}</p>
                    <p><strong>Hours:</strong> {branch.hours}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold-600 hover:text-gold-500 underline font-semibold"
                  >
                    Get Directions
                  </a>
                  <Link
                    href={`/book?branchId=${branch.id}`}
                    className="px-4 py-2 bg-gold-600/10 border border-gold-600/30 hover:bg-gold-600 hover:text-black rounded text-xs font-bold text-gold-600 transition-colors"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
            {branches.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                No active branches configured. Please check back later.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA PANEL */}
      <section className="py-20 bg-charcoal-950 border-t border-gold-600/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-600/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Lock In Your Gold Valuation?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            Don&apos;t wait for price fluctuations. Book an appraisal appointment today or talk directly to our agent.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/book"
              className="px-8 py-3.5 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-sm shadow-lg transition-colors btn-gold-glow"
            >
              Book Valuation Visit
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded border border-gray-700 hover:border-gold-600 hover:bg-gold-600/5 text-white font-bold text-sm transition-colors"
            >
              Inquire Online
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
