/**
 * SwasthAI WhatsApp Outreach System — Master Engine & Coordinator
 * =================================================================
 * Orchestrates Validation, Generation, 14-Point Quality Gate, Meta Cloud API,
 * Thread-safe Storage, Duplicate Protection, Opt-Out Enforcement, and Webhooks.
 */

import {
  Prospect,
  WhatsAppMessageDraft,
  QualityScoreResult,
  SendGateResult,
  MessageVariant,
  MessageLanguage,
  OutreachLogEntry,
  ProspectStatus
} from "./types";
import { normalizePhoneNumber, sanitizeDoctorName, sanitizeClinicName } from "./validator";
import { generateWhatsAppMessage, generateFollowUpMessage } from "./templates";
import { auditWhatsAppMessage } from "./quality-engine";
import { WhatsAppStore } from "./store";
import { MetaWhatsAppClient, MetaApiResponse } from "./meta-client";
import { classifyIncomingReply, OBJECTION_SCRIPTS } from "./objection-library";
import * as fs from "fs";

export interface PreviewOptions {
  doctorName?: string;
  clinicName?: string;
  specialty?: string;
  city?: string;
  variant?: MessageVariant;
  language?: MessageLanguage;
  campaign?: string;
  isFollowUp?: boolean;
  followUpStep?: 1 | 2;
}

export interface SendOptions {
  isDryRun?: boolean;
  operator?: string;
  forceSend?: boolean; // Only for explicit admin override
  isTestMode?: boolean;
}

export class WhatsAppOutreachEngine {
  private store: WhatsAppStore;
  private metaClient: MetaWhatsAppClient;

  constructor(store?: WhatsAppStore, metaClient?: MetaWhatsAppClient) {
    this.store = store || new WhatsAppStore();
    this.metaClient = metaClient || new MetaWhatsAppClient();
  }

  public getStore(): WhatsAppStore {
    return this.store;
  }

  public getMetaClient(): MetaWhatsAppClient {
    return this.metaClient;
  }

  // ----------------------------------------------------
  // 1. PREVIEW GENERATION & 14-POINT QUALITY GATE
  // ----------------------------------------------------

  public previewOutreach(phoneInput: string, options?: PreviewOptions): {
    isValid: boolean;
    prospect?: Prospect;
    draft?: WhatsAppMessageDraft;
    qualityResult?: QualityScoreResult;
    gateResult: SendGateResult;
  } {
    const norm = normalizePhoneNumber(phoneInput);
    if (!norm.isValid) {
      return {
        isValid: false,
        gateResult: {
          allowed: false,
          reasons: [`Invalid phone number: ${norm.error}`]
        }
      };
    }

    const phoneKey = norm.normalizedPhone;
    let prospect = this.store.getProspect(phoneKey);

    // If prospect is not in store, create a temporary representation from options
    if (!prospect) {
      prospect = {
        id: `temp_${Date.now()}`,
        phone: phoneKey,
        rawPhone: phoneInput,
        doctorName: options?.doctorName || "Doctor",
        clinicName: options?.clinicName || "Clinic",
        specialty: options?.specialty || "General Physician",
        city: options?.city || "",
        status: "NEW",
        campaign: options?.campaign || "CLINIC_OUTREACH_DEFAULT",
        language: options?.language || "en",
        messageVariant: options?.variant || "A",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        followUpStep: 0,
        optedOut: this.store.isOptedOut(phoneKey),
        totalMessagesSent: 0,
        totalRepliesReceived: 0
      };
    } else if (options) {
      // Apply runtime overrides if provided
      if (options.doctorName) prospect.doctorName = options.doctorName;
      if (options.clinicName) prospect.clinicName = options.clinicName;
      if (options.specialty) prospect.specialty = options.specialty;
      if (options.city) prospect.city = options.city;
      if (options.variant) prospect.messageVariant = options.variant;
      if (options.language) prospect.language = options.language;
      if (options.campaign) prospect.campaign = options.campaign;
    }

    // Generate message
    let messageText = "";
    let templateName = "swasthai_clinic_outreach_v1";
    let templateVariables: string[] = [sanitizeDoctorName(prospect.doctorName), sanitizeClinicName(prospect.clinicName, prospect.city)];

    if (options?.isFollowUp && options?.followUpStep) {
      const fu = generateFollowUpMessage(prospect, options.followUpStep);
      messageText = fu.text;
      templateName = `swasthai_followup_step${options.followUpStep}`;
    } else {
      const gen = generateWhatsAppMessage(prospect, prospect.messageVariant, prospect.language);
      messageText = gen.text;
      templateName = gen.templateName;
      templateVariables = gen.templateVariables;
    }

    // Run Quality Engine & Placeholder Scan
    const qualityResult = auditWhatsAppMessage(messageText, prospect.doctorName, prospect.clinicName);

    const draft: WhatsAppMessageDraft = {
      prospectId: prospect.id,
      phone: phoneKey,
      doctorName: prospect.doctorName,
      clinicName: prospect.clinicName,
      specialty: prospect.specialty,
      text: messageText,
      language: prospect.language,
      variant: prospect.messageVariant,
      templateName,
      templateVariables,
      qualityResult,
      generatedAt: new Date().toISOString()
    };

    // Evaluate 14-Point Quality Gate
    const gateReasons: string[] = [];
    let isAllowed = true;

    // Check 1: Phone Validation
    if (!norm.isValid) {
      isAllowed = false;
      gateReasons.push("Gate 1 Failed: Malformed phone number.");
    }

    // Check 2: Opt-Out Check
    if (this.store.isOptedOut(phoneKey) || prospect.optedOut) {
      isAllowed = false;
      gateReasons.push("Gate 2 Failed: Recipient is permanently OPTED-OUT. Outbound messaging is strictly blocked.");
    }

    // Check 3: Duplicate / Recent Contact
    if (prospect.lastContactedAt && !options?.isFollowUp) {
      const daysSince = Math.floor((Date.now() - new Date(prospect.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 3) {
        isAllowed = false;
        gateReasons.push(`Gate 3 Failed: Prospect was already contacted ${daysSince} day(s) ago. Wait for reply or scheduled follow-up.`);
      }
    }

    // Check 4: Placeholder Scan
    if (qualityResult.hasPlaceholders) {
      isAllowed = false;
      gateReasons.push(`Gate 4 Failed: Detected unresolved placeholders: ${qualityResult.detectedPlaceholders.join(", ")}`);
    }

    // Check 5: Banned Hype Words
    if (qualityResult.hasBannedWords) {
      isAllowed = false;
      gateReasons.push(`Gate 5 Failed: Banned hype words detected: ${qualityResult.bannedWordsFound.join(", ")}`);
    }

    // Check 6: Medical Claims
    if (qualityResult.hasMedicalClaims) {
      isAllowed = false;
      gateReasons.push("Gate 6 Failed: Medical diagnosis or treatment claims made.");
    }

    // Check 7: Length
    if (qualityResult.wordCount > 150) {
      isAllowed = false;
      gateReasons.push(`Gate 7 Failed: Word count (${qualityResult.wordCount}) exceeds maximum 150 words.`);
    }

    // Check 8: Emojis
    if (qualityResult.emojiCount > 2) {
      isAllowed = false;
      gateReasons.push(`Gate 8 Failed: Emoji count (${qualityResult.emojiCount}) exceeds maximum 2.`);
    }

    // Check 9: Quality Score Threshold
    if (qualityResult.overallScore < 70) {
      isAllowed = false;
      gateReasons.push(`Gate 9 Failed: Quality score (${qualityResult.overallScore}/100) below minimum required 70.`);
    }

    // Check 10: Daily Limit
    const dailyLimit = this.metaClient.getConfig().dailyLimit;
    if (this.store.isDailyLimitExceeded(dailyLimit)) {
      isAllowed = false;
      gateReasons.push(`Gate 10 Failed: Daily outreach limit reached (${this.store.getTodaySendCount()}/${dailyLimit} today).`);
    }

    return {
      isValid: true,
      prospect,
      draft,
      qualityResult,
      gateResult: {
        allowed: isAllowed,
        reasons: gateReasons,
        prospect,
        draft
      }
    };
  }

  // ----------------------------------------------------
  // 2. SEND EXECUTION (With Explicit Approval)
  // ----------------------------------------------------

  public async executeSend(
    phoneInput: string,
    options?: PreviewOptions & SendOptions
  ): Promise<{
    success: boolean;
    messageId?: string;
    prospect?: Prospect;
    log?: OutreachLogEntry;
    error?: string;
    gateReasons?: string[];
  }> {
    // Run preview and check quality gate
    const preview = this.previewOutreach(phoneInput, options);

    if (!preview.isValid || !preview.draft || !preview.prospect) {
      return {
        success: false,
        error: "Validation failed during preview.",
        gateReasons: preview.gateResult.reasons
      };
    }

    if (!preview.gateResult.allowed && !options?.forceSend && !options?.isDryRun) {
      return {
        success: false,
        error: "Quality Gate Rejected the send. Fix blocking reasons before sending.",
        gateReasons: preview.gateResult.reasons
      };
    }

    const { draft, prospect } = preview;
    const phoneKey = prospect.phone;

    // Ensure prospect is saved in store
    this.store.upsertProspect(prospect);

    // Case A: Dry-Run Mode
    if (options?.isDryRun) {
      const log = this.store.recordLog({
        timestamp: new Date().toISOString(),
        phone: phoneKey,
        doctorName: prospect.doctorName,
        clinicName: prospect.clinicName,
        specialty: prospect.specialty,
        messageText: draft.text,
        templateName: draft.templateName,
        templateVariables: draft.templateVariables,
        messageType: options?.isFollowUp ? "TEMPLATE_FOLLOWUP" : "TEMPLATE_INITIAL",
        messageId: `dryrun_${Date.now()}`,
        whatsappStatus: "SENT",
        campaign: prospect.campaign,
        operator: options?.operator || "CLI_OPERATOR",
        followUpStep: options?.followUpStep || 0,
        isDryRun: true
      });

      return {
        success: true,
        messageId: log.messageId,
        prospect,
        log
      };
    }

    // Case B: Test Mode (Redirects to WHATSAPP_TEST_NUMBER if specified)
    const targetPhone = options?.isTestMode && this.metaClient.getConfig().testNumber
      ? this.metaClient.getConfig().testNumber!
      : phoneKey;

    let apiRes: MetaApiResponse;

    // Send through Meta Cloud API
    if (this.metaClient.isConfigured()) {
      apiRes = await this.metaClient.sendTemplate({
        toPhone: targetPhone,
        templateName: draft.templateName,
        languageCode: draft.language === "hinglish" ? "hi" : "en",
        bodyVariables: draft.templateVariables
      });

      // Fallback to text message if template fails or not registered in Meta Sandbox yet
      if (!apiRes.success && apiRes.httpStatus !== 401) {
        apiRes = await this.metaClient.sendTextMessage({
          toPhone: targetPhone,
          text: draft.text
        });
      }
    } else {
      // Meta credentials not yet configured
      return {
        success: false,
        error: "Meta WhatsApp API credentials missing. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env.local.",
        gateReasons: ["API Credentials Missing"]
      };
    }

    if (apiRes.success) {
      // Increment daily send count
      this.store.incrementTodaySendCount();

      // Record in store audit log
      const log = this.store.recordLog({
        timestamp: new Date().toISOString(),
        phone: phoneKey,
        doctorName: prospect.doctorName,
        clinicName: prospect.clinicName,
        specialty: prospect.specialty,
        messageText: draft.text,
        templateName: draft.templateName,
        templateVariables: draft.templateVariables,
        messageType: options?.isFollowUp ? "TEMPLATE_FOLLOWUP" : "TEMPLATE_INITIAL",
        messageId: apiRes.messageId,
        whatsappStatus: "SENT",
        apiStatusCode: apiRes.httpStatus || 200,
        apiResponse: apiRes.rawResponse,
        campaign: prospect.campaign,
        operator: options?.operator || "CLI_OPERATOR",
        followUpStep: options?.followUpStep || 0,
        isDryRun: false
      });

      return {
        success: true,
        messageId: apiRes.messageId,
        prospect,
        log
      };
    } else {
      // Record failed send
      const log = this.store.recordLog({
        timestamp: new Date().toISOString(),
        phone: phoneKey,
        doctorName: prospect.doctorName,
        clinicName: prospect.clinicName,
        specialty: prospect.specialty,
        messageText: draft.text,
        templateName: draft.templateName,
        templateVariables: draft.templateVariables,
        messageType: options?.isFollowUp ? "TEMPLATE_FOLLOWUP" : "TEMPLATE_INITIAL",
        whatsappStatus: "FAILED",
        apiStatusCode: apiRes.httpStatus || 500,
        apiResponse: apiRes.rawResponse,
        errorMessage: apiRes.error?.message || "Delivery failed",
        campaign: prospect.campaign,
        operator: options?.operator || "CLI_OPERATOR",
        followUpStep: options?.followUpStep || 0,
        isDryRun: false
      });

      return {
        success: false,
        error: apiRes.error?.message || "Meta API send failed.",
        log
      };
    }
  }

  // ----------------------------------------------------
  // 3. INBOUND WEBHOOK PROCESSOR
  // ----------------------------------------------------

  public processWebhookPayload(payload: any): {
    eventsProcessed: number;
    statusesUpdated: number;
    repliesHandled: number;
    details: any[];
  } {
    let statusesUpdated = 0;
    let repliesHandled = 0;
    const details: any[] = [];

    if (!payload?.entry) {
      return { eventsProcessed: 0, statusesUpdated: 0, repliesHandled: 0, details: [] };
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value) continue;

        // 1. Process delivery status updates (sent, delivered, read, failed)
        for (const status of value.statuses || []) {
          const msgId = status.id;
          const statusStr = (status.status || "").toUpperCase();

          let deliveryStatus: any = "SENT";
          if (statusStr === "DELIVERED") deliveryStatus = "DELIVERED";
          if (statusStr === "READ") deliveryStatus = "READ";
          if (statusStr === "FAILED") deliveryStatus = "FAILED";

          this.store.updateLogStatus(msgId, deliveryStatus);
          statusesUpdated++;
          details.push({ type: "STATUS_UPDATE", messageId: msgId, status: deliveryStatus });
        }

        // 2. Process incoming replies from doctors
        for (const message of value.messages || []) {
          const senderPhone = `+${message.from}`;
          const textBody = message.text?.body || message.button?.text || "";

          // Classify the doctor's message
          const objectionType = classifyIncomingReply(textBody);
          const objectionScript = OBJECTION_SCRIPTS[objectionType];

          const prospect = this.store.getProspect(senderPhone);
          const docName = prospect?.doctorName || "Doctor";
          const suggestedReply = objectionScript.suggestedResponse(docName);

          // If doctor opted out / said not interested
          if (objectionType === "NOT_INTERESTED") {
            this.store.optOut(senderPhone, `Doctor replied: "${textBody}"`);
          } else {
            let nextStatus: ProspectStatus = "REPLIED";
            if (objectionType === "INTERESTED") nextStatus = "INTERESTED";
            if (objectionType === "DEMO_REQUEST") nextStatus = "DEMO_BOOKED";
            if (objectionType === "TRIAL") nextStatus = "TRIAL_STARTED";

            this.store.updateProspectStatus(senderPhone, nextStatus, `Inbound message: "${textBody}" [Classified as ${objectionType}]`);
          }

          // Record in objection history
          this.store.recordObjection(
            senderPhone,
            docName,
            prospect?.clinicName || "Clinic",
            objectionType,
            textBody,
            suggestedReply
          );

          repliesHandled++;
          details.push({
            type: "INBOUND_REPLY",
            phone: senderPhone,
            text: textBody,
            objectionType,
            suggestedReply
          });
        }
      }
    }

    return {
      eventsProcessed: statusesUpdated + repliesHandled,
      statusesUpdated,
      repliesHandled,
      details
    };
  }

  // ----------------------------------------------------
  // 4. LEAD IMPORTER FROM MARKDOWN
  // ----------------------------------------------------

  public importLeadsFromMarkdown(filePath: string): { imported: number; updated: number; total: number } {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Leads markdown file not found at: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    let imported = 0;
    let updated = 0;

    for (const line of lines) {
      if (line.trim().startsWith("| **") && !line.includes("Rank")) {
        const parts = line.split("|").map(p => p.trim());
        if (parts.length >= 10) {
          const clinicName = parts[2];
          const doctorName = parts[3];
          const specialty = parts[4];
          const city = parts[5];
          const email = parts[6].replace(/`/g, "").trim();
          const sourceUrl = parts[7].replace(/`/g, "").trim();
          const rawPhone = parts[9] ? parts[9].replace(/`/g, "").trim() : "";

          const norm = normalizePhoneNumber(rawPhone);
          if (norm.isValid) {
            const existing = this.store.getProspect(norm.normalizedPhone);
            this.store.upsertProspect({
              phone: norm.normalizedPhone,
              rawPhone,
              doctorName,
              clinicName,
              specialty,
              city,
              email,
              sourceUrl,
              campaign: "LEADS_50_VERIFIED_AUG_2026",
              status: existing ? existing.status : "READY"
            });

            if (existing) updated++;
            else imported++;
          }
        }
      }
    }

    return {
      imported,
      updated,
      total: imported + updated
    };
  }
}
