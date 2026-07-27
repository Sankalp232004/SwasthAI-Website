"use client";

import React, { useState } from "react";
import { Clock, Users, TrendingUp, Sparkles, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function InteractiveRoiCalculator() {
  const [patientsPerDay, setPatientsPerDay] = useState(60);

  // Calculations
  const timeSavedPerPatientMinutes = 2.5; // intake time saved per consultation
  const totalMinutesSavedDaily = Math.round(patientsPerDay * timeSavedPerPatientMinutes);
  const totalHoursSavedMonthly = Math.round((totalMinutesSavedDaily * 26) / 60); // 26 working days
  const averageWaitBefore = 42; // minutes
  const averageWaitAfter = 12; // minutes
  const retentionBoostPercent = Math.min(45, Math.round(15 + patientsPerDay * 0.25));

  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <section className="py-20 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive OPD ROI Calculator</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            Calculate Time Saved & Capacity Boost for Your Clinic
          </h2>

          <p className="text-base text-slate-600 leading-relaxed">
            Move the slider to match your clinic&apos;s daily OPD volume and see instant operational savings.
          </p>
        </div>

        {/* Calculator Widget */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Slider Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-[#0F2C59]">
                  Daily Patient Volume (OPD count):
                </label>
                <span className="text-2xl font-black text-teal-700 font-mono">
                  {patientsPerDay} Patients / Day
                </span>
              </div>

              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={patientsPerDay}
                onChange={(e) => setPatientsPerDay(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#008080]"
              />

              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Small Clinic (20)</span>
                <span>Medium OPD (60)</span>
                <span>High Volume (150+)</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Intake Time Saved Per Patient:</span>
                <span className="font-bold text-[#0F2C59]">2.5 Minutes</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Average Patient Waiting Time:</span>
                <span className="font-bold text-emerald-700">Reduced from 42m → 12m</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Staff Reception Workload:</span>
                <span className="font-bold text-teal-700">Reduced by 60%</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-6 bg-[#0F2C59] text-white p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
              Estimated Monthly Impact
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-xl border border-white/15 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-teal-300 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Doctor Hours Saved</span>
                </div>
                <div className="text-3xl font-black font-mono text-white">
                  {totalHoursSavedMonthly} hrs / mo
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-xl border border-white/15 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-teal-300 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>Retention Increase</span>
                </div>
                <div className="text-3xl font-black font-mono text-emerald-400">
                  +{retentionBoostPercent}%
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-gray-300 leading-relaxed">
              By collecting intake data in 90 seconds, your clinic gains capacity for <strong className="text-white">+{Math.round(patientsPerDay * 0.15)} additional consultations daily</strong> without lengthening OPD hours.
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Book Demo to Benchmark Your Clinic</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
