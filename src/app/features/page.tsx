import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import FeaturesGrid from "@/components/FeaturesGrid";
import ScreenshotsSection from "@/components/ScreenshotsSection";
import CTASection from "@/components/CTASection";
import { QrCode, Activity, ListOrdered, WifiOff, Stethoscope, BarChart3, CheckCircle2, MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Features & Capabilities",
  description: "Explore SwasthAI's comprehensive feature suite: 90-second digital patient intake, intelligent urgency scoring, offline-first sync, and specialty triage logic."
};

export default function FeaturesPage() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  const deepFeatures = [
    {
      id: "intake",
      title: "Digital Patient Intake (QR Code & Link)",
      icon: QrCode,
      tagline: "90 seconds per patient. Zero app download required.",
      points: [
        "Entrance QR code scanning allows patients to fill out intake forms on their own phone while waiting.",
        "Receptionist input fallback for elderly patients or acute distress.",
        "Captures chief complaints, symptom duration, pain scale (1-10), and vital signs.",
        "Multilingual support in English and Hindi for maximum accessibility."
      ]
    },
    {
      id: "triage",
      title: "Clinical Urgency & Triage Engine",
      icon: Activity,
      tagline: "Structured priority scoring tailored to medical specialties.",
      points: [
        "Calculates urgency score (1-10) using clinical decision algorithms.",
        "General Medicine: Flags fever duration, chest discomfort, and vitals.",
        "Pediatrics: Parent-guided form with automatic infant (<12m) risk escalation.",
        "Orthopedics: Weights trauma, acute onset, and weight-bearing ability over general pain."
      ]
    },
    {
      id: "queue",
      title: "Smart Queue & Reception Display",
      icon: ListOrdered,
      tagline: "Transparent waiting room status with zero front-desk arguments.",
      points: [
        "Displays real-time patient queue sorted by urgency score.",
        "Provides receptionists with a clear visual order without manual guesswork.",
        "Allows single-click patient call status updates.",
        "Prevents patient dissatisfaction by establishing transparent clinical priority."
      ]
    },
    {
      id: "offline",
      title: "Offline-First Sync Architecture",
      icon: WifiOff,
      tagline: "Healthcare software that never freezes when network drops.",
      points: [
        "Local database storage ensures uninterrupted OPD operation during power cuts or 4G volatility.",
        "Background cloud synchronization when network connectivity restores.",
        "Zero data loss guarantee across reception and doctor portals.",
        "Tested in real-world Tier 2 and Tier 3 city clinic infrastructure."
      ]
    }
  ];

  return (
    <div className="pt-28 sm:pt-36">
      
      {/* Page Header */}
      <section className="bg-[#0F2C59] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/15">
            Complete Feature Breakdown
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Engineered for High-Volume Clinic Operations
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Discover how every module of SwasthAI works together to streamline patient intake, prioritize care, and eliminate waiting room friction.
          </p>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {deepFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            const isEven = idx % 2 === 0;
            return (
              <div
                key={feat.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                <div className={`lg:col-span-6 space-y-5 ${isEven ? "" : "lg:order-2"}`}>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#008080] border border-teal-200/60 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59]">
                    {feat.title}
                  </h2>
                  <p className="text-sm font-semibold text-teal-700">
                    {feat.tagline}
                  </p>
                  <ul className="space-y-3 pt-2">
                    {feat.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`lg:col-span-6 ${isEven ? "" : "lg:order-1"}`}>
                  <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 shadow-lg">
                    <div className="aspect-[4/3] rounded-2xl bg-[#07162C] p-6 text-white flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{feat.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">Live Module</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-200 italic leading-relaxed">
                        &ldquo;{feat.tagline}&rdquo;
                      </p>
                      <div className="pt-2 flex justify-end">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal-300 hover:text-white font-bold inline-flex items-center gap-1"
                        >
                          <span>Request Live Demo</span>
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ScreenshotsSection />
      <CTASection />
    </div>
  );
}
