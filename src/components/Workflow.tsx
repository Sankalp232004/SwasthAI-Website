import React from "react";
import { QrCode, Activity, ListOrdered, Stethoscope, ArrowRight } from "lucide-react";

export default function Workflow() {
  const steps = [
    {
      num: "01",
      icon: QrCode,
      title: "Patient Intake in 90 Seconds",
      description: "Patients scan a QR code at the entrance or complete a guided web form on their mobile device. No mobile app download required.",
      tag: "Zero App Download"
    },
    {
      num: "02",
      icon: Activity,
      title: "Urgency Score Generation",
      description: "The triage engine analyzes chief complaints, age, pain scale, and vitals to generate a structured clinical urgency score (1-10 scale).",
      tag: "Clinical Intelligence"
    },
    {
      num: "03",
      icon: ListOrdered,
      title: "Real-Time Queue Sorting",
      description: "Patients appear on the reception & doctor queue screen, sorted by clinical priority. Receptionists manage the waiting room effortlessly.",
      tag: "Transparent OPD"
    },
    {
      num: "04",
      icon: Stethoscope,
      title: "Informed Consultation",
      description: "The doctor opens the consultation with pre-populated patient symptoms and vitals, saving 2-3 minutes per patient interaction.",
      tag: "Maximized Care"
    }
  ];

  return (
    <section className="py-20 bg-[#F8FAFC] border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">
            How It Works
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            Four Steps to a Seamless Clinic Workflow
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Designed for instant adoption — no staff training required, no change to doctor consultation style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#0F2C59]/20 font-mono group-hover:text-teal-700 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                      {step.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-white flex items-center justify-center shadow-md group-hover:bg-teal-700 transition-colors">
                    <Icon className="w-6 h-6 text-teal-400 group-hover:text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-[#0F2C59]">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform">
                  <span>Step {idx + 1} Overview</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
