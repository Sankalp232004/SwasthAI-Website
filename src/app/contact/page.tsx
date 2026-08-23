"use client";

import React, { useState } from "react";
import { MessageSquare, Mail, MapPin, CheckCircle2, Send, Phone, BookOpen } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clinicName: "",
    phone: "",
    email: "",
    message: ""
  });

  const waLink = `https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.doctorDemo)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 sm:pt-36">
      
      {/* Header */}
      <section className="bg-[#0F2C59] text-white py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold border border-white/15">
            Contact & Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            We&apos;re Here to Help Modernize Your Practice
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Reach out directly for a live product demo, pilot setup, or technical assistance.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-8 bg-slate-50 p-8 rounded-3xl border border-slate-200">
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-[#0F2C59]">Direct Contact Channels</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  For fastest response regarding demo booking or clinic setup, message us directly on WhatsApp.
                </p>
              </div>

              {/* WhatsApp Card */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">WhatsApp Support & Demo</h3>
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-700 hover:underline">
                      Click to Connect on WhatsApp
                    </a>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Pre-filled demo booking text ready. Typically replies in under 15 minutes.
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Book Demo on WhatsApp</span>
                </a>
              </div>

              {/* Contact Info List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Email Support</span>
                    <a href={`mailto:${SITE_CONFIG.email}`} className="text-sm font-bold text-[#0F2C59] hover:underline">
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Phone Contact</span>
                    <a href={`tel:${SITE_CONFIG.whatsappRaw}`} className="text-sm font-bold text-[#0F2C59] hover:underline">
                      {SITE_CONFIG.whatsappNumberText}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Medium Articles</span>
                    <a href="https://medium.com/@swasthai.founder" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#0F2C59] hover:underline">
                      medium.com/@swasthai.founder
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Location</span>
                    <span className="text-sm font-bold text-[#0F2C59]">{SITE_CONFIG.location}</span>
                  </div>
                </div>
              </div>

              {/* Downloadable Clinic Flyer Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Clinic One-Pager</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 font-mono text-slate-300">PDF / Print</span>
                </div>
                <h4 className="text-sm font-bold text-white">Download Clinic Operations Flyer</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Share our 1-page operational overview & live triage workflow with your doctors or clinic partners.
                </p>
                <div className="pt-1 flex gap-2">
                  <a
                    href="/flyer.html"
                    target="_blank"
                    className="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    View Interactive Flyer →
                  </a>
                  <a
                    href="/img/flyer.jpg"
                    download="SwasthAI_Clinic_Flyer.jpg"
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-semibold"
                  >
                    Download JPG
                  </a>
                </div>
              </div>

            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#0F2C59]">Send Us a Message</h2>
                <p className="text-sm text-slate-600">
                  Fill out the details below and our team will get in touch with you shortly.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                  <h3 className="text-xl font-bold text-[#0F2C59]">Message Received!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out. We will contact you via phone or email shortly to discuss your clinic requirements.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. Rajesh Sharma"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Clinic / Practice Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.clinicName}
                        onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                        placeholder="Sharma Medical Center"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="doctor@clinic.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">How can we help your clinic? *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your patient volume, specialty, and current queue management setup..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0F2C59] hover:bg-[#07162C] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
