import React from 'react';
import Link from 'next/link';
import { Coins, Phone, Mail, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 border-t border-gold-600/10 text-gray-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-6 w-6 text-gold-600" />
              <span className="font-sans text-lg font-bold tracking-wider text-gold-600 uppercase">
                Capital Gold <span className="text-white">Buyers</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Your trusted partner for buying gold, silver, and precious metals. Delivering the highest payout rates with transparency, security, and integrity since 2012.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gold-600/20 pb-2">
              Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/calculator" className="hover:text-gold-600 transition-colors">
                  Gold Value Calculator
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-gold-600 transition-colors">
                  Book Valuation Appointment
                </Link>
              </li>
              <li>
                <Link href="/branches" className="hover:text-gold-600 transition-colors">
                  Find a Branch
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-600 transition-colors">
                  Gold Selling Guides & Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gold-600/20 pb-2">
              Corporate Office
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                <span>100 Financial Center Blvd, Metropolis</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4.5 w-4.5 text-gold-600 shrink-0" />
                <span>+1 (555) 019-9000</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4.5 w-4.5 text-gold-600 shrink-0" />
                <span>support@capitalgoldbuyers.com</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gold-600/20 pb-2">
              Business Hours
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <Clock className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-300">Monday - Friday</p>
                  <p className="text-gray-500">9:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-2.5">
                <Clock className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-300">Saturday</p>
                  <p className="text-gray-500">10:00 AM - 4:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-2.5">
                <Clock className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-300">Sunday</p>
                  <p className="text-gray-500">Branches Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
          <p>&copy; 2026 Capital Gold Buyers. All rights reserved. Registered gold dealer #920-883. Valuation rates fluctuate with international market changes.</p>
        </div>
      </div>
    </footer>
  );
}
