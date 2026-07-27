import React from "react";
import Link from "next/link";
import { MessageSquare, ShieldCheck, Heart, ArrowRight, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function FounderSection() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <section className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F2C59] text-white rounded-3xl p-8 sm:p-12 border border-[#0F2C59] shadow-2xl relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Founder Avatar Card */}
            <div className="lg:col-span-4 text-center lg:text-left space-y-4">
              <div className="relative inline-block">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-teal-500/20 border-2 border-teal-400/40 p-1 shadow-xl mx-auto lg:mx-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl bg-[#07162C] flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl tracking-wider">
                    S
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#25D366] text-white p-2 rounded-xl shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Founder</h3>
                <span className="block text-xs sm:text-sm text-teal-300 font-medium">Founder & CEO, SwasthAI</span>
                <span className="block text-xs text-gray-400">Lucknow, Uttar Pradesh, India</span>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-3 pt-1">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 border border-white/15 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-teal-300" />
                  <span>{SITE_CONFIG.email}</span>
                </a>
              </div>
            </div>

            {/* Founder Story & Message */}
            <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/15">
                <Heart className="w-3.5 h-3.5 fill-teal-300 text-teal-300" />
                <span>Founder Statement</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                &ldquo;Over 70% of India&apos;s outpatient care happens in small clinics. They deserve world-class software.&rdquo;
              </h2>

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                Most digital health platforms focus on mega-hospitals and insurance chains. At SwasthAI, we build specifically for the general practitioner in Kanpur, the pediatrician in Jaipur, and the clinic team managing 60 patients a day without an IT department.
              </p>

              <p className="text-sm text-gray-300 leading-relaxed">
                Our commitment is simple: build software that works offline, requires zero doctor retraining, and treats the receptionist&apos;s time with the same respect as the clinician&apos;s time.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Speak Directly with Founder on WhatsApp ({SITE_CONFIG.whatsappNumberText})</span>
                </a>

                <Link
                  href="/about"
                  className="text-xs sm:text-sm text-teal-300 hover:text-white font-semibold flex items-center gap-1"
                >
                  <span>Read Full Founder Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
