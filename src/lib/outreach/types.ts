/**
 * SwasthAI Cold Email System - TypeScript Types & Schemas
 */

export type VerificationStatus = 'VERIFIED' | 'LIKELY_VALID' | 'UNVERIFIED' | 'INVALID';

export type LeadStatus = 
  | 'QUEUED'
  | 'TEST'
  | 'SENT'
  | 'DELIVERED'
  | 'BOUNCED'
  | 'FAILED'
  | 'REPLIED'
  | 'INTERESTED'
  | 'DEMO'
  | 'TRIAL'
  | 'PAID'
  | 'OPTED_OUT'
  | 'BLOCKED';

export type ReplyClassification = 
  | 'INTERESTED'
  | 'SEND_DEMO'
  | 'PRICE'
  | 'TRIAL'
  | 'NOT_INTERESTED'
  | 'BUSY'
  | 'WRONG_PERSON'
  | 'REFERRAL'
  | 'OPT_OUT'
  | 'OTHER';

export interface ProspectLead {
  rank: number;
  doctorName: string;
  clinicName: string;
  specialty: string;
  city: string;
  area: string;
  email: string;
  phone?: string;
  website: string;
  sourceUrl: string;
  verifiedAt: string;
  verificationMethod: string;
  verificationStatus: VerificationStatus;
  verifiedObservation: string;
  campaignAngle: string;
  subjectVariants: {
    A: string;
    B: string;
    C: string;
  };
  selectedSubject: string;
  emailBody: string;
  plainTextBody: string;
  htmlBody: string;
  status: LeadStatus;
  notes?: string;
}

export interface SendLogEntry {
  prospectName: string;
  doctorName: string;
  clinicName: string;
  recipientEmail: string;
  sentAt: string;
  subject: string;
  status: LeadStatus;
  brevoMessageId: string | null;
  error: string | null;
  campaign: string;
  templateVersion: string;
  bounce?: boolean;
  reply?: boolean;
  replyClassification?: ReplyClassification;
  followUpDue?: string;
  optedOut?: boolean;
}

export interface OutreachStats {
  totalProspects: number;
  verifiedProspects: number;
  likelyValidProspects: number;
  unverifiedProspects: number;
  invalidProspects: number;
  sentTotal: number;
  sentToday: number;
  dailyLimit: number;
  remainingToday: number;
  deliveredTotal: number;
  bouncedTotal: number;
  repliedTotal: number;
  positiveReplies: number;
  demosBooked: number;
  trialsStarted: number;
  paidClinics: number;
  optedOutTotal: number;
}
