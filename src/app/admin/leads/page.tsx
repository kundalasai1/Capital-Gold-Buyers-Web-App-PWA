'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle,
  Building,
  Calendar,
  AlertCircle,
  Eye,
  Plus,
  Send,
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  inquirySource: string;
  inquiryDate: string;
  status: string;
  notes: string; // JSON string of logs
  branchId: string | null;
  branch: { name: string } | null;
  assignedToId: string | null;
  assignedTo: { name: string } | null;
}

interface Branch {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Selected Lead Details Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [noteText, setNoteText] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateAssignedTo, setUpdateAssignedTo] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (branchFilter) queryParams.append('branchId', branchFilter);
      if (sourceFilter) queryParams.append('source', sourceFilter);
      if (searchTerm) queryParams.append('q', searchTerm);

      const res = await fetch(`/api/leads?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e) {
      console.error('Failed to fetch leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, branchFilter, sourceFilter]);

  // Load supporting lists
  useEffect(() => {
    // Fetch branches
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => setBranches(data))
      .catch((e) => console.error(e));

    // Fetch staff
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setStaffList(data.filter((u: any) => u.role === 'STAFF' || u.role === 'ADMIN')))
      .catch((e) => console.error(e));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  // Open detail panel
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setUpdateStatus(lead.status);
    setUpdateAssignedTo(lead.assignedToId || '');
    setNoteText('');
    setSaveSuccess(false);
  };

  // Update lead status/assignment/notes
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          assignedToId: updateAssignedTo || null,
          noteText: noteText.trim(),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSaveSuccess(true);
        setNoteText('');
        // Update local list
        setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
        // Refresh detail view
        setSelectedLead({ ...selectedLead, ...updated });
        fetchLeads(); // Reload logs
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export to CSV utility (simulate Excel)
  const exportToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Lead ID', 'Name', 'Phone', 'Email', 'Source', 'Branch', 'Status', 'Inquiry Date'];
    const rows = leads.map((l) => [
      l.id,
      l.name,
      l.phone,
      l.email,
      l.inquirySource,
      l.branch ? l.branch.name : 'Corporate/Online',
      l.status,
      new Date(l.inquiryDate).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse notes history logs array from JSON
  const getNotesArray = (notesStr: string) => {
    try {
      const parsed = JSON.parse(notesStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gold-600/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Lead Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">Track and update customer inquiries</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={leads.length === 0}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-600/10 border border-green-500/30 rounded text-xs font-semibold text-green-400 hover:bg-green-600 hover:text-black transition-colors"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="glass p-4 rounded-xl border border-gold-600/10 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search leads by name, email, phone..."
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
            <span className="text-gray-400 font-semibold uppercase">Filter by:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-charcoal-950 border border-gray-800 rounded px-3 py-1.5 text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="INTERESTED">Interested</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONVERTED">Converted</option>
            <option value="CLOSED">Closed</option>
          </select>

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
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-charcoal-950 border border-gray-800 rounded px-3 py-1.5 text-white focus:outline-none"
          >
            <option value="">All Sources</option>
            <option value="CONTACT_FORM">Contact Form</option>
            <option value="CALCULATOR">Calculator</option>
            <option value="APPOINTMENT">Appointment</option>
            <option value="AGENT_CALL">Agent Call</option>
          </select>
        </div>
      </div>

      {/* LEADS LIST & DETAILS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Leads Table */}
        <div className={`glass rounded-xl border border-gold-600/10 overflow-hidden ${
          selectedLead ? 'xl:col-span-7' : 'xl:col-span-12'
        }`}>
          {loading ? (
            <div className="p-12 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-full animate-shimmer-bg rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-charcoal-900 border-b border-gold-600/10 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5">Assigned To</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className={`border-b border-gray-850 hover:bg-gold-600/5 transition-colors cursor-pointer ${
                        selectedLead?.id === lead.id ? 'bg-gold-600/5' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <p className="font-bold text-white">{lead.name}</p>
                        <p className="text-[10px] text-gray-500">{lead.phone}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-charcoal-950 text-gray-400 font-semibold border border-gray-800">
                          {lead.inquirySource}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-400">
                        {lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                          lead.status === 'NEW' ? 'bg-blue-600/15 text-blue-400 border border-blue-600/25' :
                          lead.status === 'CONTACTED' ? 'bg-amber-600/15 text-amber-400 border border-amber-600/25' :
                          lead.status === 'INTERESTED' ? 'bg-purple-600/15 text-purple-400 border border-purple-600/25' :
                          lead.status === 'SCHEDULED' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-600/25' :
                          lead.status === 'CONVERTED' ? 'bg-green-600/15 text-green-400 border border-green-600/25' :
                          'bg-red-600/15 text-red-400 border border-red-600/25'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="p-1 rounded hover:bg-gray-800 text-gold-600">
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-500">
                        No leads found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Lead Detail View */}
        {selectedLead && (
          <div className="xl:col-span-5 glass border border-gold-600/20 rounded-xl overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="bg-charcoal-900 border-b border-gold-600/10 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">{selectedLead.name}</h2>
                <p className="text-[10px] text-gray-400">Lead detail file</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-5 space-y-5 text-xs">
              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-4 bg-charcoal-950 p-3.5 rounded border border-gray-850">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase">Phone Number</p>
                  <p className="font-semibold text-white">{selectedLead.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase">Email Address</p>
                  <p className="font-semibold text-white truncate">{selectedLead.email || 'N/A'}</p>
                </div>
                <div className="space-y-1 mt-2">
                  <p className="text-[10px] text-gray-500 uppercase">Date Logged</p>
                  <p className="font-semibold text-white">{new Date(selectedLead.inquiryDate).toLocaleString()}</p>
                </div>
                <div className="space-y-1 mt-2">
                  <p className="text-[10px] text-gray-500 uppercase">Assigned Branch</p>
                  <p className="font-semibold text-white">{selectedLead.branch ? selectedLead.branch.name : 'Corporate/Online'}</p>
                </div>
              </div>

              {/* Action Update Form */}
              <form onSubmit={handleUpdateLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Change Status</label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full bg-charcoal-900 border border-gray-800 rounded p-2 text-white focus:outline-none"
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="INTERESTED">Interested</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-semibold">Assign Staff</label>
                    <select
                      value={updateAssignedTo}
                      onChange={(e) => setUpdateAssignedTo(e.target.value)}
                      className="w-full bg-charcoal-900 border border-gray-800 rounded p-2 text-white focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {staffList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Add Activity log */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-semibold">Add Follow-up Note</label>
                  <textarea
                    placeholder="Enter follow-up details..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    className="w-full bg-charcoal-900 border border-gray-800 rounded p-2.5 text-white focus:outline-none"
                  />
                </div>

                {saveSuccess && (
                  <p className="text-[10px] text-green-400 font-bold">Updates saved successfully!</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors"
                >
                  Save File Updates
                </button>
              </form>

              {/* Chronological Activity log list */}
              <div className="space-y-3.5 border-t border-gold-600/10 pt-4">
                <h3 className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Lead Activity History log
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {getNotesArray(selectedLead.notes).map((item: any, idx: number) => (
                    <div key={idx} className="bg-charcoal-900/50 p-2.5 rounded border border-gray-850">
                      <p className="text-gray-300 leading-relaxed">{item.note}</p>
                      <div className="flex items-center justify-between text-[9px] text-gray-500 mt-1.5 border-t border-gray-850 pt-1">
                        <span>By: {item.author || 'System'}</span>
                        <span>{new Date(item.date).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
