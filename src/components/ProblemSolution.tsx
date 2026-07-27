import React from "react";
import { AlertTriangle, CheckCircle2, Clock, Users, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

export default function ProblemSolution() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">
            The OPD Challenge & Solution
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            Why Traditional OPD Waiting Rooms Fail Doctors and Patients
          </p>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Most Indian private clinics run on first-come, first-served paper registers. That means acute cases wait blindly behind routine checkups.
          </p>
        </div>

        {/* Side by Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Problem Card */}
          <div className="bg-red-50/60 rounded-3xl p-8 border border-red-100 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>The Traditional Clinic Problem</span>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900">
                Paper Registers & First-Come Chaos
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                When registration relies on manual paper ledgers or verbal tokens, receptionists have no way of knowing who needs urgent care.
              </p>

              <ul className="space-y-3.5 pt-2">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                  <span><strong>Blind Priorities:</strong> High fever patients wait behind routine follow-ups without clinical flagging.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                  <span><strong>Consultation Waste:</strong> Doctors spend 2-3 minutes of every visit dictating basic administrative details.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                  <span><strong>Reception Arguments:</strong> Patients constantly approach the front desk demanding queue updates.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                  <span><strong>Connectivity Panic:</strong> Complex cloud systems freeze when local internet drops during peak hours.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-red-200/60 text-xs font-semibold text-red-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span>Result: 42-minute average OPD wait & high patient attrition.</span>
            </div>
          </div>

          {/* Solution Card */}
          <div className="bg-[#0F2C59] text-white rounded-3xl p-8 border border-[#0F2C59] shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>The SwasthAI Solution</span>
              </div>
              
              <h3 className="text-2xl font-bold text-white">
                Intelligent Intake & Triage Prioritization
              </h3>
              
              <p className="text-sm text-slate-200 leading-relaxed">
                SwasthAI introduces a 90-second digital intake flow that surfaces clinical urgency scores automatically before consultation begins.
              </p>

              <ul className="space-y-3.5 pt-2">
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Structured Urgency Scoring:</strong> Triage algorithms flag high-risk complaints so doctors see urgent cases first.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Doctor Context:</strong> Doctors enter consultations knowing age, vitals, and chief complaints in advance.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Transparent Queue Display:</strong> Receptionists show clear live queue status without front-desk conflicts.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong>Offline Resilience:</strong> Local data syncing ensures uninterrupted operations even during power outages.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs font-semibold text-teal-300 flex items-center gap-2 relative z-10">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Result: Organized OPD, zero doctor retraining, higher patient retention.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
