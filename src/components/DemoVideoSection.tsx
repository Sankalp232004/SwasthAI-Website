import React from "react";
import Image from "next/image";
import { MessageSquare, Shield, CheckCircle2, Activity, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function DemoVideoSection() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <section className="py-20 bg-[#0F2C59] text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -ml-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 -mr-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/15">
            <Activity className="w-3.5 h-3.5 text-teal-300" />
            <span>Interactive Product Walkthrough</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            See How SwasthAI Streamlines OPD Patient Triage
          </h2>

          <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
            Our intelligent triage platform handles patient intake, calculates clinical urgency scores, and organizes doctor queues seamlessly.
          </p>
        </div>

        {/* Product Showcase Container */}
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#07162C]">
          
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual Screenshot Mockup */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative aspect-[16/10] bg-slate-900">
                <Image
                  src="/img/screenshots/doctor_portal.png"
                  alt="SwasthAI Doctor Portal Queue"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Doctor Queue Dashboard</span>
                <h3 className="text-2xl font-bold text-white">Priority-Sorted Patient Queue</h3>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-gray-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Urgency Flags:</strong> Urgent cases flagged automatically with chief complaint summaries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Doctor Friction:</strong> Doctor opens each consultation 30 seconds more informed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Offline Resilience:</strong> Works uninterrupted during local power cuts or signal drops.</span>
                </li>
              </ul>

              <div className="pt-2">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Schedule Live Demo ({SITE_CONFIG.whatsappNumberText})</span>
                </a>
              </div>
            </div>

          </div>

          {/* Action Bar below container */}
          <div className="p-6 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="block text-sm font-bold text-white">Interested in trying this for your clinic?</span>
              <span className="block text-xs text-gray-400">Schedule a 15-minute walkthrough or try our low-friction 1-week pilot.</span>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all shrink-0"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Book a Demo on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
