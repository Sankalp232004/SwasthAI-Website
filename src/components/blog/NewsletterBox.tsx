"use client";

import React, { useState } from "react";
import { Mail, Check, ArrowRight } from "lucide-react";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="my-12 p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden text-center sm:text-left">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        <div className="lg:col-span-7 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/10">
            <Mail className="w-3.5 h-3.5 text-teal-400" />
            <span>Clinic Workflow Digest</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Practical Insights for Clinic Owners & GPs
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Get early access to OPD management guides, triage case studies, and healthcare workflow strategies. No spam, ever.
          </p>
        </div>

        <div className="lg:col-span-5">
          {subscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center gap-2 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Thank you! You are subscribed to our updates.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your clinic email..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                100% free • Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
