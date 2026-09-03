/**
 * SwasthAI Cold Email CLI Sending Tool (Brevo Engine)
 * ============================================================
 * Safe, controlled cold email workflow using Brevo's Transactional Email REST API.
 *
 * COMMANDS:
 *   npx tsx scripts/send-cold-emails.ts --test      Send ONE test email to swasthai.founder@gmail.com (DEFAULT)
 *   npx tsx scripts/send-cold-emails.ts --stage 1   Send to Stage 1 (5 verified prospects)
 *   npx tsx scripts/send-cold-emails.ts --dry-run   Preview simulation without sending
 */

import { config as loadEnv } from 'dotenv';
import * as path from 'path';
import { BrevoOutreachEngine } from '../src/lib/outreach/brevo';
import { getAllProspectLeads } from '../src/lib/outreach/prospects';

loadEnv({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test') || args.length === 0;
  const isDryRun = args.includes('--dry-run');
  const stageIndex = args.indexOf('--stage');
  const stageNum = stageIndex !== -1 ? parseInt(args[stageIndex + 1], 10) : 0;

  const engine = new BrevoOutreachEngine();
  const sender = engine.getSenderInfo();

  console.log('\n==================================================');
  console.log('SWASTHAI COLD OUTREACH ENGINE (BREVO)');
  console.log('==================================================');
  console.log(`Sender: ${sender.senderName} <${sender.senderEmail}>`);
  console.log(`Reply-To: ${sender.replyToEmail}`);
  console.log(`Brevo API Configured: ${sender.isConfigured ? 'YES' : 'NO'}`);
  console.log('==================================================\n');

  if (isTest) {
    console.log('Sending ONE test email to swasthai.founder@gmail.com...\n');
    const testLead = {
      doctorName: 'Dr. Ashish Ranade',
      clinicName: 'Strong Bones Clinic',
      specialty: 'Pediatric Orthopedics',
      city: 'Pune'
    };

    const all = getAllProspectLeads();
    const first = all[0];

    const result = await engine.sendEmail({
      recipientEmail: 'swasthai.founder@gmail.com',
      doctorName: first.doctorName,
      clinicName: first.clinicName,
      subject: `[TEST] ${first.selectedSubject}`,
      textContent: first.plainTextBody,
      htmlContent: first.htmlBody,
      campaignTag: 'swasthai_cold_outreach_test',
      isTest: true
    });

    if (result.success) {
      console.log('✅ TEST EMAIL SENT SUCCESSFULLY THROUGH BREVO!');
      console.log(`Brevo Message ID: ${result.messageId}`);
      console.log(`Recipient: swasthai.founder@gmail.com`);
      console.log(`Subject: [TEST] ${first.selectedSubject}`);
      console.log('\n--- EMAIL BODY (PLAIN TEXT) ---');
      console.log(first.plainTextBody);
      console.log('-------------------------------\n');
    } else {
      console.error(`❌ TEST FAILED: ${result.error}`);
    }
    return;
  }

  if (isDryRun) {
    console.log('🧪 RUNNING DRY RUN SIMULATION...\n');
    const all = getAllProspectLeads();
    console.log(`Total Verified Prospects: ${all.length}`);
    console.log(`Sent Today: ${engine.getSentCountToday()} / 10`);
    console.log('\nFirst 5 Sample Previews:');
    all.slice(0, 5).forEach(p => {
      console.log(`- #${p.rank} ${p.doctorName} (${p.clinicName}) -> ${p.email} | Subject: "${p.selectedSubject}"`);
    });
    return;
  }

  if (stageNum > 0) {
    console.log(`Executing Stage ${stageNum}...`);
    // Staged execution logic
    const all = getAllProspectLeads();
    let targets = all.slice(0, 5);
    if (stageNum === 2) targets = all.slice(5, 15);
    if (stageNum === 3) targets = all.slice(15, 40);

    for (const lead of targets) {
      if (engine.isAlreadyContacted(lead.email)) {
        console.log(`[SKIPPED] ${lead.email} already contacted.`);
        continue;
      }
      if (engine.isOptedOut(lead.email)) {
        console.log(`[BLOCKED] ${lead.email} opted out.`);
        continue;
      }

      console.log(`Sending to ${lead.doctorName} (${lead.email})...`);
      const result = await engine.sendEmail({
        recipientEmail: lead.email,
        doctorName: lead.doctorName,
        clinicName: lead.clinicName,
        subject: lead.selectedSubject,
        textContent: lead.plainTextBody,
        htmlContent: lead.htmlBody,
        campaignTag: 'swasthai_cold_outreach_august_2026',
        isTest: false
      });

      if (result.success) {
        console.log(`✅ Sent! Message ID: ${result.messageId}`);
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

main().catch(console.error);
