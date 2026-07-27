export const SITE_CONFIG = {
  name: "SwasthAI",
  fullName: "SwasthAI • Intelligent Medical Triage System",
  tagline: "Fast, Fair, and Accurate Patient Prioritization for Clinics",
  description: "SwasthAI is India's premier intelligent clinic workflow & patient triage platform. Eliminate long OPD waiting room chaos, prioritize urgent cases, and optimize doctor consultation time.",
  url: "https://swasthai-three.vercel.app",
  whatsappNumberText: "+91 9140721395",
  whatsappRaw: "919140721395",
  whatsappMessages: {
    doctorDemo: "Hi! I'm interested in SwasthAI for my clinic. I'd like to schedule a demo.",
    clinicTriage: "Hello, I'd like to learn how SwasthAI can improve patient triage and queue management.",
    generalContact: "Hi SwasthAI team, I have an inquiry regarding your clinic workflow software."
  },
  email: "swasthai.founder@gmail.com",
  location: "Lucknow, Uttar Pradesh, IN",
  founder: {
    name: "Founder",
    role: "Founder & CEO, SwasthAI",
    bio: "Building intelligent, accessible workflow technology for healthcare providers across India."
  },
  appLinks: {
    patientPortal: "https://swasthai-2tv5.onrender.com/",
    doctorLogin: "https://swasthai-2tv5.onrender.com/doctor/login",
    superadminLogin: "https://swasthai-2tv5.onrender.com/superadmin/login"
  }
};

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Clinic Workflow" | "Healthcare" | "Patient Experience" | "Startup" | "Digital Health";
  readTime: string;
  publishedAt: string;
  author: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "rethinking-opd-intake-five-minute-window",
    title: "Rethinking OPD Intake: The 5-Minute Window That Decides Clinic Efficiency",
    excerpt: "Why the minutes between a patient arriving and seeing the doctor determine patient satisfaction and operational output.",
    category: "Clinic Workflow",
    readTime: "4 min read",
    publishedAt: "July 24, 2026",
    author: "Founder",
    content: `
      In a typical outpatient clinic, the most chaotic minutes occur before the patient ever enters the consultation room. 
      Patients arrive in waves, registration registers fill up, and receptionists make high-pressure decisions based solely on arrival sequence or visual impression.

      ### The Hidden Cost of First-Come, First-Served Queues
      Traditional first-come, first-served queues create two major failure points:
      1. **Clinical Risk**: Patients with escalating symptoms (like high fever or chest discomfort) wait behind routine checkups.
      2. **Consultation Friction**: Doctors spend the first 2-3 minutes of every consultation gathering basic administrative data that could have been collected at reception.

      ### Structured Intake: The 90-Second Solution
      By introducing a guided digital intake flow at reception — accessible via QR code on any smartphone — clinics capture chief complaints, age, severity, and basic vitals in 90 seconds. 

      The result? The doctor receives a structured summary before the patient walks in, consultation time is spent on clinical care rather than dictation, and patients experience a transparent, fair system.
    `
  },
  {
    slug: "why-small-clinics-need-offline-first-software",
    title: "Why Indian Clinics Need Offline-First Healthcare Software",
    excerpt: "How internet volatility in Tier 2 and Tier 3 cities shapes the architectural necessity of offline-resilient OPD software.",
    category: "Digital Health",
    readTime: "5 min read",
    publishedAt: "July 20, 2026",
    author: "Founder",
    content: `
      When building software for Indian healthcare providers, developers often make the mistake of assuming continuous cloud connectivity. In real-world clinics across Lucknow, Kanpur, and Varanasi, power outages and 4G fluctuations are daily occurrences.

      ### Reliability is the True Feature
      If a clinic's intake system freezes during a 9:30 AM Monday rush, the receptionist falls back to paper, and trust in digital tools is permanently lost.

      SwasthAI was built offline-first from day one. Intake forms, triage scoring, and local queue management function seamlessly without an active internet connection. As soon as connectivity returns, data synchronizes quietly in the background.

      Software that fails in real-world clinical conditions is not software — it's an operational bottleneck.
    `
  },
  {
    slug: "managing-waiting-room-psychology-and-patient-retention",
    title: "Managing Waiting Room Psychology: Why Patients Leave and How to Retain Them",
    excerpt: "Research shows patient retention is driven as much by front-desk communication and perceived queue fairness as clinical outcome.",
    category: "Patient Experience",
    readTime: "4 min read",
    publishedAt: "July 15, 2026",
    author: "Founder",
    content: `
      Studies in ambulatory care consistently show that patient dissatisfaction rarely stems from medical treatment quality. Instead, the primary cause of patient attrition is unmanaged waiting room anxiety.

      ### Three Principles of Waiting Room Management
      - **Communication**: Giving patients realistic time estimates reduces psychological stress.
      - **Transparency**: Clear queue status visibility prevents arguments at reception.
      - **Fairness**: Patients accept waiting when they know queue priority is managed clinically rather than arbitrarily.

      Implementing structured triage transforms the waiting room from a chaotic waiting space into an organized, professional care environment.
    `
  },
  {
    slug: "building-swasthai-lessons-from-visiting-50-clinics",
    title: "Building SwasthAI: Lessons Learned from Visiting 50+ Clinics in Uttar Pradesh",
    excerpt: "What listening to receptionists, GPs, and pediatricians taught us about building software that doctors actually want to use.",
    category: "Startup",
    readTime: "6 min read",
    publishedAt: "July 10, 2026",
    author: "Founder",
    content: `
      When I started SwasthAI, I assumed the core challenge was Electronic Health Records (EHR). But after spending weeks observing daily OPD operations, I realized the real problem occurred before the doctor's door opened.

      ### Key Insights
      1. **Software must pass the Monday 9:30 AM test**: If a tool takes more than 5 seconds for a receptionist to interact with under pressure, it gets abandoned.
      2. **Do not disrupt the doctor's flow**: Doctors do not want complex multi-click software during consultation. They want actionable context in 3 seconds.
      3. **Simplicity requires iteration**: We reduced our patient intake form from 12 fields to 5 fields, increasing completion rate from 40% to 87%.

      Building healthcare software requires deep empathy for the front-desk staff who run the operations every single day.
    `
  },
  {
    slug: "specialty-triage-pediatrics-vs-orthopedics",
    title: "Specialty Triage: How Pediatric and Orthopedic Clinics Require Different Workflows",
    excerpt: "Why generic medical software fails in specialized practices and how tailored urgency scoring changes patient outcomes.",
    category: "Healthcare",
    readTime: "5 min read",
    publishedAt: "July 5, 2026",
    author: "Founder",
    content: `
      Not all OPD queues are created equal. A pediatric clinic operates on different urgency signals than an orthopedic practice.

      ### Pediatric Triage Needs
      In pediatrics, infants under 12 months with high fever or respiratory distress require immediate flagging. Parents fill out the intake form on behalf of the child, requiring parent-focused plain language.

      ### Orthopedic Triage Needs
      In orthopedics, pain is universal. Standard 1-10 pain scales fail because nearly every patient reports high discomfort. Triage must instead weight recent trauma, inability to bear weight, and acute onset versus chronic conditions.

      By tailoring triage logic to clinic specialties, SwasthAI delivers meaningful priority signals for every medical discipline.
    `
  }
];
