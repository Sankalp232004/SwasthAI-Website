import React from "react";
import Link from "next/link";
import { 
  QrCode, 
  UserCheck, 
  ClipboardList, 
  SlidersHorizontal, 
  Stethoscope, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle2, 
  Building2, 
  Activity,
  Layers,
  Sparkles
} from "lucide-react";

// Visual 1: Hero Illustration (Digital Registration, Patient Arrival, Structured Intake, Queue, Doctor)
export function HeroWorkflowVisual() {
  return (
    <div className="my-10 p-6 sm:p-8 rounded-3xl bg-[#0F2C59] text-white border border-teal-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-widest block">
              CLINICAL FLOW MAP
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-white">
              The Journey From Arrival to Consultation
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            Outpatient Workflow Architecture
          </span>
        </div>

        {/* Five Step Visual Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-400/40 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
              STEP 01
            </span>
            <p className="text-sm font-bold text-white leading-snug">
              Digital Registration
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Patient scans counter QR code to confirm arrival.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-400/40 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
              STEP 02
            </span>
            <p className="text-sm font-bold text-white leading-snug">
              Patient Arrival
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Token issued digitally without manual paper slips.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-400/40 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
              <ClipboardList className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
              STEP 03
            </span>
            <p className="text-sm font-bold text-white leading-snug">
              Structured Intake
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Patient answers guided questions on smartphone.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-400/40 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
              STEP 04
            </span>
            <p className="text-sm font-bold text-white leading-snug">
              Queue Organisation
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Rule based sorting suggests priority category.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 transition-all space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/25 text-emerald-300 flex items-center justify-center font-bold text-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
              STEP 05
            </span>
            <p className="text-sm font-bold text-white leading-snug">
              Doctor Consultation
            </p>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Doctor reviews intake and retains full override control.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 pt-1 text-center sm:text-left">
          Illustration of modern outpatient workflow architecture. The physician maintains final control over all clinical decisions.
        </p>
      </div>
    </div>
  );
}

// Visual 2: Large Data Milestone Section (National Scale: 50 Crore and 25 Crore)
export function NationalMilestoneVisual() {
  return (
    <div className="my-10 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl relative overflow-hidden">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest block">
              NATIONAL HEALTHCARE MILESTONES
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-[#0F2C59]">
              Digital Health Infrastructure Operating at Enormous Scale
            </p>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-blue-100 text-[#0F2C59] text-xs font-bold border border-blue-200">
            Official Data 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 50 Crore Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-teal-50/70 border border-teal-200/80 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-900 text-xs font-bold uppercase tracking-wider">
                eSanjeevani Network
              </span>
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-[#0F2C59] tracking-tight">
                50 CRORE
              </p>
              <p className="text-base font-bold text-teal-950 mt-1">
                Teleconsultations Completed
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Milestone reported by the Ministry of Health and Family Welfare across primary health centres and specialist clinics nationwide.
            </p>
          </div>

          {/* 25 Crore Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/70 border border-blue-200/80 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-950 text-xs font-bold uppercase tracking-wider">
                ABDM Scan and Register
              </span>
              <Building2 className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-[#0F2C59] tracking-tight">
                25 CRORE
              </p>
              <p className="text-base font-bold text-blue-950 mt-1">
                Digital OPD Registrations
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Official milestone released by the National Health Authority across more than 30,000 public and private healthcare facilities.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed text-center sm:text-left">
          These public figures represent nationwide healthcare adoption benchmarks. They confirm that patients readily engage with digital workflows before meeting clinicians.
        </div>
      </div>
    </div>
  );
}

// Visual 3: Core Thesis Diagram (Registration -> Information Gap -> Structured Intake -> Doctor Review)
export function InformationGapVisual() {
  return (
    <div className="my-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F2C59] to-[#07162C] text-white border border-slate-700 shadow-2xl relative overflow-hidden">
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold text-teal-300 uppercase tracking-widest block">
            THE WORKFLOW BOTTLENECK
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-white">
            Closing the Gap Between Registration and Consultation
          </p>
        </div>

        <div className="space-y-3">
          {/* Phase 1 */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-teal-400 text-[#0F2C59] text-[10px] font-black uppercase">
                  SOLVED
                </span>
                <p className="text-base font-bold text-white">
                  Digital Registration
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Patients scan a QR code at clinic entry. Counter registration completed in minutes.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0 mt-1 sm:mt-0" />
          </div>

          {/* Phase 2: The Gap */}
          <div className="p-5 rounded-2xl bg-rose-500/20 border border-rose-400/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-400 text-white text-[10px] font-black uppercase">
                THE UNRESOLVED GAP
              </span>
              <p className="text-base font-bold text-rose-200">
                The Waiting Room Information Void
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              After registration, the digital journey halts. Verbal questions are repeated, paper registers are marked, the queue follows clock arrival blindly, and the doctor starts with zero clinical context.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-[#0F2C59] text-[10px] font-black uppercase">
                  THE SOLUTION
                </span>
                <p className="text-base font-bold text-white">
                  Structured Patient Intake
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Patient answers guided questions in the waiting area. Symptoms and visit reasons are captured cleanly.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0 mt-1 sm:mt-0" />
          </div>

          {/* Phase 4 */}
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-400 text-[#0F2C59] text-[10px] font-black uppercase">
                  THE RESULT
                </span>
                <p className="text-base font-bold text-emerald-200">
                  Doctor Priority Review
                </p>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100">
                The doctor sees a structured priority view before the patient enters, with complete freedom to override.
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-1 sm:mt-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual 4: SwasthAI Workflow Illustration
export function SwasthAIWorkflowVisual() {
  return (
    <div className="my-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest block">
            PRODUCT ARCHITECTURE ILLUSTRATION
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#0F2C59]">
            How SwasthAI Structures Intake in Daily Practice
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
          Doctor Control Model
        </span>
      </div>

      {/* Two Column Mockup Illustration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Patient Form */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Patient Smartphone Screen
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              QR Verified
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">
              Chief Symptom
            </span>
            <p className="font-bold text-slate-900">
              Acute ear pain and high fever
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">
              Symptom Duration
            </span>
            <p className="font-bold text-slate-900">
              Started two days ago
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">
              Current Pain Score
            </span>
            <p className="font-bold text-slate-900">
              Severe discomfort reported
            </p>
          </div>

          <p className="text-[11px] text-slate-500 italic text-center pt-1">
            Intake completed in under ninety seconds without app installation.
          </p>
        </div>

        {/* Right Side: Doctor Review Console */}
        <div className="p-5 rounded-2xl bg-[#0F2C59] text-white border border-teal-500/30 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              Doctor Priority Console
            </span>
            <span className="text-[10px] font-bold text-teal-200 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/30">
              Live Queue
            </span>
          </div>

          {/* Queue Item 1 */}
          <div className="p-3 rounded-xl bg-white/10 border-l-4 border-rose-400 text-xs flex items-center justify-between">
            <div>
              <p className="font-extrabold text-white">Token 104: Acute Ear Pain</p>
              <p className="text-[11px] text-slate-300">Suggested Priority: High Urgency</p>
            </div>
            <span className="px-2 py-1 rounded bg-rose-500/30 text-rose-200 text-[10px] font-bold">
              REVIEW
            </span>
          </div>

          {/* Queue Item 2 */}
          <div className="p-3 rounded-xl bg-white/10 border-l-4 border-blue-400 text-xs flex items-center justify-between">
            <div>
              <p className="font-extrabold text-white">Token 102: Routine Follow Up</p>
              <p className="text-[11px] text-slate-300">Suggested Priority: Standard Order</p>
            </div>
            <span className="px-2 py-1 rounded bg-blue-500/30 text-blue-200 text-[10px] font-bold">
              ACCEPT
            </span>
          </div>

          {/* Queue Item 3 */}
          <div className="p-3 rounded-xl bg-white/10 border-l-4 border-emerald-400 text-xs flex items-center justify-between">
            <div>
              <p className="font-extrabold text-white">Token 103: Medication Renewal</p>
              <p className="text-[11px] text-slate-300">Suggested Priority: Quick Review</p>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
              ACCEPT
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-400/20 text-[11px] text-teal-200 text-center font-medium">
            Doctor override active at all times. Clinical responsibility remains with the physician.
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversion CTA Component (Midpoint and Endpoints)
export function MidArticleCTA() {
  return (
    <div className="my-12 p-7 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-300/80 shadow-lg text-slate-900">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-[11px] font-extrabold text-teal-800 uppercase tracking-widest block">
            SWASTHAI CLINIC WORKFLOW
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-[#0F2C59]">
            Would you like to see how this workflow runs?
          </p>
          <p className="text-sm text-slate-600">
            Experience structured intake and priority queues designed for Indian outpatient practices.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <a
            href="https://swasthai-three.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0F2C59] hover:bg-[#12366A] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>See how SwasthAI works</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="https://wa.me/919140721395?text=Hello%20Sankalp,%20I%20read%20your%20article%20on%20digital%20healthcare%20and%20would%20like%20to%20see%20a%20demo."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Talk to the founder on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
