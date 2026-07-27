import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for SwasthAI Medical Triage System."
};

export default function TermsPage() {
  return (
    <div className="pt-28 sm:pt-36 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-700 leading-relaxed">
        
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59]">Terms of Service</h1>
          <p className="text-sm text-slate-500">Effective Date: February 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2C59]">1. Platform Purpose & Medical Disclaimer</h2>
          <p>
            SwasthAI is a clinical workflow, intake, and queue prioritization platform designed to assist receptionists and medical practitioners.
          </p>
          <p className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium">
            <strong>Medical Disclaimer:</strong> SwasthAI does NOT provide medical diagnoses, treatment plans, or emergency medical services. Triage urgency scores are decision-support tools only and do NOT replace the clinical judgment of licensed medical professionals.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2C59]">2. Use of Service</h2>
          <p>
            Clinics using SwasthAI agree to maintain accurate practitioner credentials, respect patient data confidentiality, and use the platform in compliance with Indian medical governance standards.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2C59]">3. Intellectual Property</h2>
          <p>
            All software algorithms, user interfaces, branding, and proprietary assets are the exclusive property of SwasthAI.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2C59]">4. Support & Inquiries</h2>
          <p>
            For questions regarding these Terms, reach out to <a href="mailto:swasthai.founder@gmail.com" className="text-teal-700 underline font-semibold">swasthai.founder@gmail.com</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
