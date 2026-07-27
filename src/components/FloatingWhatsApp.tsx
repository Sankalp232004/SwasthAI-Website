import React from "react";
import { MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function FloatingWhatsApp() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group bg-[#25D366] hover:bg-[#1DA851] text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 whatsapp-pulse"
      title="Book a Demo on WhatsApp (+91 9140721395)"
      aria-label="Book a Demo on WhatsApp"
    >
      <MessageSquare className="w-5 h-5 fill-white shrink-0" />
      <span className="font-bold text-xs sm:text-sm tracking-wide hidden sm:inline">
        Book a Demo
      </span>
    </a>
  );
}
