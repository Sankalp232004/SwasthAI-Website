/**
 * SwasthAI WhatsApp Outreach System — Type Definitions
 * =======================================================
 * Production CRM, Messaging, Quality Gate & Meta Cloud API Types
 */

export type MedicalSpecialty =
  | "General Physician"
  | "Pediatrician"
  | "Orthopedic"
  | "Dentist"
  | "Ophthalmologist"
  | "Dermatologist"
  | "Physiotherapist"
  | "ENT"
  | "Gynecologist"
  | "Multi-Specialty / General"
  | "Other";

export type MessageLanguage = "en" | "hinglish";

export type MessageVariant = "A" | "B" | "C"; // A: Problem-first, B: Curiosity-first, C: Question-first

export type ProspectStatus =
  | "NEW"
  | "READY"
  | "PREVIEWED"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "REPLIED"
  | "INTERESTED"
  | "DEMO_BOOKED"
  | "DEMO_COMPLETED"
  | "TRIAL_STARTED"
  | "TRIAL_COMPLETED"
  | "PAID"
  | "NOT_INTERESTED"
  | "OPTED_OUT"
  | "INVALID";

export type MessageDeliveryStatus =
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "BLOCKED"
  | "OPTED_OUT";

export type ObjectionType =
  | "INTERESTED"
  | "DEMO_REQUEST"
  | "TRIAL"
  | "PRICE"
  | "TIME"
  | "ALREADY_HAVE_SYSTEM"
  | "NO_PROBLEM"
  | "TRUST"
  | "TECHNICAL"
  | "NOT_INTERESTED"
  | "SEND_DETAILS"
  | "CURIOUS"
  | "WRONG_PERSON"
  | "BUSY"
  | "OTHER";

export interface Prospect {
  id: string;
  phone: string; // Normalized E.164: +91XXXXXXXXXX
  rawPhone: string;
  doctorName: string;
  clinicName: string;
  specialty: MedicalSpecialty | string;
  city: string;
  area?: string;
  website?: string;
  email?: string;
  sourceUrl?: string;
  notes?: string;
  status: ProspectStatus;
  campaign: string;
  language: MessageLanguage;
  messageVariant: MessageVariant;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  followUpStep: number; // 0: Initial, 1: Follow-up 1, 2: Follow-up 2 (Final), 3+: Completed
  nextFollowUpDue?: string; // ISO date string
  optedOut: boolean;
  optedOutAt?: string;
  optOutReason?: string;
  totalMessagesSent: number;
  totalRepliesReceived: number;
}

export interface QualityScoreResult {
  overallScore: number; // 0 - 100
  personalizationScore: number; // 0 - 100
  clarityScore: number; // 0 - 100
  brevityScore: number; // 0 - 100
  spamRisk: "LOW" | "MEDIUM" | "HIGH";
  wordCount: number;
  emojiCount: number;
  hasPlaceholders: boolean;
  detectedPlaceholders: string[];
  hasMedicalClaims: boolean;
  hasBannedWords: boolean;
  bannedWordsFound: string[];
  reasons: string[];
  passed: boolean;
}

export interface WhatsAppMessageDraft {
  prospectId: string;
  phone: string;
  doctorName: string;
  clinicName: string;
  specialty: string;
  text: string;
  language: MessageLanguage;
  variant: MessageVariant;
  templateName: string;
  templateVariables: string[];
  qualityResult: QualityScoreResult;
  generatedAt: string;
}

export interface OutreachLogEntry {
  id: string;
  timestamp: string;
  phone: string;
  doctorName: string;
  clinicName: string;
  specialty: string;
  messageText: string;
  templateName: string;
  templateVariables?: string[];
  messageType: "TEMPLATE_INITIAL" | "TEMPLATE_FOLLOWUP" | "FREE_FORM_REPLY" | "TEST";
  messageId?: string;
  whatsappStatus: MessageDeliveryStatus;
  apiStatusCode?: number;
  apiResponse?: any;
  campaign: string;
  operator: string;
  followUpStep: number;
  isDryRun: boolean;
  errorMessage?: string;
}

export interface WhatsAppConfig {
  accessToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  apiVersion: string;
  webhookVerifyToken?: string;
  testNumber?: string;
  dailyLimit: number;
  founderName: string;
  founderPhone: string;
  founderEmail: string;
  websiteUrl: string;
  demoAppUrl: string;
}

export interface SendGateResult {
  allowed: boolean;
  reasons: string[];
  prospect?: Prospect;
  draft?: WhatsAppMessageDraft;
}

export interface WhatsAppStoreData {
  version: string;
  lastUpdated: string;
  dailySendCounts: Record<string, number>; // "YYYY-MM-DD" -> count
  optedOutNumbers: Record<string, { optedOutAt: string; reason?: string }>;
  prospects: Record<string, Prospect>; // normalized phone -> Prospect
  logs: OutreachLogEntry[];
  objections: Array<{
    id: string;
    phone: string;
    doctorName: string;
    clinicName: string;
    objectionType: ObjectionType;
    doctorMessage: string;
    responseSent?: string;
    timestamp: string;
  }>;
}
