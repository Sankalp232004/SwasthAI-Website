"use client";

import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check, MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const articleUrl = `${SITE_CONFIG.url}/blog/${slug}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(articleUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}: ${articleUrl}`)}`,
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" />
        <span>Share:</span>
      </span>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        title="Share on X / Twitter"
      >
        <span>X / Twitter</span>
      </a>

      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1DA851] text-xs font-semibold flex items-center gap-1.5 transition-colors"
        title="Share on WhatsApp"
      >
        <MessageSquare className="w-3.5 h-3.5 fill-[#1DA851]" />
        <span>WhatsApp</span>
      </a>

      <button
        onClick={handleCopy}
        className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-teal-200/60 cursor-pointer"
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-bold">Link Copied!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
