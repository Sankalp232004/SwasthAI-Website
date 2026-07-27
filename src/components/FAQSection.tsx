"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does SwasthAI require patients or staff to download an app?",
      a: "No. SwasthAI runs completely on standard web browsers (Chrome, Safari, Edge). Patients scan a QR code at your entrance or open a short link on their smartphone. Receptionists and doctors open their queue portal on any tablet, laptop, or desktop computer."
    },
    {
      q: "Will this change how our doctors examine or consult patients?",
      a: "Not at all. SwasthAI does not interfere with the doctor's clinical process or prescribe treatments. It simply surfaces a 30-second patient summary (vitals, chief complaints, urgency score) right before the consultation begins so doctors enter every consultation informed."
    },
    {
      q: "What happens if local internet fails or power cuts occur during an OPD?",
      a: "SwasthAI is built offline-first. Patient intake, triage calculations, and local queue management continue to operate without an active internet connection. All intake data synchronizes quietly with the cloud once network connectivity is restored."
    },
    {
      q: "How long does onboarding and staff training take?",
      a: "A new clinic instance can be configured in 2 hours. Front-desk staff can be trained in less than 45 minutes because the interface is designed specifically for high-volume, low-friction reception use."
    },
    {
      q: "Can SwasthAI accommodate different medical specialties?",
      a: "Yes. We provide specialized triage algorithms for General Practice, Pediatrics (parent-guided forms with infant urgency flags), and Orthopedics (weighted for trauma, weight-bearing ability, and acute vs. chronic onset)."
    },
    {
      q: "Can we pilot SwasthAI at our clinic before making a commitment?",
      a: "Absolutely. We offer a low-friction 1-week live pilot for interested clinics with full setup support and direct WhatsApp access to our engineering team."
    }
  ];

  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">
            Got Questions?
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            Frequently Asked Questions
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Everything you need to know about implementing SwasthAI in your practice.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-[#0F2C59] text-base hover:text-teal-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-teal-600 shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-teal-600" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3">
          <p className="text-sm font-bold text-[#0F2C59]">
            Have a specific question about your clinic setup?
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Ask Us Directly on WhatsApp (+91 9140721395)</span>
          </a>
        </div>

      </div>
    </section>
  );
}
