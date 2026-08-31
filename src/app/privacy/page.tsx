import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for SwasthAI Medical Triage System."
};

export default function PrivacyPage() {
  return (
    <div className="pt-28 sm:pt-36 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-700 leading-relaxed">
        
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59]">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Effective Date: February 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2C59]">1. Information We Collect</h2>
          <p>
            SwasthAI collects information necessary to perform medical intake, calculate triage urgency scores, and facilitate clinic queue management:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Patient Intake Data:</strong> Name, age, gender, phone number, chief symptoms, pain score, and vital signs provided during voluntary intake at clinic premises.</li>
            <li><strong>Clinic Operational Data:</strong> Clinic registration details, queue timestamps, and practitioner preferences.</li>
            <li><strong>Website & Blog Analytics:</strong> Anonymous, first-party visitor interaction metrics (page views, reading time, scroll depth, and demo request clicks) used solely to improve educational content. No patient health information or personal identities are collected or linked to website browsing.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2C59]">2. How We Use Data</h2>
          <p>
            Data collected through SwasthAI is used strictly for:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Calculating clinical urgency scores to assist reception and doctors in patient prioritization.</li>
            <li>Displaying organized OPD queues for the specific clinic attended by the patient.</li>
            <li>Generating end-of-day operational summaries for clinic managers.</li>
          </ul>
          <p className="font-semibold text-slate-900">
            We NEVER sell, rent, or trade patient personal or health information to third-party advertisers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2C59]">3. Data Security & Storage</h2>
          <p>
            SwasthAI employs industry-standard encryption in transit (HTTPS/TLS) and at rest. Data is stored on secure cloud infrastructure with strict access controls adhering to applicable Indian digital health privacy guidelines.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2C59]">4. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy, contact us at: <a href="mailto:swasthai.founder@gmail.com" className="text-teal-700 underline font-semibold">swasthai.founder@gmail.com</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
