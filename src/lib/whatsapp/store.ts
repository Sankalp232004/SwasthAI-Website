/**
 * SwasthAI WhatsApp Outreach System — CRM Data Store & Persistence Engine
 * =========================================================================
 * Thread-safe JSON database for prospects, audit logs, opt-outs, and follow-ups.
 */

import * as fs from "fs";
import * as path from "path";
import {
  Prospect,
  OutreachLogEntry,
  WhatsAppStoreData,
  ObjectionType,
  ProspectStatus,
  MessageDeliveryStatus
} from "./types";
import { normalizePhoneNumber } from "./validator";

// Persistent store path inside website/data
const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "whatsapp-outreach-store.json");

/**
 * Gets current date string in Asia/Kolkata (IST) timezone (YYYY-MM-DD)
 */
export function getKolkataDateString(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  const formatter = new Intl.DateTimeFormat("en-CA", options); // en-CA gives YYYY-MM-DD
  return formatter.format(now);
}

/**
 * Initial empty store structure
 */
function createInitialStore(): WhatsAppStoreData {
  return {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    dailySendCounts: {},
    optedOutNumbers: {},
    prospects: {},
    logs: [],
    objections: []
  };
}

export class WhatsAppStore {
  private data: WhatsAppStoreData;
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || STORE_FILE;
    this.data = this.loadStore();
  }

  private loadStore(): WhatsAppStoreData {
    try {
      if (!fs.existsSync(STORE_DIR)) {
        fs.mkdirSync(STORE_DIR, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not load WhatsApp store from disk, initializing fresh store:", err);
    }
    const initial = createInitialStore();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: WhatsAppStoreData): void {
    try {
      const data = dataToSave || this.data;
      data.lastUpdated = new Date().toISOString();
      if (!fs.existsSync(STORE_DIR)) {
        fs.mkdirSync(STORE_DIR, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write WhatsApp store to disk:", err);
    }
  }

  public getRawData(): WhatsAppStoreData {
    return this.data;
  }

  // ----------------------------------------------------
  // PROSPECT OPERATIONS
  // ----------------------------------------------------

  public getProspect(phone: string): Prospect | undefined {
    const norm = normalizePhoneNumber(phone);
    if (!norm.isValid) return undefined;
    return this.data.prospects[norm.normalizedPhone];
  }

  public upsertProspect(prospect: Partial<Prospect> & { phone: string }): Prospect {
    const norm = normalizePhoneNumber(prospect.phone);
    if (!norm.isValid) {
      throw new Error(`Cannot upsert prospect with invalid phone: ${norm.error}`);
    }

    const phoneKey = norm.normalizedPhone;
    const existing = this.data.prospects[phoneKey];
    const now = new Date().toISOString();

    const isOptedOut = Boolean(
      this.data.optedOutNumbers[phoneKey] || prospect.optedOut || existing?.optedOut
    );

    const updated: Prospect = {
      id: existing?.id || `prospect_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      phone: phoneKey,
      rawPhone: prospect.rawPhone || existing?.rawPhone || prospect.phone,
      doctorName: prospect.doctorName || existing?.doctorName || "Doctor",
      clinicName: prospect.clinicName || existing?.clinicName || "Clinic",
      specialty: prospect.specialty || existing?.specialty || "General Physician",
      city: prospect.city || existing?.city || "",
      area: prospect.area || existing?.area,
      website: prospect.website || existing?.website,
      email: prospect.email || existing?.email,
      sourceUrl: prospect.sourceUrl || existing?.sourceUrl,
      notes: prospect.notes || existing?.notes,
      status: isOptedOut ? "OPTED_OUT" : (prospect.status || existing?.status || "NEW"),
      campaign: prospect.campaign || existing?.campaign || "CLINIC_OUTREACH_DEFAULT",
      language: prospect.language || existing?.language || "en",
      messageVariant: prospect.messageVariant || existing?.messageVariant || "A",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      lastContactedAt: prospect.lastContactedAt || existing?.lastContactedAt,
      followUpStep: prospect.followUpStep !== undefined ? prospect.followUpStep : (existing?.followUpStep || 0),
      nextFollowUpDue: prospect.nextFollowUpDue || existing?.nextFollowUpDue,
      optedOut: isOptedOut,
      optedOutAt: isOptedOut ? (existing?.optedOutAt || now) : undefined,
      optOutReason: prospect.optOutReason || existing?.optOutReason,
      totalMessagesSent: existing?.totalMessagesSent || 0,
      totalRepliesReceived: existing?.totalRepliesReceived || 0
    };

    this.data.prospects[phoneKey] = updated;
    this.persist();
    return updated;
  }

  public updateProspectStatus(phone: string, status: ProspectStatus, notes?: string): Prospect | undefined {
    const norm = normalizePhoneNumber(phone);
    if (!norm.isValid) return undefined;
    const p = this.data.prospects[norm.normalizedPhone];
    if (!p) return undefined;

    p.status = status;
    p.updatedAt = new Date().toISOString();
    if (notes) {
      p.notes = p.notes ? `${p.notes}\n[${new Date().toISOString()}] ${notes}` : notes;
    }
    this.persist();
    return p;
  }

  public getAllProspects(): Prospect[] {
    return Object.values(this.data.prospects);
  }

  // ----------------------------------------------------
  // OPT-OUT MANAGEMENT
  // ----------------------------------------------------

  public optOut(phone: string, reason: string = "User requested opt-out"): boolean {
    const norm = normalizePhoneNumber(phone);
    if (!norm.isValid) return false;

    const phoneKey = norm.normalizedPhone;
    const now = new Date().toISOString();

    this.data.optedOutNumbers[phoneKey] = {
      optedOutAt: now,
      reason
    };

    if (this.data.prospects[phoneKey]) {
      this.data.prospects[phoneKey].optedOut = true;
      this.data.prospects[phoneKey].optedOutAt = now;
      this.data.prospects[phoneKey].optOutReason = reason;
      this.data.prospects[phoneKey].status = "OPTED_OUT";
      this.data.prospects[phoneKey].nextFollowUpDue = undefined;
    }

    this.persist();
    return true;
  }

  public resumeContact(phone: string): boolean {
    const norm = normalizePhoneNumber(phone);
    if (!norm.isValid) return false;

    const phoneKey = norm.normalizedPhone;
    delete this.data.optedOutNumbers[phoneKey];

    if (this.data.prospects[phoneKey]) {
      this.data.prospects[phoneKey].optedOut = false;
      this.data.prospects[phoneKey].optedOutAt = undefined;
      this.data.prospects[phoneKey].optOutReason = undefined;
      this.data.prospects[phoneKey].status = "READY";
      this.data.prospects[phoneKey].updatedAt = new Date().toISOString();
    }

    this.persist();
    return true;
  }

  public isOptedOut(phone: string): boolean {
    const norm = normalizePhoneNumber(phone);
    if (!norm.isValid) return false;
    return Boolean(this.data.optedOutNumbers[norm.normalizedPhone]);
  }

  // ----------------------------------------------------
  // DAILY SEND LIMITS (Asia/Kolkata Timezone)
  // ----------------------------------------------------

  public getTodaySendCount(): number {
    const today = getKolkataDateString();
    return this.data.dailySendCounts[today] || 0;
  }

  public incrementTodaySendCount(): number {
    const today = getKolkataDateString();
    const current = this.data.dailySendCounts[today] || 0;
    this.data.dailySendCounts[today] = current + 1;
    this.persist();
    return this.data.dailySendCounts[today];
  }

  public isDailyLimitExceeded(maxLimit: number = 10): boolean {
    return this.getTodaySendCount() >= maxLimit;
  }

  // ----------------------------------------------------
  // AUDIT LOGGING & SEND RECORDING
  // ----------------------------------------------------

  public recordLog(entry: Omit<OutreachLogEntry, "id">): OutreachLogEntry {
    const log: OutreachLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...entry
    };

    this.data.logs.unshift(log); // Prepend to keep newest first

    // Update prospect stats if applicable
    const norm = normalizePhoneNumber(entry.phone);
    if (norm.isValid && this.data.prospects[norm.normalizedPhone] && !entry.isDryRun && entry.whatsappStatus === "SENT") {
      const p = this.data.prospects[norm.normalizedPhone];
      p.lastContactedAt = entry.timestamp;
      p.totalMessagesSent = (p.totalMessagesSent || 0) + 1;
      p.status = entry.followUpStep > 0 ? "SENT" : "SENT";
      p.followUpStep = entry.followUpStep;
      
      // Schedule next follow-up if initial send
      if (entry.followUpStep === 0) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 3); // 3 days later
        p.nextFollowUpDue = nextDate.toISOString();
      } else if (entry.followUpStep === 1) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 5); // 5 days later (total 8 days)
        p.nextFollowUpDue = nextDate.toISOString();
      } else {
        p.nextFollowUpDue = undefined; // Sequence finished
      }
    }

    this.persist();
    return log;
  }

  public getRecentLogs(limit: number = 10): OutreachLogEntry[] {
    return this.data.logs.slice(0, limit);
  }

  public updateLogStatus(messageId: string, status: MessageDeliveryStatus): boolean {
    const log = this.data.logs.find(l => l.messageId === messageId);
    if (log) {
      log.whatsappStatus = status;
      this.persist();
      return true;
    }
    return false;
  }

  // ----------------------------------------------------
  // OBJECTION TRACKING
  // ----------------------------------------------------

  public recordObjection(
    phone: string,
    doctorName: string,
    clinicName: string,
    objectionType: ObjectionType,
    doctorMessage: string,
    responseSent?: string
  ): void {
    this.data.objections.push({
      id: `obj_${Date.now()}`,
      phone,
      doctorName,
      clinicName,
      objectionType,
      doctorMessage,
      responseSent,
      timestamp: new Date().toISOString()
    });
    this.persist();
  }

  public getObjectionStats(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const obj of this.data.objections) {
      counts[obj.objectionType] = (counts[obj.objectionType] || 0) + 1;
    }
    return counts;
  }

  // ----------------------------------------------------
  // FOLLOW-UP QUEUE
  // ----------------------------------------------------

  public getDueFollowUps(): Prospect[] {
    const now = new Date();
    return Object.values(this.data.prospects).filter(p => {
      if (p.optedOut) return false;
      if (["REPLIED", "INTERESTED", "DEMO_BOOKED", "PAID", "NOT_INTERESTED"].includes(p.status)) return false;
      if (!p.nextFollowUpDue) return false;
      return new Date(p.nextFollowUpDue) <= now && p.followUpStep < 2;
    });
  }

  // ----------------------------------------------------
  // SUMMARY METRICS
  // ----------------------------------------------------

  public getOutreachSummary() {
    const prospects = Object.values(this.data.prospects);
    const totalProspects = prospects.length;
    const sentCount = prospects.filter(p => (p.totalMessagesSent || 0) > 0).length;
    const repliedCount = prospects.filter(p => ["REPLIED", "INTERESTED", "DEMO_BOOKED", "TRIAL_STARTED", "PAID"].includes(p.status)).length;
    const demoCount = prospects.filter(p => ["DEMO_BOOKED", "DEMO_COMPLETED", "TRIAL_STARTED", "PAID"].includes(p.status)).length;
    const trialCount = prospects.filter(p => ["TRIAL_STARTED", "TRIAL_COMPLETED", "PAID"].includes(p.status)).length;
    const paidCount = prospects.filter(p => p.status === "PAID").length;
    const optOutCount = Object.keys(this.data.optedOutNumbers).length;

    const replyRate = sentCount > 0 ? ((repliedCount / sentCount) * 100).toFixed(1) + "%" : "0.0%";
    const demoRate = sentCount > 0 ? ((demoCount / sentCount) * 100).toFixed(1) + "%" : "0.0%";

    return {
      totalProspects,
      sentCount,
      repliedCount,
      replyRate,
      demoCount,
      demoRate,
      trialCount,
      paidCount,
      optOutCount,
      todaySent: this.getTodaySendCount()
    };
  }
}
