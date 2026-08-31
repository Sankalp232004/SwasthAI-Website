import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Mail, MapPin, ExternalLink, ShieldCheck, Globe, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function Footer() {
  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <footer className="bg-[#07162C] text-gray-300 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl border border-white/20">
                <Image
                  src="/img/logo-white.png"
                  alt="SwasthAI Logo"
                  width={36}
                  height={36}
                  className="object-contain p-1"
                />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Swasth<span className="text-teal-400">AI</span>
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              India&apos;s intelligent clinic workflow and patient triage platform. Built to eliminate OPD waiting room chaos, prioritize urgent clinical cases, and empower healthcare providers.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-colors"
                title="Book a Demo on WhatsApp"
                aria-label="WhatsApp Demo"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="w-9 h-9 rounded-lg bg-teal-500/20 hover:bg-teal-600 text-teal-400 hover:text-white flex items-center justify-center transition-colors"
                title="Email Support"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>

              <a
                href={SITE_CONFIG.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-blue-500/20 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition-colors"
                title="SwasthAI Website"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-4">Product & Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Features & Capabilities</Link></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Demo & Walkthrough</Link></li>
              <li><a href={SITE_CONFIG.appLinks.doctorLogin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">Doctor Portal <ExternalLink className="w-3 h-3 text-gray-500" /></a></li>
              <li><a href={SITE_CONFIG.appLinks.superadminLogin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">Admin Console <ExternalLink className="w-3 h-3 text-gray-500" /></a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-4">Company & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us & Founder</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog & Case Studies</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/admin/analytics" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">Ops Analytics 🔒</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-4">Reach Us Directly</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5 text-gray-300">
                <Phone className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs text-gray-400">Phone / WhatsApp:</span>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:underline">
                    {SITE_CONFIG.whatsappNumberText}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5 text-gray-300">
                <Mail className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs text-gray-400">Email:</span>
                  <a href={`mailto:${SITE_CONFIG.email}`} className="text-white hover:underline">
                    {SITE_CONFIG.email}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5 text-gray-300">
                <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs text-gray-400">Website:</span>
                  <a href={SITE_CONFIG.url} target="_blank" rel="noopener noreferrer" className="text-white hover:underline truncate block max-w-[170px]">
                    swasthai-three.vercel.app
                  </a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>&copy; 2026 SwasthAI. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-4">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Demo</a>
            <span>•</span>
            <a href={SITE_CONFIG.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Website</a>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
