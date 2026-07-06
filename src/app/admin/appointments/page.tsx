'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Check,
  X,
  RefreshCw,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface Appointment {
  id: string;
  branchId: string;
  slotDate: string;
  slotTime: string;
  customerName: string;
  phone: string;
  email: string;
  status: string;
  notes: string | null;
  createdAt: string;
  branch: { name: string; phone: string; address: string };
}

interface Branch {
  id: string;
  name: string;
}

export default function AppointmentsAdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Selected Booking Details
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [apptNotes, setApptNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (branchFilter) queryParams.append('branchId', branchFilter);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (dateFilter) queryParams.append('date', dateFilter);

      const res = await fetch(`/api/appointments?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // filter client-side search query
        let filtered = data;
        if (searchTerm) {
          filtered = data.filter(
            (a: Appointment) =>
              a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.phone.includes(searchTerm)
          );
        }
        setAppointments(filtered);
      }
    } catch (e) {
      console.error('Failed to load appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [branchFilter, statusFilter, dateFilter]);

  // Load branches
  useEffect(() => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => setBranches(data))
      .catch((e) => console.error(e));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleSelectAppt = (appt: Appointment) => {
    setSelectedAppt(appt);
    setRescheduleDate(appt.slotDate);
    setRescheduleTime(appt.slotTime);
    setApptNotes(appt.notes || '');
    setSaveSuccess(false);
  };

  // Quick Action: Approve / Complete / Reject Status
  const handleStatusChange = async (apptId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAppointments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
        if (selectedAppt?.id === apptId) {
          setSelectedAppt({ ...selectedAppt, ...updated });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Modify rescheduling parameters and update notes
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      const res = await fetch(`/api/appointments/${selectedAppt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotDate: rescheduleDate,
          slotTime: rescheduleTime,
          notes: apptNotes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSaveSuccess(true);
        setAppointments((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
        setSelectedAppt({ ...selectedAppt, ...updated });
        fetchAppointments(); // refresh layout
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gold-600/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Valuation Scheduler</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage customer branch appointments</p>
        </div>
        <button
          onClick={fetchAppointments}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-charcoal-900 border border-gold-600/20 rounded text-xs font-semibold text-gold-600 hover:bg-gold-600 hover:text-black transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync Scheduler</span>
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="glass p-4 rounded-xl border border-gold-600/10 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search appointments by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-charcoal-950 border border-gray-800 focus:border-gold-600 rounded pl-10 pr-4 py-2.5 text-white focus:outline-none"
            />
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs rounded transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gold-600" />
            <span className="text-gray-400 font-semibold uppercase">Filter:</span>
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-charcoal-950 border border-gray-800 rounded px-3 py-1.5 text-white focus:outline-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-charcoal-950 border border-gray-800 rounded px-3 py-1.5 text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-charcoal-950 border border-gray-800 rounded px-3 py-1.5 text-white focus:outline-none"
          />
        </div>
      </div>

      {/* BOOKING LIST & EDIT PANEL GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* List Table */}
        <div className={`glass rounded-xl border border-gold-600/10 overflow-hidden ${
          selectedAppt ? 'xl:col-span-7' : 'xl:col-span-12'
        }`}>
          {loading ? (
            <div className="p-12 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full animate-shimmer-bg rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-charcoal-900 border-b border-gold-600/10 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Schedule</th>
                    <th className="p-3.5">Customer details</th>
                    <th className="p-3.5">Branch Store</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Approve / Complete</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr
                      key={appt.id}
                      onClick={() => handleSelectAppt(appt)}
                      className={`border-b border-gray-850 hover:bg-gold-600/5 transition-colors cursor-pointer ${
                        selectedAppt?.id === appt.id ? 'bg-gold-600/5' : ''
                      }`}
                    >
                      <td className="p-3.5 whitespace-nowrap">
                        <p className="font-bold text-white flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 text-gold-600 mr-1.5" />
                          {appt.slotDate}
                        </p>
                        <p className="text-[10px] text-gray-500 flex items-center mt-0.5">
                          <Clock className="h-3 w-3 text-gold-600 mr-1.5" />
                          {appt.slotTime}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-white">{appt.customerName}</p>
                        <p className="text-[10px] text-gray-500">{appt.phone}</p>
                      </td>
                      <td className="p-3.5 text-gray-300">
                        {appt.branch.name}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          appt.status === 'PENDING' ? 'bg-amber-600/15 text-amber-400 border border-amber-600/25' :
                          appt.status === 'APPROVED' ? 'bg-green-600/15 text-green-400 border border-green-600/25' :
                          appt.status === 'COMPLETED' ? 'bg-blue-600/15 text-blue-400 border border-blue-600/25' :
                          'bg-red-600/15 text-red-400 border border-red-600/25'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          {appt.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'APPROVED')}
                              className="p-1 rounded bg-green-500/10 text-green-400 border border-green-500/25 hover:bg-green-500 hover:text-black transition-colors"
                              title="Approve"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </button>
                          )}
                          {appt.status === 'APPROVED' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                              className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25 hover:bg-blue-500 hover:text-black transition-colors"
                              title="Mark Completed"
                            >
                              <CheckCircle className="h-4.5 w-4.5" />
                            </button>
                          )}
                          {appt.status !== 'CANCELLED' && appt.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'REJECTED')}
                              className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500 hover:text-black transition-colors"
                              title="Reject"
                            >
                              <X className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-500">
                        No appointments found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Appointment detail Rescheduling panel */}
        {selectedAppt && (
          <div className="xl:col-span-5 glass border border-gold-600/20 rounded-xl overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="bg-charcoal-900 border-b border-gold-600/10 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Reschedule Appointment</h2>
                <p className="text-[10px] text-gray-400">{selectedAppt.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Profile info details */}
            <div className="p-5 space-y-5 text-xs">
              <div className="bg-charcoal-950 p-3.5 rounded border border-gray-850 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 uppercase">Phone Number</p>
                    <p className="font-semibold text-white">{selectedAppt.phone}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 uppercase">Email Address</p>
                    <p className="font-semibold text-white truncate">{selectedAppt.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-900 grid grid-cols-1">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 uppercase">Branch Store Location</p>
                    <p className="font-semibold text-white">{selectedAppt.branch.name}</p>
                    <p className="text-[10px] text-gray-500">{selectedAppt.branch.address}</p>
                  </div>
                </div>
              </div>

              {/* Edit form */}
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Reschedule Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full bg-charcoal-900 border border-gray-800 rounded p-2 text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Reschedule Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 14:00"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full bg-charcoal-900 border border-gray-800 rounded p-2 text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-semibold">Reschedule Notes / Logs</label>
                  <textarea
                    placeholder="Provide notes about gold appraisal items or rescheduling logs..."
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-charcoal-900 border border-gray-800 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>

                {saveSuccess && (
                  <p className="text-[10px] text-green-400 font-bold">Appointment details updated successfully!</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  Confirm Rescheduling updates
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
