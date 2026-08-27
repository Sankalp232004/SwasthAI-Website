/**
 * SwasthAI WhatsApp Outreach System — Master Templates & Message Generator
 * =========================================================================
 * Human, conversational, specialty-tailored, doctor-friendly message builder.
 * Zero buzzwords, zero fake statistics, zero medical diagnosis claims.
 */

import { MedicalSpecialty, MessageLanguage, MessageVariant, Prospect } from "./types";
import { sanitizeDoctorName, sanitizeClinicName } from "./validator";

export interface SpecialtyConfig {
  specialtyKey: MedicalSpecialty;
  operationalProblem: string;
  problemHinglish: string;
  shortContext: string;
}

export const SPECIALTY_CONFIGS: Record<string, SpecialtyConfig> = {
  "General Physician": {
    specialtyKey: "General Physician",
    operationalProblem: "when a patient with severe acute symptoms arrives behind routine checkups during busy morning OPD hours",
    problemHinglish: "busy morning OPD hours mein jab acute symptoms wale patients routine checkups ke peeche wait karte hain",
    shortContext: "general OPD walk-in flow"
  },
  "Pediatrician": {
    specialtyKey: "Pediatrician",
    operationalProblem: "when a child who appears more distressed arrives behind routine reviews",
    problemHinglish: "jab ek distressed child routine immunization ya follow-up ke peeche wait kar raha ho",
    shortContext: "pediatric waiting room intake"
  },
  "Orthopedic": {
    specialtyKey: "Orthopedic",
    operationalProblem: "when an acute injury walk-in arrives behind routine follow-ups",
    problemHinglish: "jab acute fracture ya sprain walk-in routine follow-ups ke peeche wait kare",
    shortContext: "orthopedic trauma and walk-in prioritization"
  },
  "Dentist": {
    specialtyKey: "Dentist",
    operationalProblem: "when a patient with severe pain or swelling arrives during a busy OPD",
    problemHinglish: "jab severe dental pain ya swelling wala patient busy clinic hours mein arrive kare",
    shortContext: "acute dental pain management"
  },
  "Ophthalmologist": {
    specialtyKey: "Ophthalmologist",
    operationalProblem: "when a patient with sudden eye symptoms arrives during a packed OPD",
    problemHinglish: "jab sudden eye distress ya injury wala patient routine refraction checkups ke peeche ho",
    shortContext: "ophthalmology walk-in queue"
  },
  "Dermatologist": {
    specialtyKey: "Dermatologist",
    operationalProblem: "when an urgent complaint arrives alongside routine consultations",
    problemHinglish: "jab acute skin flare-up routine consultations ke saath arrive kare",
    shortContext: "dermatology OPD intake"
  },
  "Physiotherapist": {
    specialtyKey: "Physiotherapist",
    operationalProblem: "when a patient with acute pain arrives alongside scheduled follow-ups",
    problemHinglish: "jab acute pain walk-in scheduled appointments ke beech arrive kare",
    shortContext: "physiotherapy queue sequencing"
  },
  "ENT": {
    specialtyKey: "ENT",
    operationalProblem: "when a patient with a sudden severe complaint arrives during a busy OPD",
    problemHinglish: "jab severe ear pain ya sudden epistaxis wala patient routine checkups ke peeche wait kare",
    shortContext: "ENT walk-in intake"
  },
  "Gynecologist": {
    specialtyKey: "Gynecologist",
    operationalProblem: "when an acute pain or urgent walk-in arrives during routine antenatal checkups",
    problemHinglish: "jab urgent walk-in routine antenatal checkups ke beech arrive kare",
    shortContext: "gynecology walk-in flow"
  },
  "Multi-Specialty / General": {
    specialtyKey: "Multi-Specialty / General",
    operationalProblem: "when an acute walk-in arrives amidst routine consultations during busy OPD hours",
    problemHinglish: "jab acute walk-in patients routine consultations ke beech arrive karein",
    shortContext: "polyclinic queue management"
  }
};

/**
 * Detects specialty matching from string or prospect data
 */
export function matchSpecialty(rawSpecialty?: string): SpecialtyConfig {
  if (!rawSpecialty) return SPECIALTY_CONFIGS["Multi-Specialty / General"];

  const lower = rawSpecialty.toLowerCase();
  if (lower.includes("pediatric") || lower.includes("child") || lower.includes("kids")) {
    return SPECIALTY_CONFIGS["Pediatrician"];
  }
  if (lower.includes("ortho") || lower.includes("bone") || lower.includes("joint") || lower.includes("spine")) {
    return SPECIALTY_CONFIGS["Orthopedic"];
  }
  if (lower.includes("dent") || lower.includes("tooth") || lower.includes("oral")) {
    return SPECIALTY_CONFIGS["Dentist"];
  }
  if (lower.includes("eye") || lower.includes("ophthalm") || lower.includes("vision")) {
    return SPECIALTY_CONFIGS["Ophthalmologist"];
  }
  if (lower.includes("skin") || lower.includes("derma") || lower.includes("hair")) {
    return SPECIALTY_CONFIGS["Dermatologist"];
  }
  if (lower.includes("physio") || lower.includes("rehab")) {
    return SPECIALTY_CONFIGS["Physiotherapist"];
  }
  if (lower.includes("ent") || lower.includes("ear") || lower.includes("nose") || lower.includes("throat")) {
    return SPECIALTY_CONFIGS["ENT"];
  }
  if (lower.includes("gyn") || lower.includes("ob") || lower.includes("matern") || lower.includes("women")) {
    return SPECIALTY_CONFIGS["Gynecologist"];
  }
  if (lower.includes("physician") || lower.includes("general") || lower.includes("internal")) {
    return SPECIALTY_CONFIGS["General Physician"];
  }
  return SPECIALTY_CONFIGS["Multi-Specialty / General"];
}

export interface GeneratedMessagePayload {
  text: string;
  templateName: string;
  templateVariables: string[];
  wordCount: number;
  variant: MessageVariant;
  language: MessageLanguage;
}

/**
 * Generates the master initial WhatsApp outreach message.
 * Strictly guarantees no placeholders and natural human phrasing.
 */
export function generateWhatsAppMessage(
  prospect: Partial<Prospect>,
  variant: MessageVariant = "A",
  language: MessageLanguage = "en"
): GeneratedMessagePayload {
  const docName = sanitizeDoctorName(prospect.doctorName);
  const clinicName = sanitizeClinicName(prospect.clinicName, prospect.city);
  const specialtyConfig = matchSpecialty(prospect.specialty);
  const city = prospect.city?.trim() || "";

  let text = "";
  const templateName = "swasthai_clinic_outreach_v1";
  const templateVariables: string[] = [docName, clinicName];

  if (language === "hinglish") {
    // Hinglish Conversational Variant
    if (variant === "A") {
      text = `Hi ${docName},

Maine ${clinicName}${city ? ` (${city})` : ""} ke baare mein dekha aur aapse poochna chahta tha ki busy OPD hours mein walk-in queue kaise manage hoti hai.

Aksar ${specialtyConfig.problemHinglish}, reception ko priority decide karne mein challenge hota hai.

Maine SwasthAI banaya hai — ek simple QR check-in system jahan patient phone par 4-5 basic questions answer karta hai aur aapke desk par recommended priority dikh jati hai, jabki 100% control doctor ke paas hi rehta hai.

Kya main aapko ek 2-minute ka quick demo video bhej sakta hoon?

Sankalp
Founder, SwasthAI
https://swasthai-three.vercel.app/`;
    } else if (variant === "B") {
      text = `Hi ${docName},

Maine ${clinicName}${city ? ` (${city})` : ""} dekha. Quick question — peak OPD hours mein jab ek saath multiple walk-ins aate hain, reception urgency kaise judge karti hai?

Humne SwasthAI banaya hai to organize patient intake. Patient QR scan karke 1 minute mein symptoms enter karta hai aur screen par recommended priority aa jati hai, with full doctor override control.

Would you like me to send a 2-minute demo?

Sankalp
Founder, SwasthAI`;
    } else {
      text = `Hi ${docName},

I came across ${clinicName}. Jab morning OPD mein severe case routine follow-up ke peeche wait karta hai, front desk ke paas urgency check karne ka structured tool nahi hota.

SwasthAI helps clinics organize this with zero app downloads. Patient scans a QR code, answers basic questions, and doctor gets a live priority queue with 100% override control.

Kya main 2-minute demo share kar sakta hoon?

Sankalp
Founder, SwasthAI`;
    }
  } else {
    // English Conversational Variants (Default)
    if (variant === "A") {
      // Problem-first variant
      text = `Hi ${docName},

I came across ${clinicName}${city ? ` in ${city}` : ""} and wanted to ask how your team currently handles walk-ins during busy OPD hours.

In many practices, ${specialtyConfig.operationalProblem}, front-desk staff have to guess urgency without structured data.

I'm building SwasthAI, a simple system that collects basic patient inputs via a desk QR code and shows a recommended queue priority, while keeping the doctor in 100% control.

Would you like me to send you a 2-minute demo?

Sankalp
Founder, SwasthAI
https://swasthai-three.vercel.app/`;
    } else if (variant === "B") {
      // Curiosity-first variant
      text = `Hi ${docName},

I was looking at ${clinicName}${city ? ` in ${city}` : ""} and was curious how your front desk prioritizes walk-ins during peak consultation slots.

When ${specialtyConfig.operationalProblem}, paper registers only record arrival time rather than urgency.

We built SwasthAI so arriving patients scan a QR code on their phone in 60 seconds, giving your desk a recommended queue priority while you retain full override authority.

Would it be useful if I sent you a 2-minute video showing how it works?

Sankalp
Founder, SwasthAI
https://swasthai-three.vercel.app/`;
    } else {
      // Question-first variant
      text = `Hi ${docName},

Quick question regarding OPD flow at ${clinicName}${city ? ` in ${city}` : ""}.

During busy mornings, ${specialtyConfig.operationalProblem}, receptionists often face difficult calls on who to send in next.

SwasthAI gives your clinic a simple QR intake flow. Patients answer a few structured questions, and your screen displays a recommended priority order with zero change to how you consult.

Would you like me to send over a 2-minute demo?

Sankalp
Founder, SwasthAI
https://swasthai-three.vercel.app/`;
    }
  }

  // Count words
  const words = text.trim().split(/\s+/).filter(Boolean);

  return {
    text: text.trim(),
    templateName,
    templateVariables,
    wordCount: words.length,
    variant,
    language
  };
}

/**
 * Generates follow-up messages based on stage (Step 1 = Day 3/4, Step 2 = Day 8/9 final)
 */
export function generateFollowUpMessage(
  prospect: Partial<Prospect>,
  step: 1 | 2
): { text: string; wordCount: number; isFinal: boolean } {
  const docName = sanitizeDoctorName(prospect.doctorName);
  let text = "";

  if (step === 1) {
    text = `Hi ${docName}, just following up on my previous message about SwasthAI.

I know OPD hours can be very demanding. I can send the 2-minute demo video here whenever convenient if you'd like to see how the QR queue prioritization works.

Sankalp
Founder, SwasthAI`;
  } else {
    text = `Hi ${docName}, I’ll leave it here so I don’t keep bothering you.

If organizing walk-in intake or improving morning OPD queue flow becomes relevant for your clinic later, I’d be very happy to share SwasthAI.

Wishing you and your clinic all the best.

Sankalp
Founder, SwasthAI
https://swasthai-three.vercel.app/`;
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  return {
    text: text.trim(),
    wordCount: words.length,
    isFinal: step === 2
  };
}
