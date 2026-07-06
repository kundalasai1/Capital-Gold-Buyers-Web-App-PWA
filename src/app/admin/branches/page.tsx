'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapUrl: string;
  isActive: boolean;
}

export default function BranchesCMSPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  // Inputs
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hours, setHours] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Status
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleEditClick = (branch: Branch) => {
    setIsEditing(true);
    setEditingBranchId(branch.id);
    setName(branch.name);
    setAddress(branch.address);
    setPhone(branch.phone);
    setEmail(branch.email);
    setHours(branch.hours);
    setMapUrl(branch.mapUrl);
    setIsActive(branch.isActive);
    setSaveSuccess(false);
    setErrorMsg('');
  };

  const handleCreateNewClick = () => {
    setIsEditing(true);
    setEditingBranchId(null);
    setName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setHours('Mon-Fri: 9:00 AM - 6:00 PM, Sat: 10:00 AM - 4:00 PM, Sun: Closed');
    setMapUrl('');
    setIsActive(true);
    setSaveSuccess(false);
    setErrorMsg('');
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveSuccess(false);

    if (!name.trim() || !address.trim() || !phone.trim() || !email.trim() || !hours.trim()) {
      setErrorMsg('All fields except Google Maps URL are required');
      return;
    }

    const payload = {
      name,
      address,
      phone,
      email,
      hours,
      mapUrl,
      isActive,
    };

    try {
      const url = editingBranchId ? `/api/branches/${editingBranchId}` : '/api/branches';
      const method = editingBranchId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setIsEditing(false);
        setEditingBranchId(null);
        fetchBranches();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to save branch');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBranches();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gold-600/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Branch Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">Configure storefront details and visibility</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleCreateNewClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors btn-gold-glow"
          >
            <Plus className="h-4 w-4" />
            <span>Add Branch</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/25 rounded text-green-400 text-xs flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>Branch saved successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center space-x-2 text-xs text-red-400">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isEditing ? (
        /* CREATE / EDIT FORM */
        <div className="glass border border-gold-600/10 rounded-xl p-6 animate-slide-in">
          <h2 className="text-sm font-bold text-white mb-6 border-b border-gold-600/10 pb-2 uppercase tracking-wider">
            {editingBranchId ? 'Edit Store Profile' : 'Configure New Branch'}
          </h2>

          <form onSubmit={handleSaveBranch} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Westside Branch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Store Hours (Description)</label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Fri: 9:00 AM - 6:00 PM, Sat: Closed"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. branch@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-800 text-gold-600 focus:ring-0 focus:ring-offset-0 h-4 w-4 bg-charcoal-900"
                />
                <label htmlFor="active" className="text-xs text-gray-300 font-semibold cursor-pointer">
                  Activate Storefront (Visible on Site)
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-semibold">Branch Location Address</label>
              <input
                type="text"
                placeholder="Full storefront address details..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-semibold">Google Maps URL Link</label>
              <input
                type="text"
                placeholder="Google Maps share link (https://maps.google.com/?q=...)"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                className="w-full bg-charcoal-900 border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-gold-600"
              />
            </div>

            {/* Form actions */}
            <div className="flex items-center space-x-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-charcoal-900 border border-gray-800 text-gray-400 hover:text-white rounded font-bold transition-colors"
              >
                Back to List
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded transition-colors btn-gold-glow"
              >
                Save Branch
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* BRANCHES LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="glass p-5 rounded-xl border border-gold-600/10 hover:border-gold-600/25 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3.5 text-xs text-gray-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-gold-600" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{branch.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[8px] uppercase tracking-wider ${
                    branch.isActive
                      ? 'bg-green-600/10 text-green-400 border border-green-600/20'
                      : 'bg-red-600/10 text-red-400 border border-red-600/20'
                  }`}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 border-t border-gray-900 pt-3">
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 text-gold-600 mr-2 shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 text-gold-600 mr-2 shrink-0" />
                    <span>{branch.phone}</span>
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 text-gold-600 mr-2 shrink-0" />
                    <span>{branch.email}</span>
                  </p>
                  <p className="flex items-start">
                    <Clock className="h-4 w-4 text-gold-600 mr-2 shrink-0 mt-0.5" />
                    <span>{branch.hours}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-900 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(branch.id)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    branch.isActive
                      ? 'bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600 hover:text-white'
                      : 'bg-green-600/10 text-green-400 border border-green-600/20 hover:bg-green-600 hover:text-black'
                  }`}
                >
                  {branch.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEditClick(branch)}
                  className="px-4 py-1.5 border border-gold-600/30 text-gold-600 hover:bg-gold-600 hover:text-black rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ))}
          {branches.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              No store branches configured. Please add one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
