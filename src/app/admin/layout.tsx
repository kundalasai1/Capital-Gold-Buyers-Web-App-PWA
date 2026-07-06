import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getSessionUser, clearSessionCookie } from '@/lib/auth';
import {
  BarChart3,
  Users,
  Calendar,
  Coins,
  Newspaper,
  Building2,
  FileClock,
  LogOut,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

async function handleLogoutAction() {
  'use server';
  await clearSessionCookie();
  redirect('/admin/login');
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  // Skip session validation and dashboard chrome if rendering the login sub-page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const session = await getSessionUser();

  // If no session exists, redirect to login page
  if (!session) {
    redirect('/admin/login');
  }

  const menuItems = [
    { name: 'Analytics', href: '/admin', icon: BarChart3, roles: ['ADMIN', 'STAFF'] },
    { name: 'Leads', href: '/admin/leads', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar, roles: ['ADMIN', 'STAFF'] },
    { name: 'Gold Rates', href: '/admin/rates', icon: Coins, roles: ['ADMIN', 'STAFF'] },
    { name: 'Blog Posts', href: '/admin/blog', icon: Newspaper, roles: ['ADMIN', 'STAFF'] },
    { name: 'Branches', href: '/admin/branches', icon: Building2, roles: ['ADMIN'] },
    { name: 'Activity Log', href: '/admin/activity', icon: FileClock, roles: ['ADMIN'] },
  ];

  const allowedMenu = menuItems.filter((item) => item.roles.includes(session.role));

  return (
    <div className="flex h-screen bg-charcoal-950 text-slate-100 overflow-hidden">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-charcoal-900 border-r border-gold-600/10 flex flex-col justify-between shrink-0">
        <div className="flex flex-col">
          {/* Header */}
          <div className="h-20 flex items-center px-6 border-b border-gold-600/10">
            <Coins className="h-6 w-6 text-gold-600 mr-2" />
            <span className="font-sans text-sm font-bold tracking-wider text-gold-600 uppercase">
              CGB | <span className="text-white">Admin Panel</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {allowedMenu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/40 transition-colors"
                >
                  <Icon className="h-4 w-4 text-gold-600" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: User profile and logout */}
        <div className="p-4 border-t border-gold-600/10 space-y-4">
          <div className="flex items-center space-x-3 bg-charcoal-950 p-3 rounded border border-gray-850">
            <div className="h-8 w-8 rounded-full bg-gold-600/10 border border-gold-600/25 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-gold-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{session.name}</p>
              <p className="text-[10px] text-gold-600 uppercase tracking-widest flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {session.role}
              </p>
            </div>
          </div>

          <form action={handleLogoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 rounded hover:bg-red-500/5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-charcoal-900 border-b border-gold-600/10 flex items-center px-8 justify-between shrink-0">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Dashboard
          </h2>
          <div className="text-xs text-gray-400 font-mono">
            System time: {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* Dynamic page children wrapper */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
