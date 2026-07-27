import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FounderSection from "@/components/FounderSection";
import CTASection from "@/components/CTASection";
import { ShieldCheck, Heart, Target, Users, MapPin, Mail, MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us & Founder Story",
  description: "Learn about SwasthAI's mission, founder Sankalp Mishra, and our commitment to modernizing OPD clinic workflows across India."
};

export default function AboutPage() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  const values = [
    {
      icon: Target,
      title: "Focus on Primary Care",
      desc: "Over 70% of Indian outpatient consultations happen in private clinics. We build specifically for these frontline practices."
    },
    {
      icon: ShieldCheck,
      title: "Real-World Reliability",
      desc: "Our offline-first architecture ensures your intake and queue system never freezes during power outages or signal drops."
    },
    {
      icon: Users,
      title: "Empathy for Staff",
      desc: "We design for the receptionist on a busy Monday morning. If a tool takes more than 5 seconds to operate, it gets simplified."
    }
  ];

  return (
    <div className="pt-28 sm:pt-36">
      
      {/* Header */}
      <section className="bg-[#0F2C59] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/15">
            About SwasthAI
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Building Trusted Clinic Workflow Technology for India
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            We are dedicated to eliminating waiting room chaos and giving healthcare providers intelligent triage tools that just work.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="space-y-6 text-slate-700 leading-relaxed text-base sm:text-lg">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
              The SwasthAI Story
            </h2>

            <p>
              SwasthAI was born out of direct observation in outpatient clinics across Uttar Pradesh. While large hospital networks had access to multi-crore Electronic Health Record (EHR) suites, general practitioners, pediatricians, and orthopedic clinics were left running their practices on paper registers or manual WhatsApp queues.
            </p>

            <p>
              The fundamental flaw was clear: <strong>first-come, first-served registration fails when patients have varying clinical urgencies.</strong> A child with 104° fever would wait behind routine checkups simply because they arrived 10 minutes later.
            </p>

            <p>
              We built SwasthAI to solve the intake window — creating a 90-second digital workflow that surfaces clinical urgency scores before consultation begins, without disrupting how the doctor examines or diagnoses.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F2C59]">{v.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <FounderSection />
      <CTASection />
    </div>
  );
}
