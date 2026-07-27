import React from "react";
import { Quote, Star, UserCheck, Stethoscope } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "The triage score doesn't replace my clinical judgment, but it makes me think about priority before the patient walks through the door. That pre-consultation context is invaluable.",
      author: "Dr. R. K. Verma",
      role: "Senior General Physician (20+ Yrs Practice)",
      location: "Lucknow, UP",
      specialty: "General Medicine"
    },
    {
      quote: "Monday morning is usually chaotic with 25+ patients arguing at the counter. Now when someone asks when they'll be called, I can actually show them their position on screen. They stop asking after that.",
      author: "Priya Sharma",
      role: "Lead Receptionist",
      location: "Multi-specialty OPD Clinic",
      specialty: "Front-Desk Operations"
    },
    {
      quote: "We were skeptical about digital intake for elderly patients. But QR scanning combined with reception assistance meant 85%+ of patients were registered in under 2 minutes.",
      author: "Dr. A. P. Singh",
      role: "Orthopedic Surgeon & Clinic Owner",
      location: "Kanpur, UP",
      specialty: "Orthopedics"
    }
  ];

  return (
    <section className="py-20 bg-[#F8FAFC] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest">
            Pilot & Practitioner Feedback
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59] tracking-tight">
            Trusted by Doctors and Clinic Teams
          </p>
          <p className="text-base text-slate-600 leading-relaxed">
            Here is what clinicians and practice managers say after deploying SwasthAI in live OPD sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.author}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6 relative hover:shadow-xl transition-all"
            >
              <div className="space-y-4 relative z-10">
                <Quote className="w-8 h-8 text-teal-500/40" />

                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#0F2C59]">{item.author}</h4>
                  <span className="block text-xs text-slate-500 font-medium">{item.role}</span>
                  <span className="block text-[11px] text-teal-700 font-medium">{item.location}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
