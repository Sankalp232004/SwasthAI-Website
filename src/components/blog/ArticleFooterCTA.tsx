import React from "react";
import { MessageSquare, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function ArticleFooterCTA() {
  const demoUrl = "https://swasthai-three.vercel.app/";

  return (
    <div className="my-12 p-8 sm:p-10 rounded-3xl bg-[#0F2C59] text-white border border-teal-500/30 shadow-2xl relative overflow-hidden text-center sm:text-left">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold text-teal-300 uppercase tracking-widest block">
            SwasthAI Clinic Platform
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            Want to see how this works in practice?
          </p>
          <p className="text-sm text-gray-300">
            Book a 15-minute SwasthAI demo for your clinic today.
          </p>
        </div>

        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#1DA851] text-white px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 shrink-0"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span>Book a 15-minute SwasthAI demo</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
