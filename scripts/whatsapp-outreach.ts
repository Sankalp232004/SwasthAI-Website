/**
 * SwasthAI WhatsApp Outreach System — CLI & Command Center
 * ==========================================================
 * Interactive CLI for single prospect preview, quality score auditing,
 * explicit SEND approval, batch management, follow-ups, and opt-out controls.
 *
 * Usage:
 *   npx ts-node scripts/whatsapp-outreach.ts /whatsapp +919822038038
 *   npx ts-node scripts/whatsapp-outreach.ts SEND +919822038038
 *   npx ts-node scripts/whatsapp-outreach.ts /whatsapp-batch
 *   npx ts-node scripts/whatsapp-outreach.ts /whatsapp-status
 *   npx ts-node scripts/whatsapp-outreach.ts /followups
 *   npx ts-node scripts/whatsapp-outreach.ts /contacts
 *   npx ts-node scripts/whatsapp-outreach.ts /optout +919822038038
 *   npx ts-node scripts/whatsapp-outreach.ts /resume +919822038038
 *   npx ts-node scripts/whatsapp-outreach.ts /import-leads
 *   npx ts-node scripts/whatsapp-outreach.ts /dry-run +919822038038
 *   npx ts-node scripts/whatsapp-outreach.ts /test
 */

import { config as loadEnv } from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { WhatsAppOutreachEngine } from "../src/lib/whatsapp/engine";
import { OBJECTION_SCRIPTS } from "../src/lib/whatsapp/objection-library";
import { ObjectionType } from "../src/lib/whatsapp/types";

// Load environment variables from .env.local
loadEnv({ path: path.join(__dirname, "..", ".env.local") });
loadEnv({ path: path.join(__dirname, "..", "..", ".env.local") });

const engine = new WhatsAppOutreachEngine();
const store = engine.getStore();
const metaClient = engine.getMetaClient();

const args = process.argv.slice(2);
const command = args[0] ? args[0].trim() : "/whatsapp-status";
const param1 = args[1] ? args[1].trim() : "";
const param2 = args[2] ? args[2].trim() : "";

console.log("\n=======================================================");
console.log("🏥 SWASTHAI WHATSAPP OUTREACH COMMAND CENTER");
console.log("=======================================================");

async function main() {
  switch (command.toLowerCase()) {
    // ----------------------------------------------------
    // PREVIEW COMMAND: /whatsapp <phone>
    // ----------------------------------------------------
    case "/whatsapp":
    case "preview":
    case "/preview": {
      if (!param1) {
        console.log("❌ Error: Phone number is required.");
        console.log("Usage: npx ts-node scripts/whatsapp-outreach.ts /whatsapp +919822038038");
        process.exit(1);
      }

      const preview = engine.previewOutreach(param1);
      if (!preview.isValid || !preview.draft || !preview.prospect || !preview.qualityResult) {
        console.log(`❌ Validation Failed: ${preview.gateResult.reasons.join(", ")}`);
        process.exit(1);
      }

      const p = preview.prospect;
      const d = preview.draft;
      const q = preview.qualityResult;
      const gate = preview.gateResult;

      console.log("\n📋 PROSPECT PROFILE");
      console.log(`• Phone:      ${p.phone} (${p.rawPhone})`);
      console.log(`• Doctor:     ${p.doctorName}`);
      console.log(`• Clinic:     ${p.clinicName}`);
      console.log(`• Specialty:  ${p.specialty}`);
      console.log(`• City:       ${p.city || "Not specified"}`);
      console.log(`• Status:     ${p.status}`);
      console.log(`• Campaign:   ${p.campaign}`);

      console.log("\n💬 EXACT OUTREACH MESSAGE PREVIEW");
      console.log("-------------------------------------------------------");
      console.log(d.text);
      console.log("-------------------------------------------------------");

      console.log("\n🔍 QUALITY & COMPLIANCE AUDIT");
      console.log(`• Overall Quality Score:    ${q.overallScore}/100 ${q.overallScore >= 80 ? "✅ Excellent" : q.overallScore >= 70 ? "🟡 Acceptable" : "❌ Rejected"}`);
      console.log(`• Personalization Score:    ${q.personalizationScore}/100`);
      console.log(`• Clarity & Flow Score:     ${q.clarityScore}/100`);
      console.log(`• Brevity Score:            ${q.brevityScore}/100 (${q.wordCount} words)`);
      console.log(`• Spam Risk:                ${q.spamRisk === "LOW" ? "🟢 Low" : q.spamRisk === "MEDIUM" ? "🟡 Medium" : "🔴 High"}`);
      console.log(`• Placeholders Detected:    ${q.hasPlaceholders ? `❌ YES (${q.detectedPlaceholders.join(", ")})` : "✅ None (Clean)"}`);
      console.log(`• Banned Hype Words:        ${q.hasBannedWords ? `❌ YES (${q.bannedWordsFound.join(", ")})` : "✅ None"}`);
      console.log(`• Medical Claims Made:      ${q.hasMedicalClaims ? "❌ YES" : "✅ None (Clinical autonomy preserved)"}`);
      console.log(`• Emoji Count:              ${q.emojiCount} (Max allowed: 2)`);

      const isDuplicate = Boolean(p.lastContactedAt);
      const isOptedOut = store.isOptedOut(p.phone);

      console.log("\n🛡️ SAFETY GATES");
      console.log(`• Duplicate / Contacted:    ${isDuplicate ? `⚠️ Yes (Last: ${p.lastContactedAt})` : "✅ No (New recipient)"}`);
      console.log(`• Permanent Opt-Out:        ${isOptedOut ? "🔴 YES (BLOCKED)" : "✅ No"}`);
      console.log(`• Daily Allowance:          ${store.getTodaySendCount()}/${metaClient.getConfig().dailyLimit} used today`);
      console.log(`• Meta API Credentials:     ${metaClient.isConfigured() ? "✅ Configured" : "⚠️ Missing (Set in .env.local)"}`);

      console.log("\n=======================================================");
      if (gate.allowed) {
        console.log("🚀 SEND STATUS: ✅ READY TO SEND");
        console.log(`To execute this send through WhatsApp, run:`);
        console.log(`👉 npx ts-node scripts/whatsapp-outreach.ts SEND ${p.phone}`);
      } else {
        console.log("⛔ SEND STATUS: 🔴 BLOCKED");
        console.log("Reasons:");
        gate.reasons.forEach(r => console.log(`  • ${r}`));
      }
      console.log("=======================================================\n");
      break;
    }

    // ----------------------------------------------------
    // SEND COMMAND: SEND <phone> (Explicit Confirmation)
    // ----------------------------------------------------
    case "send":
    case "/send": {
      if (!param1) {
        console.log("❌ Error: Phone number is required.");
        console.log("Usage: npx ts-node scripts/whatsapp-outreach.ts SEND +919822038038");
        process.exit(1);
      }

      console.log(`\n⏳ Executing explicit send for ${param1}...`);
      const result = await engine.executeSend(param1, {
        operator: "CLI_FOUNDER",
        isDryRun: false
      });

      if (result.success) {
        console.log("\n✅ MESSAGE SUCCESSFULLY SENT THROUGH WHATSAPP BUSINESS PLATFORM!");
        console.log(`• Message ID:  ${result.messageId}`);
        console.log(`• Recipient:   ${result.prospect?.doctorName} (${result.prospect?.phone})`);
        console.log(`• Clinic:      ${result.prospect?.clinicName}`);
        console.log(`• Timestamp:   ${result.log?.timestamp}`);
        console.log(`• Follow-up 1: Scheduled in 3 days (${result.prospect?.nextFollowUpDue})`);
        console.log(`• Daily Sends: ${store.getTodaySendCount()}/${metaClient.getConfig().dailyLimit} used today\n`);
      } else {
        console.log("\n❌ SEND BLOCKED / FAILED:");
        console.log(`Error: ${result.error}`);
        if (result.gateReasons && result.gateReasons.length > 0) {
          console.log("Gate Reasons:");
          result.gateReasons.forEach(r => console.log(`  • ${r}`));
        }
        console.log();
      }
      break;
    }

    // ----------------------------------------------------
    // DRY RUN: /dry-run <phone>
    // ----------------------------------------------------
    case "/dry-run":
    case "dryrun": {
      if (!param1) {
        console.log("❌ Error: Phone number is required for dry run.");
        process.exit(1);
      }
      console.log(`\n🧪 Executing DRY RUN for ${param1}...`);
      const result = await engine.executeSend(param1, { isDryRun: true, operator: "CLI_DRYRUN" });
      if (result.success) {
        console.log("✅ Dry Run Completed. All quality gates passed and simulated log entry created.\n");
      } else {
        console.log(`❌ Dry Run Failed: ${result.error}\n`);
      }
      break;
    }

    // ----------------------------------------------------
    // BATCH MODE: /whatsapp-batch
    // ----------------------------------------------------
    case "/whatsapp-batch":
    case "batch": {
      const allProspects = store.getAllProspects();
      const readyProspects = allProspects.filter(p => !p.optedOut && (!p.totalMessagesSent || p.totalMessagesSent === 0));

      console.log(`\n📦 BATCH OUTREACH QUEUE (${readyProspects.length} ready prospects)`);
      console.log("-------------------------------------------------------");

      if (readyProspects.length === 0) {
        console.log("No new prospects waiting in queue. Import leads using: /import-leads");
        break;
      }

      const displayLimit = Math.min(readyProspects.length, 10);
      for (let i = 0; i < displayLimit; i++) {
        const p = readyProspects[i];
        const preview = engine.previewOutreach(p.phone);
        const qScore = preview.qualityResult?.overallScore || 0;
        const status = preview.gateResult.allowed ? "✅ READY" : "⛔ BLOCKED";

        console.log(`${i + 1}. ${p.doctorName} | ${p.clinicName} (${p.city || "IN"})`);
        console.log(`   Phone: ${p.phone} | Specialty: ${p.specialty}`);
        console.log(`   Quality: ${qScore}/100 | Status: ${status}`);
        console.log(`   Send single: npx ts-node scripts/whatsapp-outreach.ts SEND ${p.phone}\n`);
      }

      console.log("-------------------------------------------------------");
      console.log(`Daily Quota Remaining: ${metaClient.getConfig().dailyLimit - store.getTodaySendCount()} sends available today.`);
      console.log(`To send next ready prospect, use: SEND <phone>`);
      break;
    }

    // ----------------------------------------------------
    // STATUS DASHBOARD: /whatsapp-status
    // ----------------------------------------------------
    case "/whatsapp-status":
    case "status": {
      const summary = store.getOutreachSummary();
      const dailyLimit = metaClient.getConfig().dailyLimit;
      const objStats = store.getObjectionStats();

      console.log("\n📊 SWASTHAI WHATSAPP OUTREACH METRICS");
      console.log("-------------------------------------------------------");
      console.log(`• Total Prospects in CRM:      ${summary.totalProspects}`);
      console.log(`• Contacted:                   ${summary.sentCount}`);
      console.log(`• Replies Received:            ${summary.repliedCount} (Reply Rate: ${summary.replyRate})`);
      console.log(`• Demos Booked:                ${summary.demoCount} (Demo Rate: ${summary.demoRate})`);
      console.log(`• Trials Started:              ${summary.trialCount}`);
      console.log(`• Paying Clinics:              ${summary.paidCount}`);
      console.log(`• Permanent Opt-Outs:          ${summary.optOutCount}`);
      console.log(`• Today's Sends (IST):         ${summary.todaySent} / ${dailyLimit} (${dailyLimit - summary.todaySent} remaining)`);

      console.log("\n🗣️ OBJECTION LOG BREAKDOWN");
      if (Object.keys(objStats).length === 0) {
        console.log("• No inbound objections recorded yet.");
      } else {
        for (const [key, count] of Object.entries(objStats)) {
          console.log(`• ${key.padEnd(20)}: ${count}`);
        }
      }

      console.log("\n🕒 RECENT ACTIVITY");
      const recentLogs = store.getRecentLogs(5);
      if (recentLogs.length === 0) {
        console.log("• No outreach messages sent yet.");
      } else {
        recentLogs.forEach(l => {
          console.log(`• [${l.timestamp.slice(0, 16)}] ${l.doctorName} (${l.phone}) -> ${l.whatsappStatus} ${l.isDryRun ? "[DRY RUN]" : ""}`);
        });
      }
      console.log("-------------------------------------------------------\n");
      break;
    }

    // ----------------------------------------------------
    // FOLLOW-UPS DUE: /followups
    // ----------------------------------------------------
    case "/followups":
    case "followups": {
      const due = store.getDueFollowUps();
      console.log(`\n📅 SCHEDULED FOLLOW-UPS DUE (${due.length} due)`);
      console.log("-------------------------------------------------------");

      if (due.length === 0) {
        console.log("No follow-ups due today. Follow-ups are automatically scheduled 3 and 8 days after initial send.");
      } else {
        due.forEach((p, idx) => {
          const nextStep = (p.followUpStep + 1) as 1 | 2;
          console.log(`${idx + 1}. ${p.doctorName} (${p.clinicName})`);
          console.log(`   Phone: ${p.phone} | Follow-up Step: ${nextStep} (Due: ${p.nextFollowUpDue?.slice(0, 10)})`);
          console.log(`   Preview: npx ts-node scripts/whatsapp-outreach.ts /whatsapp ${p.phone}\n`);
        });
      }
      console.log("-------------------------------------------------------\n");
      break;
    }

    // ----------------------------------------------------
    // CONTACTS LIST: /contacts
    // ----------------------------------------------------
    case "/contacts":
    case "contacts": {
      const all = store.getAllProspects();
      console.log(`\n👥 CRM CONTACTS LIST (${all.length} prospects)`);
      console.log("-------------------------------------------------------");

      all.slice(0, 15).forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.doctorName.padEnd(25)} | ${p.clinicName.slice(0, 22).padEnd(23)} | ${p.phone} | [${p.status}]`);
      });

      if (all.length > 15) {
        console.log(`... and ${all.length - 15} more prospects in store.`);
      }
      console.log("-------------------------------------------------------\n");
      break;
    }

    // ----------------------------------------------------
    // OPT-OUT: /optout <phone>
    // ----------------------------------------------------
    case "/optout":
    case "optout": {
      if (!param1) {
        console.log("❌ Error: Phone number is required.");
        process.exit(1);
      }
      const success = store.optOut(param1, param2 || "Manually opted out via CLI");
      if (success) {
        console.log(`\n🔴 Successfully opted out ${param1}. All future outreach is permanently blocked.\n`);
      } else {
        console.log(`\n❌ Failed to opt out ${param1}. Invalid phone format.\n`);
      }
      break;
    }

    // ----------------------------------------------------
    // RESUME CONTACT: /resume <phone>
    // ----------------------------------------------------
    case "/resume":
    case "resume": {
      if (!param1) {
        console.log("❌ Error: Phone number is required.");
        process.exit(1);
      }
      const success = store.resumeContact(param1);
      if (success) {
        console.log(`\n🟢 Successfully removed opt-out for ${param1}. Outbound messaging re-enabled by admin action.\n`);
      } else {
        console.log(`\n❌ Failed to resume ${param1}.\n`);
      }
      break;
    }

    // ----------------------------------------------------
    // OBJECTION HANDLER: /objection <phone> <TYPE>
    // ----------------------------------------------------
    case "/objection":
    case "objection": {
      const objType = (param2 || "INTERESTED").toUpperCase();
      const script = (OBJECTION_SCRIPTS as any)[objType] || (OBJECTION_SCRIPTS as any)["INTERESTED"];
      const prospect = param1 ? store.getProspect(param1) : undefined;
      const docName = prospect?.doctorName || "Doctor";

      console.log(`\n💡 RECOMMENDED REPLY SCRIPT: [${objType}]`);
      console.log("-------------------------------------------------------");
      console.log(script.suggestedResponse(docName));
      console.log("-------------------------------------------------------\n");
      break;
    }

    // ----------------------------------------------------
    // IMPORT LEADS: /import-leads
    // ----------------------------------------------------
    case "/import-leads":
    case "import": {
      const mdPath = path.join(process.cwd(), "..", "cold_email_leads.md");
      const localMdPath = path.join(process.cwd(), "cold_email_leads.md");
      const targetPath = fs.existsSync(mdPath) ? mdPath : localMdPath;

      console.log(`\n📥 Importing verified clinic leads from: ${targetPath}`);
      const res = engine.importLeadsFromMarkdown(targetPath);
      console.log(`✅ Successfully imported ${res.imported} new prospects, updated ${res.updated} existing prospects (Total: ${res.total}).\n`);
      break;
    }

    // ----------------------------------------------------
    // TEST SENDER: /test
    // ----------------------------------------------------
    case "/test":
    case "test": {
      const testNum = metaClient.getConfig().testNumber;
      if (!testNum) {
        console.log("❌ WHATSAPP_TEST_NUMBER is not set in environment variables.");
        console.log("Please set WHATSAPP_TEST_NUMBER=+91XXXXXXXXXX in .env.local before running test mode.");
        break;
      }

      console.log(`\n🧪 Sending test outreach message to verified test number: ${testNum}...`);
      const res = await engine.executeSend(testNum, {
        doctorName: "Dr. Founder Test",
        clinicName: "SwasthAI Test Clinic",
        specialty: "General Physician",
        city: "Lucknow",
        isTestMode: true,
        operator: "CLI_TEST_RUNNER"
      });

      if (res.success) {
        console.log(`✅ Test message successfully sent! Message ID: ${res.messageId}\n`);
      } else {
        console.log(`❌ Test message failed: ${res.error}\n`);
      }
      break;
    }

    default:
      console.log(`\nUnknown command: ${command}`);
      console.log("Available commands:");
      console.log("  /whatsapp <phone>     - Preview and audit prospect outreach");
      console.log("  SEND <phone>          - Send approved message through Meta WhatsApp API");
      console.log("  /whatsapp-batch       - View queue of ready prospects");
      console.log("  /whatsapp-status      - View CRM metrics, send count, and daily limits");
      console.log("  /followups            - View scheduled follow-ups due");
      console.log("  /contacts             - View recent contacts in CRM");
      console.log("  /optout <phone>       - Permanently opt out a phone number");
      console.log("  /resume <phone>       - Remove opt-out status (admin override)");
      console.log("  /objection <ph> <TYP> - Get smart response for objection type");
      console.log("  /import-leads         - Import 50 verified clinic leads from markdown");
      console.log("  /test                 - Send test message to WHATSAPP_TEST_NUMBER\n");
      break;
  }
}

main().catch(err => {
  console.error("Fatal error in WhatsApp CLI:", err);
  process.exit(1);
});
