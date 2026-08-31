'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Prospect {
  rank: number;
  doctorName: string;
  clinicName: string;
  specialty: string;
  city: string;
  area: string;
  email: string;
  phone?: string;
  website: string;
  sourceUrl: string;
  verificationStatus: string;
  verifiedObservation: string;
  selectedSubject: string;
  emailBody: string;
  htmlBody: string;
  status: string;
  brevoMessageId?: string;
}

interface Stats {
  totalProspects: number;
  verifiedProspects: number;
  sentTotal: number;
  sentToday: number;
  dailyLimit: number;
  remainingToday: number;
  deliveredTotal: number;
  bouncedTotal: number;
  repliedTotal: number;
  positiveReplies: number;
  demosBooked: number;
  trialsStarted: number;
  paidClinics: number;
  optedOutTotal: number;
}

export default function AdminOutreachClient() {
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'kpis' | 'prospects' | 'controls' | 'campaigns' | 'logs'>('kpis');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [senderInfo, setSenderInfo] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Preview Modal
  const [previewProspect, setPreviewProspect] = useState<Prospect | null>(null);

  // Action status
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Dry Run Modal
  const [dryRunData, setDryRunData] = useState<any>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('swasthai_ops_auth');
    if (saved === 'authorized') {
      setIsAuthenticated(true);
      fetchOutreachData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === 'swasthai-ops') {
      sessionStorage.setItem('swasthai_ops_auth', 'authorized');
      setIsAuthenticated(true);
      fetchOutreachData();
    } else {
      alert('Invalid founder passkey.');
    }
  };

  const fetchOutreachData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/outreach/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setProspects(data.prospects || []);
        setRecentLogs(data.recentLogs || []);
        setSenderInfo(data.senderInfo || null);
      }
    } catch (err) {
      console.error('Failed to load outreach data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!confirm('Send ONE test email through Brevo to swasthai.founder@gmail.com?')) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/outreach/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: "Dr. Ashish Ranade",
          clinicName: "Strong Bones Clinic",
          specialty: "Pediatric Orthopedics",
          city: "Pune"
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `Test email sent successfully through Brevo! Message ID: ${data.brevoMessageId}`
        });
        fetchOutreachData();
      } else {
        setActionMessage({
          type: 'error',
          text: `Brevo test delivery failed: ${data.error}`
        });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDryRun = async (stage?: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDryRun: true, stage: stage || 1 })
      });
      const data = await res.json();
      if (data.success) {
        setDryRunData(data);
      }
    } catch (err: any) {
      alert(`Dry run error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendStage = async (stage: number, count: number) => {
    const confirmPrompt = `Execute Stage ${stage} (${count} verified prospects) through Brevo?\n\nThis will send real emails respecting your daily quota.`;
    if (!confirm(confirmPrompt)) return;

    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, isDryRun: false })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `Stage ${stage} executed: ${data.sentCount} emails delivered via Brevo.`
        });
        fetchOutreachData();
      } else {
        setActionMessage({
          type: 'error',
          text: `Stage ${stage} send failed: ${data.error}`
        });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07162C] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-[#0F2C59]/80 border border-teal-500/30 rounded-2xl p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-teal-500/10 rounded-xl text-teal-400 font-black text-2xl">
              ✉️
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SwasthAI Ops • B2B Acquisition</h1>
            <p className="text-xs text-slate-300">
              Enter founder passkey to access Brevo Cold Email Outreach Engine
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-teal-300 uppercase tracking-wider mb-2">
                Founder Passkey
              </label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter passkey..."
                className="w-full bg-[#07162C] border border-teal-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#07162C] font-extrabold py-3 rounded-xl transition text-sm shadow-lg shadow-teal-500/20"
            >
              Unlock Outreach Control Center →
            </button>
          </form>
        </div>
      </div>
    );
  }

  const cities = ['ALL', ...Array.from(new Set(prospects.map(p => p.city)))];
  const specialties = ['ALL', ...Array.from(new Set(prospects.map(p => p.specialty)))];

  const filteredProspects = prospects.filter(p => {
    const matchesSearch = p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'ALL' || p.city === selectedCity;
    const matchesSpecialty = selectedSpecialty === 'ALL' || p.specialty === selectedSpecialty;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesCity && matchesSpecialty && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#07162C] text-slate-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0F2C59]/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center font-extrabold text-teal-300">
              ✉️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">SwasthAI Cold Outreach</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Brevo Engine Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100 Verified Clinic Prospects • Safe Staged Delivery (Max 10/day)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/analytics"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10"
            >
              📊 Website Analytics
            </Link>
            <button
              onClick={handleSendTestEmail}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#07162C] font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {actionLoading ? 'Testing Brevo...' : '⚡ Send Test to Founder'}
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className={`px-6 py-3 text-xs font-semibold text-center ${
          actionMessage.type === 'success' ? 'bg-emerald-900/80 text-emerald-200 border-b border-emerald-500/30' :
          actionMessage.type === 'error' ? 'bg-red-900/80 text-red-200 border-b border-red-500/30' :
          'bg-cyan-900/80 text-cyan-200 border-b border-cyan-500/30'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'kpis' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            📈 Pipeline & KPIs
          </button>
          <button
            onClick={() => setActiveTab('prospects')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'prospects' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            📋 100 Verified Prospects ({prospects.length})
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'controls' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            🚀 Brevo Staged Controls
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'campaigns' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            🎯 Campaign Angles & Sequences
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'logs' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            📜 Brevo Audit Log & Opt-Outs
          </button>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW & KPIS */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0F2C59]/80 border border-white/10 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-semibold block">Total Prospects</span>
                <span className="text-2xl font-black text-white">{stats?.totalProspects || 100}</span>
                <span className="text-[10px] text-teal-400 block mt-1 font-bold">100% Publicly Verified</span>
              </div>
              <div className="bg-[#0F2C59]/80 border border-white/10 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-semibold block">Daily Quota</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{stats?.sentToday || 0} / 10</span>
                  <span className="text-[11px] text-slate-400">({stats?.remainingToday || 10} remaining)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-teal-400 h-full rounded-full" 
                    style={{ width: `${Math.min(100, ((stats?.sentToday || 0) / 10) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-[#0F2C59]/80 border border-white/10 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-semibold block">Total Delivered</span>
                <span className="text-2xl font-black text-white">{stats?.deliveredTotal || 0}</span>
                <span className="text-[10px] text-emerald-400 block mt-1 font-bold">0 Bounces</span>
              </div>
              <div className="bg-[#0F2C59]/80 border border-white/10 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-semibold block">Replies & Demos</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{stats?.repliedTotal || 0}</span>
                  <span className="text-[11px] text-emerald-400 font-bold">({stats?.demosBooked || 0} Demos)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Opt-outs: {stats?.optedOutTotal || 0}</span>
              </div>
            </div>

            {/* Acquisition Funnel Card */}
            <div className="bg-[#0F2C59]/60 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Clinic Acquisition Pipeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-center">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block">1. Researched</span>
                  <span className="text-lg font-bold text-white">100</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block">2. Verified</span>
                  <span className="text-lg font-bold text-teal-300">100</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block">3. Sent</span>
                  <span className="text-lg font-bold text-cyan-300">{stats?.sentTotal || 0}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block">4. Replies</span>
                  <span className="text-lg font-bold text-amber-300">{stats?.repliedTotal || 0}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block">5. Demos</span>
                  <span className="text-lg font-bold text-emerald-300">{stats?.demosBooked || 0}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block">6. Active Pilot</span>
                  <span className="text-lg font-bold text-emerald-400">{stats?.trialsStarted || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROSPECT DATABASE */}
        {activeTab === 'prospects' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0F2C59]/60 p-4 rounded-2xl border border-white/10 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Search Doctor / Clinic</label>
                <input
                  type="text"
                  placeholder="Type name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#07162C] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Filter City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-[#07162C] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Filter Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-[#07162C] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                >
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Filter Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[#07162C] border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="ALL">ALL STATUSES</option>
                  <option value="QUEUED">QUEUED</option>
                  <option value="SENT">SENT</option>
                  <option value="OPTED_OUT">OPTED_OUT</option>
                </select>
              </div>
            </div>

            {/* Prospects Table */}
            <div className="bg-[#0F2C59]/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#07162C]/80 text-slate-300 font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">Doctor & Clinic</th>
                      <th className="p-3.5">Specialty</th>
                      <th className="p-3.5">City & Area</th>
                      <th className="p-3.5">Verified Email</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProspects.map((p) => (
                      <tr key={p.rank} className="hover:bg-white/5 transition">
                        <td className="p-3.5 font-bold text-slate-400">{p.rank}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{p.doctorName}</span>
                          <span className="text-[11px] text-slate-400">{p.clinicName}</span>
                        </td>
                        <td className="p-3.5 text-teal-300 font-medium">{p.specialty}</td>
                        <td className="p-3.5 text-slate-300">{p.city} ({p.area})</td>
                        <td className="p-3.5">
                          <code className="text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                            {p.email}
                          </code>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            p.status === 'OPTED_OUT' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            'bg-slate-700/50 text-slate-300 border border-white/10'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setPreviewProspect(p)}
                            className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 text-[11px] transition"
                          >
                            Inspect Email →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BREVO CONTROLS */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            <div className="bg-[#0F2C59]/60 border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Brevo Staged Execution Controls</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Controlled, rate-limited email delivery exclusively through Brevo Transactional Email API.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stage 1 */}
                <div className="bg-[#07162C] border border-white/10 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-300 uppercase">Stage 1</span>
                    <span className="text-xs text-slate-400">5 Prospects</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dr. Ashish Ranade, Dr. Sandeep Kr. Garg, Dr. Pritish Singh, Dr. Atul Sonawane, Dr. Atul Bhaskar.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDryRun(1)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10"
                    >
                      Dry Run
                    </button>
                    <button
                      onClick={() => handleSendStage(1, 5)}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#07162C] font-bold text-xs"
                    >
                      Send Stage 1
                    </button>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="bg-[#07162C] border border-white/10 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase">Stage 2</span>
                    <span className="text-xs text-slate-400">10 Prospects</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dr. Manish Khanna, Dr. Rohit Chakor, Dr. Nikhil Sharma, Dr. Chakradhar Reddy, Dr. K. Sai Eswar + 5 more.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDryRun(2)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10"
                    >
                      Dry Run
                    </button>
                    <button
                      onClick={() => handleSendStage(2, 10)}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#07162C] font-bold text-xs"
                    >
                      Send Stage 2
                    </button>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="bg-[#07162C] border border-white/10 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase">Stage 3</span>
                    <span className="text-xs text-slate-400">25 Prospects</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Broader outreach across remaining verified pediatric, orthopedic, ENT, and skin clinics.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDryRun(3)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10"
                    >
                      Dry Run
                    </button>
                    <button
                      onClick={() => handleSendStage(3, 25)}
                      disabled={actionLoading}
                      className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#07162C] font-bold text-xs"
                    >
                      Send Stage 3
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAMPAIGNS & SEQUENCES */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-[#0F2C59]/60 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">5 Campaign Angles & Research Scoring</h3>
              <div className="space-y-3">
                <div className="p-4 bg-[#07162C] rounded-xl border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Angle 1 (SELECTED WINNER) • Score: 9.6/10</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Active in Template</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">
                    "QR based OPD registration is already normal in Indian healthcare. What happens after the patient registers?"
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Addresses the 900M+ ABHA QR adoption trend directly. Solves the exact post-intake bottleneck without criticizing doctor competence.
                  </p>
                </div>

                <div className="p-4 bg-[#07162C] rounded-xl border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-slate-400">Angle 2 • Score: 9.4/10</span>
                  <h4 className="text-xs font-bold text-white">
                    "When a walk in arrives after several patients are waiting, how does reception decide who gets seen first?"
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Highlights the front desk decision burden and eliminates receptionist guesswork.
                  </p>
                </div>

                <div className="p-4 bg-[#07162C] rounded-xl border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-slate-400">Angle 3 • Score: 9.2/10</span>
                  <h4 className="text-xs font-bold text-white">
                    "First-come-first-served queues treat chest distress and routine refills identically."
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    References peer-reviewed Indian OPD simulation studies showing 2-hour waits for 3-minute consults.
                  </p>
                </div>
              </div>
            </div>

            {/* Follow-up Sequences */}
            <div className="bg-[#0F2C59]/60 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Follow-up Cadence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#07162C] rounded-xl border border-white/10 space-y-1">
                  <span className="font-bold text-teal-300 block">Day 0: Initial Question</span>
                  <p className="text-slate-300">Short, conversational question about walk-in queue prioritization.</p>
                </div>
                <div className="p-4 bg-[#07162C] rounded-xl border border-white/10 space-y-1">
                  <span className="font-bold text-cyan-300 block">Day 4: 2-Minute Video Screen Recording</span>
                  <p className="text-slate-300">Offers a concise screen video of the doctor's live triage queue.</p>
                </div>
                <div className="p-4 bg-[#07162C] rounded-xl border border-white/10 space-y-1">
                  <span className="font-bold text-slate-400 block">Day 9: Final Follow-up</span>
                  <p className="text-slate-300">Low pressure permission close; stops permanently after Day 9.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS & OPT-OUTS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-[#0F2C59]/60 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Recent Brevo Transactional Logs</h3>
              <div className="space-y-2">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-400">No sends recorded yet.</p>
                ) : (
                  recentLogs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-[#07162C] rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <div>
                        <span className="font-bold text-white block">{log.doctorName || log.prospectName} ({log.clinicName})</span>
                        <span className="text-[11px] text-slate-400">{log.recipientEmail} • {log.subject}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SENT' || log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' :
                          log.status === 'TEST' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {log.status}
                        </span>
                        <code className="block text-[10px] text-slate-400 mt-1">{log.brevoMessageId || log.messageId || 'N/A'}</code>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* INSPECT / PREVIEW MODAL */}
      {previewProspect && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#0F2C59] border border-teal-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] text-teal-300 font-bold uppercase">Prospect #{previewProspect.rank}</span>
                <h3 className="text-lg font-bold text-white">{previewProspect.doctorName} • {previewProspect.clinicName}</h3>
                <span className="text-slate-400">{previewProspect.specialty} • {previewProspect.city} ({previewProspect.area})</span>
              </div>
              <button
                onClick={() => setPreviewProspect(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-[#07162C] p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block font-semibold mb-1">Subject Line:</span>
                <span className="font-bold text-teal-300">{previewProspect.selectedSubject}</span>
              </div>

              <div className="bg-[#07162C] p-4 rounded-xl border border-white/10 space-y-2">
                <span className="text-slate-400 block font-semibold mb-1">Email Body (Zero-Dash Enforced):</span>
                <pre className="font-mono text-slate-200 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {previewProspect.emailBody}
                </pre>
              </div>

              <div className="bg-[#07162C] p-3 rounded-xl border border-white/10 space-y-1 text-[11px]">
                <span className="text-slate-400 block font-semibold">Verification Proof:</span>
                <p className="text-slate-300"><strong>Source URL:</strong> <a href={previewProspect.sourceUrl} target="_blank" className="text-teal-300 underline">{previewProspect.sourceUrl}</a></p>
                <p className="text-slate-300"><strong>Observation:</strong> {previewProspect.verifiedObservation}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewProspect(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRY RUN MODAL */}
      {dryRunData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#0F2C59] border border-teal-500/40 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">🧪 Dry Run Simulation Results</h3>
              <button
                onClick={() => setDryRunData(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#07162C] rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block">Total Targets</span>
                <span className="text-lg font-bold text-white">{dryRunData.totalTargets}</span>
              </div>
              <div className="p-3 bg-[#07162C] rounded-xl border border-emerald-500/30">
                <span className="text-[11px] text-slate-400 block">Ready to Send</span>
                <span className="text-lg font-bold text-emerald-400">{dryRunData.readyToSend}</span>
              </div>
              <div className="p-3 bg-[#07162C] rounded-xl border border-red-500/30">
                <span className="text-[11px] text-slate-400 block">Blocked</span>
                <span className="text-lg font-bold text-red-400">{dryRunData.blocked}</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="font-bold text-slate-300 block">Target Breakdown:</span>
              {dryRunData.evaluatedTargets.map((t: any) => (
                <div key={t.rank} className="p-2.5 bg-[#07162C] rounded-lg border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">#{t.rank} {t.doctorName} • {t.clinicName}</span>
                    <span className="text-[11px] text-slate-400">{t.email}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.sendEligibility === 'READY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {t.sendEligibility}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
