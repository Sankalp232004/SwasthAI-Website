import React from "react";
import { Activity, QrCode, WifiOff, Stethoscope, BarChart3, ShieldCheck, HeartPulse, Clock, Sparkles } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      icon: Activity,
      title: "Intelligent Triage Engine",
      description: "Generates structured clinical urgency scores based on symptoms, vitals, pain level, and age. Flags high-risk patients automatically."
    },
    {
      icon: QrCode,
      title: "90-Second Patient Intake",
      description: "Patients complete a mobile form via QR code scan at entrance or link. No app download or account creation required."
    },
    {
      icon: WifiOff,
      title: "Offline-Resilient Operations",
      description: "Operates seamlessly during local power outages and network drops. Local data syncs quietly when connectivity is restored."
    },
    {
      icon: Stethoscope,
      title: "Zero Doctor Retraining",
      description: "Requires no alteration to how doctors examine or consult. Surfaces 30-second patient context right before consultation begins."
    },
    {
      icon: HeartPulse,
      title: "Specialty-Tailored Logic",
      description: "Includes dedicated intake pathways for General Practice, Pediatrics (parent-focused), and Orthopedic clinics (injury/weight-bearing weighted)."
    },
    {
      icon: BarChart3,
      title: "End-of-Day OPD Insights",
      description: "Provides practice managers with 5-metric daily summaries: total patient count, average wait time, peak hours, and chief complaints."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">
            Platform Capabilities
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            Built Specifically for Indian Primary Care & OPD Clinics
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Every feature is designed around real clinical constraints — fast throughput, low friction, and immediate trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/60 text-[#008080] flex items-center justify-center group-hover:bg-[#0F2C59] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-[#0F2C59] group-hover:text-teal-700 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
