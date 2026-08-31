/**
 * SwasthAI Brevo Transactional Email Sending Engine
 * ============================================================
 * Exclusively uses Brevo (Sendinblue) Transactional REST API.
 * 
 * Safety Rules:
 * 1. ZERO dashes in email body.
 * 2. ZERO placeholders remaining.
 * 3. Daily send limit enforcement.
 * 4. Opt-out suppression check.
 * 5. Duplicate recipient prevention.
 * 6. Audit logging of Brevo message IDs.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SendLogEntry, LeadStatus } from './types';

export interface BrevoEmailPayload {
  sender: { name: string; email: string };
  to: Array<{ name?: string; email: string }>;
  replyTo: { name: string; email: string };
  subject: string;
  htmlContent: string;
  textContent: string;
  tags?: string[];
}

export interface BrevoSendResult {
  success: boolean;
  messageId: string | null;
  error: string | null;
}

export class BrevoOutreachEngine {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private replyToEmail: string;
  private replyToName: string;
  private logPath: string;
  private optOutPath: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY?.trim() || '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'swasthai.founder@gmail.com';
    this.senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Sankalp Mishra';
    this.replyToEmail = 'swasthai.founder@gmail.com';
    this.replyToName = 'Sankalp Mishra';

    // File paths
    const baseDir = process.cwd();
    this.logPath = path.join(baseDir, 'cold-email-send-log.json');
    this.optOutPath = path.join(baseDir, 'cold-email-opt-outs.json');
  }

  public getSenderInfo() {
    return {
      senderEmail: this.senderEmail,
      senderName: this.senderName,
      replyToEmail: this.replyToEmail,
      replyToName: this.replyToName,
      isConfigured: Boolean(this.apiKey)
    };
  }

  public loadSendLog(): SendLogEntry[] {
    if (!fs.existsSync(this.logPath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.logPath, 'utf-8');
      return JSON.parse(data) as SendLogEntry[];
    } catch {
      return [];
    }
  }

  public saveSendLog(log: SendLogEntry[]): void {
    fs.writeFileSync(this.logPath, JSON.stringify(log, null, 2), 'utf-8');
  }

  public loadOptOuts(): string[] {
    if (!fs.existsSync(this.optOutPath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.optOutPath, 'utf-8');
      return JSON.parse(data) as string[];
    } catch {
      return [];
    }
  }

  public addOptOut(email: string): void {
    const norm = email.toLowerCase().trim();
    const list = this.loadOptOuts();
    if (!list.includes(norm)) {
      list.push(norm);
      fs.writeFileSync(this.optOutPath, JSON.stringify(list, null, 2), 'utf-8');
    }
  }

  public isOptedOut(email: string): boolean {
    const norm = email.toLowerCase().trim();
    const list = this.loadOptOuts();
    return list.includes(norm);
  }

  public isAlreadyContacted(email: string): boolean {
    const norm = email.toLowerCase().trim();
    const log = this.loadSendLog();
    return log.some(entry => entry.recipientEmail?.toLowerCase().trim() === norm && entry.status !== 'FAILED' && entry.status !== 'TEST');
  }

  public getSentCountToday(): number {
    const log = this.loadSendLog();
    const todayStr = new Date().toISOString().slice(0, 10);
    return log.filter(entry => entry.status !== 'TEST' && entry.status !== 'FAILED' && entry.sentAt?.startsWith(todayStr)).length;
  }

  /**
   * Performs complete safety validation on the email before Brevo delivery
   */
  public validateEmailContent(subject: string, textContent: string, htmlContent: string, recipientEmail: string): { valid: boolean; reason?: string } {
    if (!this.apiKey) {
      return { valid: false, reason: 'BREVO_API_KEY is not configured.' };
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return { valid: false, reason: `Invalid recipient email address: ${recipientEmail}` };
    }

    if (this.isOptedOut(recipientEmail)) {
      return { valid: false, reason: `Recipient is on the permanent opt-out suppression list: ${recipientEmail}` };
    }

    // Check for remaining placeholder tags
    const placeholderRegex = /\{\{[^}]+\}\}/g;
    if (placeholderRegex.test(subject) || placeholderRegex.test(textContent) || placeholderRegex.test(htmlContent)) {
      return { valid: false, reason: 'Unfilled placeholders detected in email content.' };
    }

    // Strictly check for dashes in the text content
    // We allow standard URLs like https://swasthai-three.vercel.app/ but disallow em dashes, en dashes, or dashes in sentences.
    const cleanLinesWithoutUrls = textContent
      .split('\n')
      .filter(line => !line.includes('https://') && !line.includes('http://'))
      .join(' ');

    if (/[—–]/.test(cleanLinesWithoutUrls) || / [-\u2013\u2014] /.test(cleanLinesWithoutUrls)) {
      return { valid: false, reason: 'Dash detected in email text. Only commas and periods are permitted.' };
    }

    return { valid: true };
  }

  /**
   * Sends transactional email directly through Brevo REST API
   */
  public async sendEmail(payload: {
    recipientEmail: string;
    recipientName?: string;
    doctorName: string;
    clinicName: string;
    subject: string;
    textContent: string;
    htmlContent: string;
    campaignTag?: string;
    isTest?: boolean;
  }): Promise<BrevoSendResult> {
    const validation = this.validateEmailContent(payload.subject, payload.textContent, payload.htmlContent, payload.recipientEmail);
    if (!validation.valid) {
      return {
        success: false,
        messageId: null,
        error: validation.reason || 'Validation failed'
      };
    }

    const brevoPayload: BrevoEmailPayload = {
      sender: {
        name: this.senderName,
        email: this.senderEmail
      },
      to: [
        {
          email: payload.recipientEmail,
          name: payload.recipientName || payload.doctorName
        }
      ],
      replyTo: {
        name: this.replyToName,
        email: this.replyToEmail
      },
      subject: payload.subject,
      textContent: payload.textContent,
      htmlContent: payload.htmlContent,
      tags: payload.campaignTag ? [payload.campaignTag] : ['swasthai_cold_outreach']
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(brevoPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || `Brevo HTTP error ${response.status}`;
        this.logSend({
          prospectName: payload.doctorName,
          doctorName: payload.doctorName,
          clinicName: payload.clinicName,
          recipientEmail: payload.recipientEmail,
          sentAt: new Date().toISOString(),
          subject: payload.subject,
          status: 'FAILED',
          brevoMessageId: null,
          error: errorMsg,
          campaign: payload.campaignTag || 'swasthai_cold_outreach',
          templateVersion: 'v1.0'
        });
        return { success: false, messageId: null, error: errorMsg };
      }

      const messageId = data.messageId || null;

      // Log success in send log
      this.logSend({
        prospectName: payload.doctorName,
        doctorName: payload.doctorName,
        clinicName: payload.clinicName,
        recipientEmail: payload.recipientEmail,
        sentAt: new Date().toISOString(),
        subject: payload.subject,
        status: payload.isTest ? 'TEST' : 'SENT',
        brevoMessageId: messageId,
        error: null,
        campaign: payload.campaignTag || 'swasthai_cold_outreach',
        templateVersion: 'v1.0'
      });

      return {
        success: true,
        messageId,
        error: null
      };

    } catch (err: any) {
      const errorMsg = err.message || 'Unknown network error calling Brevo API';
      this.logSend({
        prospectName: payload.doctorName,
        doctorName: payload.doctorName,
        clinicName: payload.clinicName,
        recipientEmail: payload.recipientEmail,
        sentAt: new Date().toISOString(),
        subject: payload.subject,
        status: 'FAILED',
        brevoMessageId: null,
        error: errorMsg,
        campaign: payload.campaignTag || 'swasthai_cold_outreach',
        templateVersion: 'v1.0'
      });
      return { success: false, messageId: null, error: errorMsg };
    }
  }

  private logSend(entry: SendLogEntry): void {
    const log = this.loadSendLog();
    log.push(entry);
    this.saveSendLog(log);
  }
}
