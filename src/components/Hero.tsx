"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Shield, Clock, CheckCircle2, Activity, ChevronRight, Zap } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function Hero() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0F2C59] overflow-hidden text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-teal-300">
              <Zap className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
              <span>Intelligent OPD Workflow Platform for Indian Clinics</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
              Transform Waiting Room Chaos into <span className="text-teal-400">Prioritized Care</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              SwasthAI automates patient intake, generates clinical urgency scores in 90 seconds, and organizes doctor queues. Urgent cases are identified instantly — without disrupting doctor workflow.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851] text-white px-7 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquare className="w-5 h-5 fill-white" />
                <span>Book a Demo on WhatsApp</span>
              </a>

              <Link
                href="/features"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 backdrop-blur-md transition-all"
              >
                <Activity className="w-4 h-4 text-teal-300" />
                <span>Explore Capabilities</span>
              </Link>
            </div>

            {/* Key Trust Signals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-left border-t border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs text-gray-200 font-medium">90-Sec Patient Intake</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs text-gray-200 font-medium">Zero Doctor Retraining</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs text-gray-200 font-medium">Works Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs text-gray-200 font-medium">No App Download Needed</span>
              </div>
            </div>

          </div>

          {/* Right Column: Realistic Browser Mockup */}
          <div className="lg:col-span-5 relative">
            
            {/* Glass Container Mockup */}
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-white/5 backdrop-blur-xl">
              
              {/* Browser Bar Header */}
              <div className="bg-[#07162C] px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="bg-white/10 rounded-md px-3 py-1 text-[11px] font-mono text-gray-300 flex items-center gap-1.5 truncate max-w-[200px]">
                  <Shield className="w-3 h-3 text-teal-400 shrink-0" />
                  <span className="truncate">swasthai-three.vercel.app</span>
                </div>
                <div className="w-4" />
              </div>

              {/* Screenshot Content */}
              <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                <Image
                  src="/img/screenshots/patient_intake.png"
                  alt="SwasthAI Patient Intake and Triage System"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#07162C]/90 backdrop-blur-md p-3.5 rounded-xl border border-white/15 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-medium">Triage Priority Generated</span>
                    <span className="block text-xs font-bold text-white">Urgency Score: High (8.4/10)</span>
                  </div>
                </div>
                <Link
                  href="/features"
                  className="text-xs text-teal-300 hover:text-white font-semibold flex items-center gap-0.5"
                >
                  <span>See Live</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
