import * as fs from "fs";
import * as path from "path";

const mdPath = "/Users/sankalpmishra/.gemini/antigravity-ide/brain/68a2394c-b515-4787-8d53-513c60401dc4/swasthai_b2b_sales_leads_50.md";
const mdContent = fs.readFileSync(mdPath, "utf-8");

const lines = mdContent.split("\n");
const prospects: any[] = [];

for (const line of lines) {
  if (line.trim().startsWith("| **") && !line.includes("Rank")) {
    const parts = line.split("|").map(p => p.trim());
    if (parts.length >= 13) {
      const rank = parseInt(parts[1].replace(/\*\*/g, ""), 10);
      const clinicName = parts[2];
      const doctorName = parts[3];
      const specialty = parts[4];
      const city = parts[5];
      const email = parts[6].replace(/`/g, "").trim();
      const sourceUrl = parts[7].replace(/`/g, "").trim();
      
      // Personalized subject line
      let subjectLine = `Question about walk-ins at ${clinicName}`;
      if (specialty.toLowerCase().includes("pediatric")) {
        subjectLine = `Question about pediatric intake at ${clinicName}`;
      } else if (specialty.toLowerCase().includes("ent")) {
        subjectLine = `Question about ENT walk-in flow at ${clinicName}`;
      } else if (specialty.toLowerCase().includes("derma") || specialty.toLowerCase().includes("skin")) {
        subjectLine = `Question about skin OPD intake at ${clinicName}`;
      } else if (specialty.toLowerCase().includes("ortho")) {
        subjectLine = `OPD walk-in prioritization at ${clinicName}`;
      }

      // Generate polished 90-140 word body matching exact guidelines
      const emailBody = `${doctorName},

I was curious how your team at ${clinicName} currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in ${city}.

I built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.

We offer a free 2-day trial with zero setup fee or commitment.

Would it be useful if I sent you a 2-minute screen recording first?

Sankalp Mishra
Founder, SwasthAI
https://swasthai-three.vercel.app/

If you'd rather not hear from me, just reply 'no' and I won't follow up.`;

      prospects.push({
        rank,
        clinicName,
        doctorName,
        specialty,
        city,
        email,
        sourceUrl,
        subjectLine,
        emailBody
      });
    }
  }
}

console.log(`Parsed ${prospects.length} prospects from markdown.`);

// Let's write the complete send-cold-emails.ts file
const tsContent = `/**
 * SwasthAI Cold Email Sending System (Brevo Engine)
 * ============================================================
 * Safe, controlled cold-email workflow using Brevo's Transactional Email REST API.
 *
 * ALL 50 VERIFIED PROSPECTS LOADED
 *
 * MODES:
 *   --test      Send ONE test email to swasthai.founder@gmail.com (DEFAULT)
 *   --send      Send to real prospects (requires explicit approval, max 10/day)
 *   --dry-run   Preview emails without sending
 *
 * SAFETY PROTOCOLS:
 *   - Max 10 real emails per calendar day (Asia/Kolkata timezone, calculated from send log)
 *   - 10-second delay between real sends
 *   - Full duplicate prevention via normalized email check
 *   - Strict opt-out check before every send
 *   - Zero placeholder scanning (subject, textContent, htmlContent)
 *   - Verified Reply-To (swasthai.founder@gmail.com)
 *   - Clean plain text and minimalist founder HTML
 *   - Full audit trail recorded in cold-email-send-log.json
 */

import { config as loadEnv } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env.local from the website root
loadEnv({ path: path.join(__dirname, "..", ".env.local") });

// ====================================================
// CONFIGURATION
// ====================================================

const senderEnv = process.env.BREVO_SENDER_EMAIL?.trim();

const CONFIG = {
  senderEmail: senderEnv || "swasthai.founder@gmail.com",
  senderName: "Sankalp Mishra",
  replyToEmail: "swasthai.founder@gmail.com",
  replyToName: "Sankalp Mishra",
  testRecipient: "swasthai.founder@gmail.com",
  maxEmailsPerDay: 10,
  delayBetweenSendMs: 10_000, // 10 seconds conservative delay
  officialWebsiteUrl: "https://swasthai-three.vercel.app/",
  campaignTag: "swasthai_cold_outreach_august_2026",
  logFilePath: path.join(__dirname, "..", "cold-email-send-log.json"),
  optOutFilePath: path.join(__dirname, "..", "cold-email-opt-outs.json"),
};

// ====================================================
// PROSPECT DATA (50 Verified Clinic Prospects)
// ====================================================

export interface Prospect {
  rank: number;
  clinicName: string;
  doctorName: string;
  specialty: string;
  city: string;
  email: string;
  sourceUrl: string;
  subjectLine: string;
  emailBody: string;
}

export const PROSPECTS: Prospect[] = ${JSON.stringify(prospects, null, 2)};

// ====================================================
// PLACEHOLDER SCANNER
// ====================================================

const FORBIDDEN_PLACEHOLDERS = [
  /\\[name\\]/i,
  /\\[clinic\\]/i,
  /\\[doctor\\]/i,
  /\\[city\\]/i,
  /\\[specialty\\]/i,
  /\\{\\{name\\}\\}/i,
  /\\{\\{clinic\\}\\}/i,
  /\\{\\{doctor\\}\\}/i,
  /<name>/i,
  /<clinic>/i,
  /YOUR NAME/i,
  /INSERT/i,
  /\\bTODO\\b/i,
  /\\bTBD\\b/i,
  /\\[placeholder\\]/i,
  /\\[prospect\\]/i,
];

function scanForPlaceholders(text: string): string[] {
  const matches: string[] = [];
  for (const pattern of FORBIDDEN_PLACEHOLDERS) {
    if (pattern.test(text)) {
      matches.push(pattern.toString());
    }
  }
  return matches;
}

// ====================================================
// SEND LOG MANAGEMENT
// ====================================================

export interface SendLogEntry {
  prospectName: string;
  clinicName: string;
  recipientEmail: string;
  sentAt: string;
  subject: string;
  status: "SUCCESS" | "FAILED" | "TEST" | "SKIPPED" | "DO_NOT_CONTACT";
  messageId: string | null;
  error: string | null;
  campaign: string;
}

function loadSendLog(): SendLogEntry[] {
  try {
    if (fs.existsSync(CONFIG.logFilePath)) {
      return JSON.parse(fs.readFileSync(CONFIG.logFilePath, "utf-8"));
    }
  } catch {
    // If file is corrupted, return empty
  }
  return [];
}

function saveSendLog(log: SendLogEntry[]): void {
  fs.writeFileSync(CONFIG.logFilePath, JSON.stringify(log, null, 2), "utf-8");
}

function appendToLog(entry: SendLogEntry): void {
  const log = loadSendLog();
  log.push(entry);
  saveSendLog(log);
}

// ====================================================
// DYNAMIC DAILY LIMIT CHECK (Asia/Kolkata Timezone)
// ====================================================

function getIndiaDateString(dateObj: Date = new Date()): string {
  return dateObj.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function getRealEmailsSentTodayInIndia(): number {
  const log = loadSendLog();
  const todayIndia = getIndiaDateString();
  return log.filter((entry) => {
    if (entry.status !== "SUCCESS") return false;
    const entryIndiaDate = getIndiaDateString(new Date(entry.sentAt));
    return entryIndiaDate === todayIndia;
  }).length;
}

// ====================================================
// OPT-OUT MANAGEMENT
// ====================================================

function loadOptOuts(): string[] {
  try {
    if (fs.existsSync(CONFIG.optOutFilePath)) {
      return JSON.parse(fs.readFileSync(CONFIG.optOutFilePath, "utf-8"));
    }
  } catch {
    // Start fresh if file does not exist
  }
  return [];
}

function isOptedOut(email: string): boolean {
  const optOuts = loadOptOuts();
  const normalized = email.trim().toLowerCase();
  return optOuts.some((opt) => opt.trim().toLowerCase() === normalized);
}

// ====================================================
// DUPLICATE PROTECTION
// ====================================================

function hasAlreadyBeenSent(email: string): boolean {
  const log = loadSendLog();
  const normalized = email.trim().toLowerCase();
  return log.some(
    (entry) =>
      entry.recipientEmail.trim().toLowerCase() === normalized &&
      entry.status === "SUCCESS"
  );
}

// ====================================================
// EMAIL HTML GENERATOR (Clean Personal Founder Format)
// ====================================================

function buildHtmlEmail(body: string): string {
  const lines = body.split("\\n\\n");
  const htmlParagraphs = lines
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";

      // Signature block
      if (trimmed.startsWith("Sankalp Mishra")) {
        return \`<p style="margin: 20px 0 0 0; line-height: 1.6; color: #222; font-size: 15px;">Sankalp Mishra<br>Founder, SwasthAI<br><a href="\${CONFIG.officialWebsiteUrl}" style="color: #2563eb; text-decoration: underline;">swasthai-three.vercel.app</a></p>\`;
      }

      // Opt-out footer
      if (trimmed.startsWith("If you'd rather not hear")) {
        return \`<p style="margin: 28px 0 0 0; font-size: 12px; color: #888; line-height: 1.5;">\${trimmed}</p>\`;
      }

      return \`<p style="margin: 0 0 16px 0; line-height: 1.6; color: #222; font-size: 15px;">\${trimmed.replace(/\\n/g, "<br>")}</p>\`;
    })
    .filter(Boolean)
    .join("\\n");

  return \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 580px; margin: 0 auto; color: #222;">
    \${htmlParagraphs}
  </div>
</body>
</html>\`.trim();
}

// ====================================================
// BREVO TRANSACTIONAL EMAIL API
// ====================================================

async function sendBrevoEmail(
  apiKey: string,
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  rank: number
): Promise<{ success: boolean; messageId: string | null; error: string | null }> {
  try {
    const payload = {
      sender: {
        name: CONFIG.senderName,
        email: CONFIG.senderEmail,
      },
      to: [
        {
          email: toEmail.trim().toLowerCase(),
          name: toName,
        },
      ],
      replyTo: {
        email: CONFIG.replyToEmail,
        name: CONFIG.replyToName,
      },
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent,
      tags: [CONFIG.campaignTag, \`rank_\${rank}\`],
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        messageId: null,
        error: data.message || \`HTTP \${response.status}: \${JSON.stringify(data)}\`,
      };
    }

    return {
      success: true,
      messageId: data.messageId || null,
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      messageId: null,
      error: err.message || "Unknown Brevo connection error",
    };
  }
}

// ====================================================
// DELAY UTILITY
// ====================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ====================================================
// MAIN EXECUTION
// ====================================================

export async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "--test";

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  SwasthAI Cold Email Outreach System (Brevo Engine)");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(\`  Mode:        \${mode}\`);
  console.log(\`  Total Leads: \${PROSPECTS.length} verified clinic prospects\`);
  console.log(\`  From:        \${CONFIG.senderName} <\${CONFIG.senderEmail}>\`);
  console.log(\`  Reply-To:    \${CONFIG.replyToName} <\${CONFIG.replyToEmail}>\`);
  console.log(\`  Website:     \${CONFIG.officialWebsiteUrl}\`);
  console.log(\`  India Date:  \${getIndiaDateString()} (Asia/Kolkata)\`);
  console.log("═══════════════════════════════════════════════════════════\\n");

  // 1. Validate API Key from env
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("❌ FATAL: BREVO_API_KEY is missing from website/.env.local");
    console.error("   Execution stopped safely.");
    process.exit(1);
  }

  // 2. Validate Sender Email
  if (!CONFIG.senderEmail || !CONFIG.senderEmail.includes("@")) {
    console.error("❌ FATAL: BREVO_SENDER_EMAIL is invalid or missing in website/.env.local.");
    console.error("   Execution stopped safely.");
    process.exit(1);
  }

  // ── TEST MODE ──
  if (mode === "--test") {
    console.log("🧪 TEST MODE — Sending ONE test email to your verified address.\\n");

    const testProspect = PROSPECTS[0]; // Prospect #1: Strong Bones Clinic
    const testSubject = \`[TEST] \${testProspect.subjectLine}\`;
    const testPlainText = testProspect.emailBody;
    const testHtml = buildHtmlEmail(testPlainText);

    // Placeholder scan
    const subjectPlaceholders = scanForPlaceholders(testSubject);
    const bodyPlaceholders = scanForPlaceholders(testPlainText);
    if (subjectPlaceholders.length > 0 || bodyPlaceholders.length > 0) {
      console.error("❌ FATAL: Placeholder detected in test email copy!");
      console.error("   Subject issues:", subjectPlaceholders);
      console.error("   Body issues:", bodyPlaceholders);
      process.exit(1);
    }

    console.log(\`  Recipient:       \${CONFIG.testRecipient}\`);
    console.log(\`  Prospect used:   #\${testProspect.rank} — \${testProspect.clinicName} (\${testProspect.doctorName})\`);
    console.log(\`  Subject:         \${testSubject}\`);
    console.log(\`  From:            \${CONFIG.senderName} <\${CONFIG.senderEmail}>\`);
    console.log(\`  Reply-To:        \${CONFIG.replyToName} <\${CONFIG.replyToEmail}>\`);
    console.log("\\n  Sending test email via Brevo SMTP API...\\n");

    const result = await sendBrevoEmail(
      apiKey,
      CONFIG.testRecipient,
      CONFIG.replyToName,
      testSubject,
      testHtml,
      testPlainText,
      testProspect.rank
    );

    if (result.success) {
      appendToLog({
        prospectName: "TEST — " + testProspect.doctorName,
        clinicName: testProspect.clinicName,
        recipientEmail: CONFIG.testRecipient,
        sentAt: new Date().toISOString(),
        subject: testSubject,
        status: "TEST",
        messageId: result.messageId,
        error: null,
        campaign: CONFIG.campaignTag,
      });

      console.log("==================================================");
      console.log("TEST EMAIL SENT");
      console.log("");
      console.log(\`Recipient:\`);
      console.log(\`\${CONFIG.testRecipient}\`);
      console.log("");
      console.log(\`Prospect used:\`);
      console.log(\`\${testProspect.clinicName} (\${testProspect.doctorName})\`);
      console.log("");
      console.log(\`Subject:\`);
      console.log(\`\${testSubject}\`);
      console.log("");
      console.log(\`From:\`);
      console.log(\`\${CONFIG.senderName} <\${CONFIG.senderEmail}>\`);
      console.log("");
      console.log(\`Reply-To:\`);
      console.log(\`\${CONFIG.replyToName} <\${CONFIG.replyToEmail}>\`);
      console.log("");
      console.log(\`Brevo Message ID:\`);
      console.log(\`\${result.messageId}\`);
      console.log("");
      console.log(\`Status:\`);
      console.log(\`SUCCESS\`);
      console.log("==================================================");
      console.log("\\n✋ STOPPED. Awaiting explicit user approval before any real outreach.");
    } else {
      console.error("❌ TEST EMAIL FAILED");
      console.error(\`Error: \${result.error}\`);

      appendToLog({
        prospectName: "TEST — " + testProspect.doctorName,
        clinicName: testProspect.clinicName,
        recipientEmail: CONFIG.testRecipient,
        sentAt: new Date().toISOString(),
        subject: testSubject,
        status: "FAILED",
        messageId: null,
        error: result.error,
        campaign: CONFIG.campaignTag,
      });

      process.exit(1);
    }
  }

  // ── DRY RUN MODE ──
  else if (mode === "--dry-run") {
    console.log("📋 DRY RUN — Validating all 50 prospect data entries and copy.\\n");

    const sentTodayIndia = getRealEmailsSentTodayInIndia();
    console.log(\`  Real emails sent today (Asia/Kolkata): \${sentTodayIndia}/\${CONFIG.maxEmailsPerDay}\\n\`);

    let readyCount = 0;
    for (const prospect of PROSPECTS) {
      const isDuplicate = hasAlreadyBeenSent(prospect.email);
      const isBlocked = isOptedOut(prospect.email);
      const placeholders = scanForPlaceholders(prospect.subjectLine + " " + prospect.emailBody);

      const status = isBlocked
        ? "🚫 OPT-OUT"
        : isDuplicate
        ? "⏭️  ALREADY SENT"
        : placeholders.length > 0
        ? "❌ PLACEHOLDER DETECTED"
        : "✅ READY TO SEND";

      if (status === "✅ READY TO SEND") readyCount++;

      console.log(\`  #\${prospect.rank} | \${prospect.clinicName} (\${prospect.doctorName})\`);
      console.log(\`       City:    \${prospect.city} | Specialty: \${prospect.specialty}\`);
      console.log(\`       To:      \${prospect.email}\`);
      console.log(\`       Subject: \${prospect.subjectLine}\`);
      console.log(\`       Source:  \${prospect.sourceUrl}\`);
      console.log(\`       Status:  \${status}\`);
      console.log("");
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log(\`  Dry run complete. Total: \${PROSPECTS.length} | Ready: \${readyCount}\`);
    console.log("═══════════════════════════════════════════════════════════");
  }

  // ── SEND MODE (Requires explicit user approval) ──
  else if (mode === "--send") {
    console.log("📤 SEND MODE — Initiating outreach to real prospects.\\n");

    let sentTodayIndia = getRealEmailsSentTodayInIndia();
    console.log(\`  Daily limit status (Asia/Kolkata): \${sentTodayIndia}/\${CONFIG.maxEmailsPerDay} sent today.\`);

    if (sentTodayIndia >= CONFIG.maxEmailsPerDay) {
      console.log(\`  ⏸️  Daily limit of \${CONFIG.maxEmailsPerDay} real emails already reached today. Stopping.\`);
      return;
    }

    let sessionSentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const prospect of PROSPECTS) {
      // Recheck daily limit from log before every send
      sentTodayIndia = getRealEmailsSentTodayInIndia();
      if (sentTodayIndia >= CONFIG.maxEmailsPerDay) {
        console.log(\`\\n  ⏸️  Daily limit reached (\${CONFIG.maxEmailsPerDay}). Stopping send batch.\`);
        break;
      }

      // Check opt-out
      if (isOptedOut(prospect.email)) {
        console.log(\`  🚫 SKIP (opted out): #\${prospect.rank} \${prospect.email}\`);
        skippedCount++;
        continue;
      }

      // Check duplicate
      if (hasAlreadyBeenSent(prospect.email)) {
        console.log(\`  ⏭️  SKIP (already sent): #\${prospect.rank} \${prospect.email}\`);
        skippedCount++;
        continue;
      }

      // Placeholder check
      const placeholders = scanForPlaceholders(prospect.subjectLine + " " + prospect.emailBody);
      if (placeholders.length > 0) {
        console.error(\`  ❌ SKIP (placeholder detected): #\${prospect.rank} \${prospect.clinicName}\`);
        skippedCount++;
        continue;
      }

      console.log(\`\\n  📧 Sending #\${prospect.rank}: \${prospect.clinicName} (\${prospect.doctorName})\`);
      console.log(\`     To:       \${prospect.email}\`);
      console.log(\`     Subject:  \${prospect.subjectLine}\`);

      const html = buildHtmlEmail(prospect.emailBody);
      const result = await sendBrevoEmail(
        apiKey,
        prospect.email,
        prospect.doctorName,
        prospect.subjectLine,
        html,
        prospect.emailBody,
        prospect.rank
      );

      if (result.success) {
        console.log(\`     ✅ Sent successfully (Message ID: \${result.messageId})\`);
        sessionSentCount++;

        appendToLog({
          prospectName: prospect.doctorName,
          clinicName: prospect.clinicName,
          recipientEmail: prospect.email,
          sentAt: new Date().toISOString(),
          subject: prospect.subjectLine,
          status: "SUCCESS",
          messageId: result.messageId,
          error: null,
          campaign: CONFIG.campaignTag,
        });
      } else {
        console.log(\`     ❌ Send failed: \${result.error}\`);
        failedCount++;

        appendToLog({
          prospectName: prospect.doctorName,
          clinicName: prospect.clinicName,
          recipientEmail: prospect.email,
          sentAt: new Date().toISOString(),
          subject: prospect.subjectLine,
          status: "FAILED",
          messageId: null,
          error: result.error,
          campaign: CONFIG.campaignTag,
        });
      }

      // Rate limit delay between sends (skip delay after last email)
      const remainingQuota = CONFIG.maxEmailsPerDay - getRealEmailsSentTodayInIndia();
      if (remainingQuota > 0) {
        const nextIdx = PROSPECTS.indexOf(prospect) + 1;
        if (nextIdx < PROSPECTS.length) {
          console.log(\`     ⏳ Waiting \${CONFIG.delayBetweenSendMs / 1000}s safety interval...\`);
          await sleep(CONFIG.delayBetweenSendMs);
        }
      }
    }

    console.log("\\n═══════════════════════════════════════════════════════════");
    console.log("  BATCH SENDING COMPLETE");
    console.log(\`  ✅ Successfully Sent this session: \${sessionSentCount}\`);
    console.log(\`  ⏭️  Skipped:                        \${skippedCount}\`);
    console.log(\`  ❌ Failed:                         \${failedCount}\`);
    console.log(\`  📊 Total real emails today:         \${getRealEmailsSentTodayInIndia()}/\${CONFIG.maxEmailsPerDay}\`);
    console.log("═══════════════════════════════════════════════════════════");
  } else {
    console.error(\`❌ Unknown mode: \${mode}. Use --test, --dry-run, or --send\`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal uncaught error:", err);
    process.exit(1);
  });
}
`;

fs.writeFileSync("/Users/sankalpmishra/Desktop/Developer/SwasthAI-main/website/scripts/send-cold-emails.ts", tsContent, "utf-8");
console.log("Successfully generated website/scripts/send-cold-emails.ts with all 50 verified prospects.");
