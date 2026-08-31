import { NextRequest, NextResponse } from 'next/server';
import { BrevoOutreachEngine } from '@/lib/outreach/brevo';
import { getAllProspectLeads } from '@/lib/outreach/prospects';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, stage, targetRanks, isDryRun } = body;

    const engine = new BrevoOutreachEngine();
    const allProspects = getAllProspectLeads();
    const sendLog = engine.loadSendLog();
    const optOuts = engine.loadOptOuts();

    // Determine target prospects
    let targets = allProspects;

    if (Array.isArray(targetRanks) && targetRanks.length > 0) {
      targets = allProspects.filter(p => targetRanks.includes(p.rank));
    } else if (stage === 1) {
      targets = allProspects.slice(0, 5);
    } else if (stage === 2) {
      targets = allProspects.slice(5, 15);
    } else if (stage === 3) {
      targets = allProspects.slice(15, 40);
    }

    // Filter out already contacted, opted out, or invalid
    const evaluatedTargets = targets.map(p => {
      const emailNorm = p.email.toLowerCase().trim();
      let status = 'READY';
      let reason = '';

      if (optOuts.includes(emailNorm)) {
        status = 'BLOCKED_OPT_OUT';
        reason = 'Recipient previously opted out.';
      } else if (sendLog.some(e => e.recipientEmail?.toLowerCase().trim() === emailNorm && e.status !== 'FAILED' && e.status !== 'TEST')) {
        status = 'BLOCKED_DUPLICATE';
        reason = 'Recipient was already contacted.';
      } else if (p.verificationStatus !== 'VERIFIED') {
        status = 'BLOCKED_UNVERIFIED';
        reason = 'Address is not verified.';
      }

      return {
        ...p,
        sendEligibility: status,
        blockReason: reason
      };
    });

    // If DRY RUN, return the simulation payload without sending
    if (isDryRun || mode === 'dry-run') {
      return NextResponse.json({
        success: true,
        isDryRun: true,
        totalTargets: evaluatedTargets.length,
        readyToSend: evaluatedTargets.filter(t => t.sendEligibility === 'READY').length,
        blocked: evaluatedTargets.filter(t => t.sendEligibility !== 'READY').length,
        evaluatedTargets
      });
    }

    // Real sending requires explicit execution
    const readyToSend = evaluatedTargets.filter(t => t.sendEligibility === 'READY');
    const sentToday = engine.getSentCountToday();
    const dailyLimit = 10;
    const availableQuota = Math.max(0, dailyLimit - sentToday);

    if (availableQuota <= 0) {
      return NextResponse.json({
        success: false,
        error: `Daily limit reached (${sentToday}/${dailyLimit} sent today). Cannot send more cold emails today.`
      }, { status: 429 });
    }

    const batchToSend = readyToSend.slice(0, availableQuota);
    const results = [];

    for (const lead of batchToSend) {
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

      results.push({
        rank: lead.rank,
        doctorName: lead.doctorName,
        clinicName: lead.clinicName,
        email: lead.email,
        success: result.success,
        brevoMessageId: result.messageId,
        error: result.error
      });

      // Small 2-second rate-limiting delay between transactional calls
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      sentCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
      results
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
