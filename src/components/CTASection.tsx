import React from "react";
import Link from "next/link";
import { MessageSquare, Activity, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function CTASection() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <section className="py-20 bg-[#07162C] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-teal-300">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>No Risk • 1-Week Live Pilot Available</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Ready to Modernize Your Clinic&apos;s Patient Intake & Queue?
        </h2>

        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Join doctors and practice managers across India who have eliminated OPD waiting room chaos with SwasthAI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-2xl hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <MessageSquare className="w-5 h-5 fill-white" />
            <span>Book a Demo on WhatsApp ({SITE_CONFIG.whatsappNumberText})</span>
          </a>

          <Link
            href="/features"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-4 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 backdrop-blur-md transition-all"
          >
            <Activity className="w-4 h-4 text-teal-300" />
            <span>Explore Platform Features</span>
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-4">
          Need custom clinic onboarding? Reach us at <a href={`mailto:${SITE_CONFIG.email}`} className="text-teal-300 underline">{SITE_CONFIG.email}</a>
        </p>

      </div>
    </section>
  );
}
