"use client";

import React, { useState } from "react";
import { Activity, Zap, AlertTriangle, ShieldCheck, HeartPulse, Stethoscope, Sparkles, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface Scenario {
  name: string;
  category: string;
  age: number;
  complaint: string;
  pain: number;
  duration: string;
  vitals: string;
  score: number;
  urgency: "CRITICAL" | "URGENT" | "HIGH" | "STANDARD";
  badgeColor: string;
  textColor: string;
}

export default function InteractiveTriageSimulator() {
  const scenarios: Scenario[] = [
    {
      name: "Chest Discomfort & Breathlessness",
      category: "Cardiac Flag",
      age: 54,
      complaint: "Acute tightness in chest radiating to left arm",
      pain: 9,
      duration: "1 hour ago",
      vitals: "BP 145/95, Pulse 108 bpm",
      score: 9.4,
      urgency: "CRITICAL",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      textColor: "text-red-400"
    },
    {
      name: "Pediatric High Fever (103.5°F)",
      category: "Pediatric Flag",
      age: 2,
      complaint: "High grade fever, lethargic, vomiting twice",
      pain: 8,
      duration: "Since midnight",
      vitals: "Temp 103.5°F, Pulse 125 bpm",
      score: 8.7,
      urgency: "URGENT",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      textColor: "text-amber-300"
    },
    {
      name: "Acute Orthopedic Fall Injury",
      category: "Trauma Flag",
      age: 34,
      complaint: "Fell from stairs, severe ankle swelling, cannot bear weight",
      pain: 8,
      duration: "2 hours ago",
      vitals: "BP 120/80, Normal Vitals",
      score: 7.6,
      urgency: "HIGH",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      textColor: "text-teal-300"
    },
    {
      name: "Routine Follow-up & BP Check",
      category: "Routine OPD",
      age: 48,
      complaint: "Mild headache, regular monthly BP monitoring",
      pain: 2,
      duration: "2 days",
      vitals: "BP 130/85, Normal",
      score: 2.3,
      urgency: "STANDARD",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      textColor: "text-blue-300"
    }
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const current = scenarios[activeIdx];

  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <section className="py-20 bg-[#07162C] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-teal-300">
            <Zap className="w-4 h-4 text-teal-400 fill-teal-400" />
            <span>Interactive Live Feature</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Try the SwasthAI Triage Engine Simulator
          </h2>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Click on different patient clinical scenarios below to see how our AI triage algorithm calculates real-time urgency scores and automatically prioritizes the doctor queue.
          </p>
        </div>

        {/* Interactive Scenario Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((sc, idx) => (
            <button
              key={sc.name}
              onClick={() => setActiveIdx(idx)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeIdx === idx
                  ? "bg-white/15 border-teal-400 text-white shadow-xl scale-[1.02]"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                {sc.category}
              </span>
              <span className="block text-xs sm:text-sm font-bold truncate">{sc.name}</span>
            </button>
          ))}
        </div>

        {/* Live Simulator Card Display */}
        <div className="bg-[#0F2C59] border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Patient Input Summary */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Simulated Patient Profile</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{current.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${current.badgeColor}`}>
                {current.urgency}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-gray-400 block text-[11px]">Patient Age & Category</span>
                <span className="font-bold text-white">{current.age} Years Old ({current.category})</span>
              </div>
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-gray-400 block text-[11px]">Reported Pain Level</span>
                <span className="font-bold text-white">{current.pain} / 10 Scale</span>
              </div>
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-gray-400 block text-[11px]">Symptom Duration</span>
                <span className="font-bold text-white">{current.duration}</span>
              </div>
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-gray-400 block text-[11px]">Recorded Vitals</span>
                <span className="font-bold text-white">{current.vitals}</span>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
              <span className="text-gray-400 block text-[11px]">Chief Medical Complaint</span>
              <p className="text-sm font-semibold text-gray-100 italic">&ldquo;{current.complaint}&rdquo;</p>
            </div>
          </div>

          {/* AI Score Calculation Panel */}
          <div className="lg:col-span-5 bg-[#07162C] p-6 rounded-2xl border border-teal-500/30 space-y-6 text-center">
            
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">SwasthAI Urgency Score</span>
              <div className="text-5xl font-black tracking-tight font-mono text-white flex items-center justify-center gap-1">
                <span>{current.score}</span>
                <span className="text-xl text-gray-400 font-normal">/ 10</span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    current.score > 8 ? "bg-red-500" : current.score > 7 ? "bg-amber-400" : "bg-teal-400"
                  }`}
                  style={{ width: `${current.score * 10}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Standard (0)</span>
                <span>Urgent (5)</span>
                <span>Critical (10)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-gray-300 leading-relaxed">
              Queue position updated automatically. The doctor receives this flag 30 seconds before calling the patient.
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>Schedule Live Demo for Your Clinic</span>
              <ArrowRight className="w-4 h-4" />
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}
