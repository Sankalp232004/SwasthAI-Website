import React from "react";
import type { Metadata } from "next";
import DemoVideoSection from "@/components/DemoVideoSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { MessageSquare, ShieldCheck, CheckCircle2, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Interactive Demo & Onboarding Walkthrough",
  description: "Schedule a personalized WhatsApp demo for your medical clinic and explore the 5-step onboarding workflow."
};

export default function DemoPage() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  const onboardingSteps = [
    { num: "1", title: "30-Min Discovery Call", text: "We analyze your clinic volume, staff size, and current intake workflow." },
    { num: "2", title: "2-Hour Clinic Configuration", text: "We create your dedicated clinic URL, entrance QR code, and triage rules." },
    { num: "3", title: "45-Min Reception Walkthrough", text: "Your front-desk team learns the simple intake and queue interface." },
    { num: "4", title: "1-Week Live Pilot", text: "Run live OPD sessions with real patients and dedicated WhatsApp technical support." },
    { num: "5", title: "Honest Evaluation", text: "Evaluate pilot performance and wait-time improvements with zero long-term pressure." }
  ];

  return (
    <div className="pt-28 sm:pt-36">
      
      {/* Header */}
      <section className="bg-[#0F2C59] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/15">
            Interactive Product Demo
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            See How SwasthAI Simplifies Your OPD Queue
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Schedule a direct WhatsApp demo with our team or explore our simple 5-step clinic onboarding process.
          </p>

          <div className="pt-4 flex justify-center">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1DA851] text-white px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl transition-all"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>Book a Demo on WhatsApp ({SITE_CONFIG.whatsappNumberText})</span>
            </a>
          </div>
        </div>
      </section>

      <DemoVideoSection />

      {/* Onboarding Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Simple Onboarding
            </h2>
            <p className="text-3xl font-extrabold text-[#0F2C59]">
              What Getting Started Looks Like
            </p>
            <p className="text-sm text-slate-600">
              Low commitment. No IT personnel required. Up and running in hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {onboardingSteps.map((s) => (
              <div key={s.num} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-center md:text-left flex flex-col justify-between">
                <div>
                  <span className="w-8 h-8 rounded-full bg-[#0F2C59] text-white font-extrabold text-xs flex items-center justify-center mb-2 mx-auto md:mx-0">
                    {s.num}
                  </span>
                  <h3 className="text-sm font-bold text-[#0F2C59]">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Start Your 1-Week Pilot on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <FAQSection />
      <CTASection />
    </div>
  );
}
