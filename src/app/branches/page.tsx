import React from 'react';
import { prisma } from '@/lib/db';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

async function getBranches() {
  try {
    return await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch (e) {
    console.error('Failed to load branches:', e);
    return [];
  }
}

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center space-y-3 mb-16">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl flex items-center justify-center space-x-2">
          <MapPin className="h-8 w-8 text-gold-600 animate-float" />
          <span>Our Store <span className="text-gold-600 text-gold-gradient">Branches</span></span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Appraise and sell your gold locally. Walk in today or reserve an appointment for prioritized certified testing at any of our secure branch storefronts.
        </p>
      </div>

      <div className="space-y-12">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="glass border border-gold-600/10 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 hover:border-gold-600/25 transition-all duration-300 relative"
          >
            {/* Store Information */}
            <div className="lg:col-span-6 p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gold-600/10 rounded-full flex items-center justify-center border border-gold-600/25 shrink-0">
                    <MapPin className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">{branch.name}</h2>
                    <p className="text-xs text-gold-600 uppercase tracking-widest font-semibold mt-0.5">Active Location</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-gray-400">
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Branch Address</p>
                      <p className="leading-relaxed mt-0.5">{branch.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 pt-2 border-t border-gray-900">
                    <Phone className="h-4.5 w-4.5 text-gold-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-white inline-block mr-2">Phone:</p>
                      <a href={`tel:${branch.phone}`} className="hover:text-gold-600 underline">
                        {branch.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <Mail className="h-4.5 w-4.5 text-gold-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-white inline-block mr-2">Email:</p>
                      <a href={`mailto:${branch.email}`} className="hover:text-gold-600 underline">
                        {branch.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 pt-2 border-t border-gray-900">
                    <Clock className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Business Hours</p>
                      <p className="leading-relaxed mt-0.5">{branch.hours}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-6 border-t border-gray-900">
                <Link
                  href={`/book?branchId=${branch.id}`}
                  className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors btn-gold-glow"
                >
                  Book Valuation Appointment
                </Link>
                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-xs text-gold-600 hover:text-gold-500 underline font-semibold"
                >
                  <span>Google Maps Directions</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Google Map Embed/Image Mock */}
            <div className="lg:col-span-6 h-[300px] lg:h-auto min-h-[300px] bg-charcoal-900 border-l border-gold-600/10 relative overflow-hidden flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gold-600/5 pointer-events-none" />
              
              {/* If no Maps API configured, show high-fidelity location card mock */}
              <div className="text-center space-y-4 max-w-sm relative z-10 p-6 glass rounded-lg border border-gold-600/10">
                <MapPin className="h-10 w-10 text-gold-600 mx-auto animate-float" />
                <h3 className="text-sm font-bold text-white">Secure Storefront Verification</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  We are situated in a secure banking sector with private appraisal booths. Free parking is validated for all metal sellers.
                </p>
                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-charcoal-800 border border-gold-600/20 text-gold-600 hover:bg-gold-600 hover:text-black rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
        {branches.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No active store locations listed. Please contact support.
          </div>
        )}
      </div>
    </div>
  );
}
