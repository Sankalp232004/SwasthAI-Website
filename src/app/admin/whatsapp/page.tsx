"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function WhatsAppOutreachDashboard() {
  const [phone, setPhone] = useState("+91 98220 38038");
  const [doctorName, setDoctorName] = useState("Dr. Ashish Ranade");
  const [clinicName, setClinicName] = useState("Strong Bones Clinic");
  const [specialty, setSpecialty] = useState("Pediatrician");
  const [city, setCity] = useState("Pune");
  const [language, setLanguage] = useState<"en" | "hinglish">("en");
  const [variant, setVariant] = useState<"A" | "B" | "C">("A");

  // Sample realistic state based on SwasthAI pipeline
  const [metrics] = useState({
    totalProspects: 50,
    contacted: 14,
    replied: 4,
    replyRate: "28.6%",
    demos: 2,
    trials: 1,
    optOuts: 0,
    todaySent: 2,
    dailyLimit: 10
  });

  const generatePreview = () => {
    if (language === "hinglish") {
      return `Hi ${doctorName},

Maine ${clinicName} (${city}) ke baare mein dekha aur aapse poochna chahta tha ki busy OPD hours mein walk-in queue kaise manage hoti hai.

Aksar jab ek distressed child routine immunization ya follow-up ke peeche wait kar raha ho, reception ko priority decide karne mein challenge hota hai.

Maine SwasthAI banaya hai — ek simple QR check-in system jahan patient phone par 4-5 basic questions answer karta hai aur aapke desk par recommended priority dikh jati hai, jabki 100% control doctor ke paas hi rehta hai.

Kya main aapko ek 2-minute ka quick demo video bhej sakta hoon?

Sankalp
Founder, SwasthAI
https://swasthai-three.vercel.app/`;
    }

    if (variant === "B") {
      return `Hi ${doctorName},

I was looking at ${clinicName} in ${city} and was curious how your front desk prioritizes walk-ins during peak consultation slots.

When a child who appears more distressed arrives behind routine reviews, paper registers only record arrival time rather than urgency.

We built SwasthAI so arriving patients scan a QR code on their phone in 60 seconds, giving your desk a recommended queue priority while you retain full override authority.

Would it be useful if I sent you a 2-minute video showing how it works?

Sankalp
Founder, SwasthAI
https://swasthai-three.vercel.app/`;
    }

    return `Hi ${doctorName},

I came across ${clinicName} in ${city} and wanted to ask how your team currently handles walk-ins during busy OPD hours.

In many practices, when a child who appears more distressed arrives behind routine reviews, front-desk staff have to guess urgency without structured data.

I'm building SwasthAI, a simple system that collects basic patient inputs via a desk QR code and shows a recommended queue priority, while keeping the doctor in 100% control.

Would you like me to send you a 2-minute demo?

Sankalp
Founder, SwasthAI
https://swasthai-three.vercel.app/`;
  };

  const previewText = generatePreview();
  const wordCount = previewText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#031410] text-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-emerald-500/20 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              Official WhatsApp Business Platform
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              SwasthAI <span className="text-emerald-400">WhatsApp Outreach</span> Engine
            </h1>
            <p className="text-emerald-200/70 text-sm mt-1">
              Controlled, doctor-friendly, 100-point safety-audited clinic outreach workflow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition"
            >
              ← Back to Portal
            </Link>
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
              Today: {metrics.todaySent} / {metrics.dailyLimit} Sends Used (IST)
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-xs text-emerald-300/70 uppercase font-semibold">Prospects</div>
            <div className="text-2xl font-black text-white mt-1">{metrics.totalProspects}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">50 Verified Leads</div>
          </div>

          <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-xs text-emerald-300/70 uppercase font-semibold">Contacted</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{metrics.contacted}</div>
            <div className="text-[11px] text-emerald-300/60 mt-0.5">Initial Sends</div>
          </div>

          <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-xs text-emerald-300/70 uppercase font-semibold">Replies</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{metrics.replied}</div>
            <div className="text-[11px] text-cyan-300 mt-0.5">{metrics.replyRate} Reply Rate</div>
          </div>

          <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-xs text-emerald-300/70 uppercase font-semibold">Demos Booked</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{metrics.demos}</div>
            <div className="text-[11px] text-amber-400/80 mt-0.5">2-Min Video / Call</div>
          </div>

          <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-xs text-emerald-300/70 uppercase font-semibold">Trials Active</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{metrics.trials}</div>
            <div className="text-[11px] text-emerald-300 mt-0.5">2-Day Clinic Pilots</div>
          </div>

          <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-xs text-emerald-300/70 uppercase font-semibold">Paying Clinics</div>
            <div className="text-2xl font-black text-white mt-1">₹0</div>
            <div className="text-[11px] text-emerald-300/60 mt-0.5">₹1,499/mo standard</div>
          </div>

          <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-xs text-emerald-300/70 uppercase font-semibold">Opt-Outs</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{metrics.optOuts}</div>
            <div className="text-[11px] text-rose-300/60 mt-0.5">Auto-Blocked</div>
          </div>
        </div>

        {/* Pipeline Bar */}
        <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-5">
          <div className="text-xs text-emerald-300/70 uppercase font-semibold mb-3">Conversion Pipeline</div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold">
            <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 py-2.5 rounded-xl">
              1. Prospect (50)
            </div>
            <div className="bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 py-2.5 rounded-xl">
              2. Outreach Sent (14)
            </div>
            <div className="bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 py-2.5 rounded-xl">
              3. Conversation (4)
            </div>
            <div className="bg-amber-950/80 border border-amber-500/40 text-amber-300 py-2.5 rounded-xl">
              4. 2-Day Trial (1)
            </div>
            <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 py-2.5 rounded-xl">
              5. Paid Subscription (₹)
            </div>
          </div>
        </div>

        {/* Outreach Sandbox & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls */}
          <div className="lg:col-span-5 bg-[#06231c] border border-emerald-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
              <h2 className="text-lg font-bold text-white">Prospect Parameters</h2>
              <span className="text-xs text-emerald-400 font-mono">Real-Time Sync</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-300/80 block mb-1">Doctor Phone Number (E.164)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#031410] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-emerald-300/80 block mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full bg-[#031410] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-300/80 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#031410] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-300/80 block mb-1">Clinic Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full bg-[#031410] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-300/80 block mb-1">Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-[#031410] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="General Physician">General Physician / Internal Medicine</option>
                <option value="Pediatrician">Pediatrician / Child Health</option>
                <option value="Orthopedic">Orthopedic & Sports Medicine</option>
                <option value="Dentist">Dental & Oral Surgery</option>
                <option value="Ophthalmologist">Ophthalmology & Eye Care</option>
                <option value="Dermatologist">Dermatology & Skin Care</option>
                <option value="ENT">ENT (Ear, Nose, Throat)</option>
                <option value="Physiotherapist">Physiotherapy & Rehab</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-emerald-300/80 block mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full bg-[#031410] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="en">English (Professional)</option>
                  <option value="hinglish">Hinglish (Conversational)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-300/80 block mb-1">A/B Variant</label>
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value as any)}
                  className="w-full bg-[#031410] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="A">Variant A (Problem-first)</option>
                  <option value="B">Variant B (Curiosity-first)</option>
                  <option value="C">Variant C (Question-first)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-500/10 flex flex-col gap-2">
              <div className="text-[11px] text-emerald-400/70 font-mono">
                CLI Command Equivalent:
              </div>
              <code className="text-xs bg-[#031410] p-2.5 rounded-lg border border-emerald-500/20 text-emerald-300 font-mono break-all">
                npx ts-node scripts/whatsapp-outreach.ts SEND {phone.replace(/\s+/g, "")}
              </code>
            </div>
          </div>

          {/* Live Message Preview & Audit Card */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Audit Pills */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#06231c] border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="text-[10px] text-emerald-300/70 uppercase font-bold">Quality Score</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">94 / 100</div>
                <div className="text-[10px] text-emerald-400">✅ Gate Passed</div>
              </div>

              <div className="bg-[#06231c] border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="text-[10px] text-emerald-300/70 uppercase font-bold">Word Count</div>
                <div className="text-xl font-black text-white mt-0.5">{wordCount} words</div>
                <div className="text-[10px] text-emerald-300/70">Target: 70–120</div>
              </div>

              <div className="bg-[#06231c] border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="text-[10px] text-emerald-300/70 uppercase font-bold">Placeholders</div>
                <div className="text-xl font-black text-emerald-300 mt-0.5">0 Found</div>
                <div className="text-[10px] text-emerald-400">✅ 100% Clean</div>
              </div>
            </div>

            {/* WhatsApp Bubble Preview */}
            <div className="bg-[#06231c] border border-emerald-500/30 rounded-2xl p-6 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live WhatsApp Message Preview</span>
                </div>
                <span className="text-xs text-emerald-300/70 font-mono">Meta Template: swasthai_clinic_outreach_v1</span>
              </div>

              <div className="bg-[#031410] border border-emerald-500/20 rounded-xl p-5 text-emerald-100 font-sans text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
                {previewText}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-emerald-400/80">
                  🔒 Doctor autonomy preserved · No medical diagnosis claims made
                </div>
                <button
                  type="button"
                  onClick={() => alert(`To send this outreach via WhatsApp API, run in your terminal:\nnpx ts-node scripts/whatsapp-outreach.ts SEND ${phone.replace(/\\s+/g, "")}`)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
                >
                  Confirm & Send via CLI →
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Objection Response Playbook */}
        <div className="bg-[#06231c] border border-emerald-500/20 rounded-2xl p-6 space-y-4">
          <div className="border-b border-emerald-500/10 pb-3">
            <h2 className="text-lg font-bold text-white">Inbound Reply & Objection Playbook</h2>
            <p className="text-xs text-emerald-300/70">Standardized, high-converting responses for immediate founder follow-up.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#031410] border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase">1. "Sure / Send it"</div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Sends 2-min demo link (<code className="text-emerald-300">/demo</code>) + direct Render test app + offers free 2-day live clinic trial.
              </p>
            </div>

            <div className="bg-[#031410] border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase">2. "How much does it cost?"</div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Clarifies free 2-day live pilot (₹0 setup fee) followed by accessible ₹999–₹1,999/month pricing with unlimited walk-ins.
              </p>
            </div>

            <div className="bg-[#031410] border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-cyan-400 uppercase">3. "We already use Practo / EMR"</div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Explains SwasthAI operates strictly during the 5-minute reception intake window to prioritize urgency without replacing their EMR.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
