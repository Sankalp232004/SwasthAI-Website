/**
 * SwasthAI WhatsApp Outreach System — Objection Library & Smart Reply Engine
 * ===========================================================================
 * Human, concise, doctor-friendly responses for every conversation scenario.
 * Designed for immediate conversion into 2-minute demos & 2-day clinic trials.
 */

import { ObjectionType } from "./types";
import { sanitizeDoctorName } from "./validator";

export interface ObjectionScript {
  type: ObjectionType;
  description: string;
  triggerPhrases: string[];
  suggestedResponse: (doctorName?: string) => string;
}

export const OBJECTION_SCRIPTS: Record<ObjectionType, ObjectionScript> = {
  INTERESTED: {
    type: "INTERESTED",
    description: "Doctor or clinic expressed positive interest",
    triggerPhrases: ["sure", "yes", "send it", "interested", "ok send", "bhejo", "tell me"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, thank you for getting back to me!

Here is our 2-minute interactive demo video and live triage preview:
👉 Live Demo & Triage Simulator: https://swasthai-three.vercel.app/demo
👉 Direct Test App: https://swasthai-2tv5.onrender.com/

In summary: patients scan your desk QR code to input chief complaints, and your desk receives an objective priority queue with 100% doctor override control.

We offer a free 2-day live clinic trial with zero setup fee. Would Thursday or Friday morning work for a quick 10-minute setup walkthrough?`;
    }
  },

  DEMO_REQUEST: {
    type: "DEMO_REQUEST",
    description: "Doctor directly asked for a demo or walkthrough",
    triggerPhrases: ["can you show me", "how to see demo", "show me demo", "schedule demo", "demo please"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, absolutely!

You can test the live patient intake right now on your phone:
👉 https://swasthai-2tv5.onrender.com/

Or watch the 2-minute overview here:
👉 https://swasthai-three.vercel.app/demo

I'd be very happy to jump on a quick 10-minute Google Meet or WhatsApp call to show you the doctor console. What time usually suits you best between OPD sessions?`;
    }
  },

  PRICE: {
    type: "PRICE",
    description: "Doctor asked about pricing / costs",
    triggerPhrases: ["price", "cost", "how much", "charges", "kitna lagega", "fees", "subscription"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, we keep our pricing very accessible for independent clinics.

1. Free 2-Day Live Pilot: ₹0 setup fee, no commitment.
2. After trial: ₹999 to ₹1,999/month per clinic (all features included, unlimited walk-ins, zero hardware required).

We always suggest trying the 2-day pilot first during a busy morning session so you can see the queue flow yourself. Would you like to set up a trial this week?`;
    }
  },

  TRIAL: {
    type: "TRIAL",
    description: "Doctor asked about trying it or starting a pilot",
    triggerPhrases: ["can we try", "trial", "pilot", "how to start", "test in clinic", "setup trial"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, yes! We offer a completely free 2-day live trial for your clinic.

Setup takes under 10 minutes:
1. We give you your clinic's printable reception QR standee.
2. We show your front desk how to view the incoming priority queue in 5 minutes.
3. Patients scan and check in — zero app downloads needed.

Which day this week would be best to try it during your morning OPD?`;
    }
  },

  ALREADY_HAVE_SYSTEM: {
    type: "ALREADY_HAVE_SYSTEM",
    description: "Clinic already uses another EMR / Practo / software",
    triggerPhrases: ["already have software", "using practo", "have emr", "software already", "we use system"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Understood, ${doc}! Most clinics we work with already use Practo or custom EMR for billing and appointments.

SwasthAI doesn't replace your EMR. It works solely at reception during the 5 minutes between patient arrival and entering your room — prioritizing who needs to see you first based on clinical severity rather than arrival sequence.

It runs standalone on any browser alongside your current software. I can send a 90-second clip if you'd like to see how it complements existing setups?`;
    }
  },

  NO_PROBLEM: {
    type: "NO_PROBLEM",
    description: "Clinic feels their token / queue system is already working fine",
    triggerPhrases: ["no problem", "we manage fine", "tokens work", "system is ok", "not an issue"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Got it, ${doc}, totally understand!

The main difference clinics notice is that tokens only track arrival time, not clinical urgency. When an acute case (like high fever or sudden severe pain) arrives behind routine reviews, SwasthAI highlights them before they sit down in the lobby.

I'll leave it here for now. If you ever want to explore a quick 2-day trial, feel free to drop me a message anytime. Wishing you a great week!`;
    }
  },

  TRUST: {
    type: "TRUST",
    description: "Doctor asked about safety, accuracy, or diagnosis boundaries",
    triggerPhrases: ["is it safe", "does it diagnose", "accuracy", "clinical decision", "medical risk"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, that is a critical question.

SwasthAI is strictly an operational intake assistant — it does NOT diagnose, prescribe, or replace clinical judgment.

It simply structures the patient's chief complaint, pain score (0–10), and basic vitals, grouping walk-ins into 4 operational priority tiers. You retain 100% authority to override, reorder, or call anyone next at all times.

Would you like to see how the doctor console looks in a 2-minute video?`;
    }
  },

  TECHNICAL: {
    type: "TECHNICAL",
    description: "Doctor asked about hardware, app downloads, or offline resilience",
    triggerPhrases: ["hardware", "download app", "internet issue", "offline", "patient app", "printer"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, we built SwasthAI specifically for Indian clinic conditions:

1. No patient app download: Patients scan a QR code and it opens instantly on their phone browser in 90 seconds.
2. Works on any device: Tablet, PC, laptop, or mobile — zero installation required.
3. Offline-resilient: Works seamlessly even during internet fluctuations.

Would you like me to send the 2-minute demo link?`;
    }
  },

  SEND_DETAILS: {
    type: "SEND_DETAILS",
    description: "Doctor asked for comprehensive brochure / details",
    triggerPhrases: ["send details", "share info", "brochure", "details please", "bhejo details"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, here is our 1-page overview:

SwasthAI solves waiting room bottlenecks in 3 steps:
1. Patient scans reception QR (zero app downloads) and submits structured intake in 60 seconds.
2. AI assigns recommended urgency across 4 tiers (Emergency, Red, Amber, Green).
3. Doctor walks into consultation already briefed with chief complaints & retains 100% override control.

👉 Full Live Demo: https://swasthai-three.vercel.app/demo
👉 Official Portal: https://swasthai-three.vercel.app/

Would you like to test a free 2-day trial in your clinic this week?`;
    }
  },

  BUSY: {
    type: "BUSY",
    description: "Doctor is currently busy with OPD",
    triggerPhrases: ["busy", "not now", "in opd", "surgery", "later", "call later"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Completely understand, ${doc}! I'll leave the link here so you can review whenever you have 2 minutes:
https://swasthai-three.vercel.app/demo

I will check back with you early next week. Have a smooth OPD!`;
    }
  },

  TIME: {
    type: "TIME",
    description: "Doctor mentioned lack of time to review right now",
    triggerPhrases: ["no time", "too busy", "time nahi hai", "packed schedule"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Understood completely, ${doc}! That's why we kept our video under 2 minutes: https://swasthai-three.vercel.app/demo

Feel free to check it whenever your schedule frees up. Wishing you a productive week!`;
    }
  },

  WRONG_PERSON: {
    type: "WRONG_PERSON",
    description: "Front desk / non-doctor answered the phone",
    triggerPhrases: ["wrong number", "who are you", "not doctor", "reception", "manager"],
    suggestedResponse: () => {
      return `Hi! My apologies for any confusion. I'm Sankalp, founder of SwasthAI. We help clinics streamline patient intake and OPD queue flow via a simple QR check-in.

Could you let me know the best way or time to reach the clinic manager or doctor? Or I can share a 2-minute overview link here.`;
    }
  },

  NOT_INTERESTED: {
    type: "NOT_INTERESTED",
    description: "Prospect declined outreach",
    triggerPhrases: ["not interested", "no thanks", "stop", "don't message", "no", "nahi chahiye", "unsubscribe"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Understood completely, ${doc}. Thank you for letting me know, and I won't message you again. Wishing you and your clinic continued success!`;
    }
  },

  CURIOUS: {
    type: "CURIOUS",
    description: "General curiosity about what SwasthAI is",
    triggerPhrases: ["what is this", "kya hai ye", "how does it work", "explain"],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, SwasthAI is an intelligent OPD queue system.

Instead of paper tokens where serious cases wait blindly behind routine ones, arriving patients scan a QR code at reception and complete a 60-second symptom intake.

Your desk instantly receives an objective priority queue, helping you spot urgent walk-ins immediately while you keep full override control.

Would you like me to send a 2-minute demo video?`;
    }
  },

  OTHER: {
    type: "OTHER",
    description: "General reply",
    triggerPhrases: [],
    suggestedResponse: (doctorName) => {
      const doc = sanitizeDoctorName(doctorName);
      return `Hi ${doc}, thanks for your message! If you have any questions about how SwasthAI organizes walk-in patient flow or would like to test a 2-day live pilot, I'm right here.`;
    }
  }
};

/**
 * Classifies an incoming message into an ObjectionType using keyword heuristics
 */
export function classifyIncomingReply(text: string): ObjectionType {
  const lower = text.toLowerCase().trim();

  // 1. Opt-out & Not Interested
  if (
    lower === "no" ||
    lower.includes("not interested") ||
    lower.includes("no thanks") ||
    lower.includes("stop") ||
    lower.includes("don't message") ||
    lower.includes("remove me") ||
    lower.includes("unsubscribe") ||
    lower.includes("nahi chahiye")
  ) {
    return "NOT_INTERESTED";
  }

  // 2. Price / Cost
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much") || lower.includes("charges") || lower.includes("kitna")) {
    return "PRICE";
  }

  // 3. Trial / Pilot
  if (lower.includes("trial") || lower.includes("pilot") || lower.includes("can we try") || lower.includes("test")) {
    return "TRIAL";
  }

  // 4. Demo Request
  if (lower.includes("demo") || lower.includes("show me") || lower.includes("video") || lower.includes("call me")) {
    return "DEMO_REQUEST";
  }

  // 5. Positive Interest
  if (
    lower === "yes" ||
    lower === "sure" ||
    lower === "ok" ||
    lower === "okay" ||
    lower === "send" ||
    lower.includes("send it") ||
    lower.includes("interested") ||
    lower.includes("bhejo") ||
    lower.includes("share")
  ) {
    return "INTERESTED";
  }

  // 6. Already have software
  if (lower.includes("practo") || lower.includes("already have") || lower.includes("using software") || lower.includes("have system")) {
    return "ALREADY_HAVE_SYSTEM";
  }

  // 7. Busy
  if (lower.includes("busy") || lower.includes("not now") || lower.includes("in opd") || lower.includes("later")) {
    return "BUSY";
  }

  // 8. Wrong person
  if (lower.includes("wrong number") || lower.includes("who are you") || lower.includes("not doctor")) {
    return "WRONG_PERSON";
  }

  // 9. Trust / Diagnosis
  if (lower.includes("diagnos") || lower.includes("safe") || lower.includes("accuracy") || lower.includes("legal")) {
    return "TRUST";
  }

  // 10. Technical / Offline
  if (lower.includes("internet") || lower.includes("offline") || lower.includes("app") || lower.includes("hardware")) {
    return "TECHNICAL";
  }

  // 11. Details
  if (lower.includes("detail") || lower.includes("brochure") || lower.includes("information")) {
    return "SEND_DETAILS";
  }

  return "CURIOUS";
}
