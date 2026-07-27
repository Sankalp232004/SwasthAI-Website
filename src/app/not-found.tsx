import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft, MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function NotFound() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-20 flex items-center justify-center bg-slate-50">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        
        {/* Brand Logo */}
        <div className="w-16 h-16 rounded-2xl bg-[#0F2C59] p-2 mx-auto flex items-center justify-center shadow-lg">
          <Image
            src="/img/logo-white.png"
            alt="SwasthAI Logo"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          Error 404 • Page Not Found
        </div>

        <h1 className="text-3xl font-extrabold text-[#0F2C59] tracking-tight">
          Looking for Something Else?
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed">
          The page you requested could not be found or may have been moved. You can return to our homepage or get in touch with our team.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto bg-[#0F2C59] hover:bg-[#07162C] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Book a Demo</span>
          </a>
        </div>

      </div>
    </div>
  );
}
