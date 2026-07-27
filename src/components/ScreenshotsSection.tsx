"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Monitor, Smartphone, Shield, CheckCircle2, ChevronRight } from "lucide-react";

export default function ScreenshotsSection() {
  const [activeTab, setActiveTab] = useState(0);

  const screens = [
    {
      title: "Patient Digital Intake",
      category: "Patient Portal",
      image: "/img/screenshots/patient_intake.png",
      description: "Patients complete a clean 90-second form on any smartphone browser. Collects symptoms, duration, pain score, and vitals smoothly.",
      features: ["No app download required", "Multilingual support (English/Hindi)", "Built-in symptom duration & pain scale"]
    },
    {
      title: "Landing & Clinic Portal",
      category: "Clinic Page",
      image: "/img/screenshots/hero_overview.png",
      description: "Custom branded landing page for every clinic. Patients can easily discover nearby clinics, scan QR codes, or access walk-in registration.",
      features: ["Custom clinic slug & QR code", "Prominent WhatsApp demo link", "Clean branded color palette"]
    },
    {
      title: "Doctor Login & Dashboard",
      category: "Doctor Portal",
      image: "/img/screenshots/doctor_portal.png",
      description: "Secure login for doctors and clinicians. Queue screen displays incoming patients sorted by urgency score with chief complaints.",
      features: ["Instant urgency score visibility", "One-click patient queue status", "Zero disruption to consultation flow"]
    },
    {
      title: "Support & Contact Integration",
      category: "Contact Modal",
      image: "/img/screenshots/contact_modal.png",
      description: "Integrated contact modal with pre-filled WhatsApp demo booking, direct phone contact, email, location, and Medium blog updates.",
      features: ["Direct WhatsApp link with pre-filled text", "Verified support email", "Location & company links"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">
            Product Screenshots
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            Designed for Simplicity in Real Clinical Settings
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Explore actual interfaces from the SwasthAI application. No cluttered navigation, no hidden menus.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 gap-1 sm:gap-2">
            {screens.map((screen, idx) => (
              <button
                key={screen.title}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === idx
                    ? "bg-[#0F2C59] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {screen.category}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/80 rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          
          {/* Screenshot Description */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
              {screens[activeTab].category}
            </span>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#0F2C59]">
              {screens[activeTab].title}
            </h3>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {screens[activeTab].description}
            </p>

            <div className="space-y-3 pt-2">
              {screens[activeTab].features.map((feat) => (
                <div key={feat} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Browser Mockup */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-2xl bg-white">
              {/* Browser Bar */}
              <div className="bg-[#07162C] px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="bg-white/10 rounded-md px-3 py-1 text-[11px] font-mono text-gray-300 flex items-center gap-1.5 truncate">
                  <Shield className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>swasthai-2tv5.onrender.com</span>
                </div>
                <div className="w-4" />
              </div>

              {/* Image Container */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <Image
                  src={screens[activeTab].image}
                  alt={screens[activeTab].title}
                  fill
                  className="object-cover object-top transition-opacity duration-300"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
