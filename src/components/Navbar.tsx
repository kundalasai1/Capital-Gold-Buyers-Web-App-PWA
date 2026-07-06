'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Coins, Calendar, Calculator, MapPin, Newspaper, PhoneCall, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: Coins },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Book Appointment', href: '/book', icon: Calendar },
    { name: 'Branches', href: '/branches', icon: MapPin },
    { name: 'Blog', href: '/blog', icon: Newspaper },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-gold-600/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-gold-600 animate-float" />
              <span className="font-sans text-xl font-bold tracking-wider text-gold-600 uppercase">
                Capital Gold <span className="text-white">Buyers</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-gold-600 bg-gold-600/10 border-b-2 border-gold-600'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/40'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              
              <Link
                href="/admin"
                className="flex items-center space-x-1.5 px-4 py-2 rounded border border-gold-600/30 text-gold-600 hover:bg-gold-600 hover:text-black font-semibold text-xs transition-all duration-300 btn-gold-glow"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6 text-gold-600" /> : <Menu className="h-6 w-6 text-gold-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-b border-gold-600/10">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-gold-600 bg-gold-600/15'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 text-gold-600" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-semibold text-gold-600 border border-gold-600/20 mt-2 hover:bg-gold-600 hover:text-black transition-colors"
            >
              <ShieldAlert className="h-5 w-5 text-gold-600" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
