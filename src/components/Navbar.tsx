"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MessageSquare, ShieldCheck, Menu, X, ArrowUpRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Demo", href: "/demo" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0F2C59]/95 backdrop-blur-md shadow-lg py-3 border-b border-white/10" : "bg-[#0F2C59] py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/10 rounded-xl border border-white/20 overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/img/logo-white.png"
                alt="SwasthAI Logo"
                width={36}
                height={36}
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Swasth<span className="text-teal-400">AI</span>
              </span>
              <span className="text-[10px] text-gray-300 font-medium leading-none tracking-wide uppercase">
                Medical Triage
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-gray-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href={SITE_CONFIG.appLinks.doctorLogin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Doctor Portal</span>
            </a>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1DA851] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Book a Demo</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white p-2 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07162C] border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-base font-medium ${
                    isActive ? "bg-teal-600/30 text-teal-300 font-semibold" : "text-gray-200 hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-white/10 flex flex-col space-y-2.5">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>Book a Demo on WhatsApp</span>
            </a>
            <a
              href={SITE_CONFIG.appLinks.doctorLogin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center border border-white/30 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5"
            >
              <span>Doctor Portal Login</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
