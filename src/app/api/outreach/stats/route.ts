import { NextResponse } from 'next/server';
import { BrevoOutreachEngine } from '@/lib/outreach/brevo';
import { getAllProspectLeads } from '@/lib/outreach/prospects';
import { OutreachStats } from '@/lib/outreach/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const engine = new BrevoOutreachEngine();
    const allProspects = getAllProspectLeads();
    const sendLog = engine.loadSendLog();
    const optOuts = engine.loadOptOuts();

    const sentToday = engine.getSentCountToday();
    const dailyLimit = 10;
    const remainingToday = Math.max(0, dailyLimit - sentToday);

    // Merge status from sendLog & optOuts into prospect list
    const prospectsWithStatus = allProspects.map(p => {
      const emailNorm = p.email.toLowerCase().trim();
      
      if (optOuts.includes(emailNorm)) {
        return { ...p, status: 'OPTED_OUT' as const };
      }

      const logEntry = sendLog.slice().reverse().find(entry => entry.recipientEmail?.toLowerCase().trim() === emailNorm);
      if (logEntry) {
        return {
          ...p,
          status: logEntry.status,
          sentAt: logEntry.sentAt,
          brevoMessageId: logEntry.brevoMessageId
        };
      }

      return p;
    });

    const sentTotal = sendLog.filter(e => e.status !== 'TEST' && e.status !== 'FAILED').length;
    const deliveredTotal = sendLog.filter(e => e.status === 'SENT' || e.status === 'DELIVERED').length;
    const bouncedTotal = sendLog.filter(e => e.status === 'BOUNCED' || e.bounce).length;
    const repliedTotal = sendLog.filter(e => e.reply || e.status === 'REPLIED').length;
    const positiveReplies = sendLog.filter(e => e.status === 'INTERESTED' || e.replyClassification === 'INTERESTED' || e.replyClassification === 'SEND_DEMO').length;
    const demosBooked = sendLog.filter(e => e.status === 'DEMO').length;
    const trialsStarted = sendLog.filter(e => e.status === 'TRIAL').length;
    const paidClinics = sendLog.filter(e => e.status === 'PAID').length;
    const optedOutTotal = optOuts.length;

    const stats: OutreachStats = {
      totalProspects: allProspects.length,
      verifiedProspects: allProspects.filter(p => p.verificationStatus === 'VERIFIED').length,
      likelyValidProspects: allProspects.filter(p => p.verificationStatus === 'LIKELY_VALID').length,
      unverifiedProspects: 0,
      invalidProspects: 0,
      sentTotal,
      sentToday,
      dailyLimit,
      remainingToday,
      deliveredTotal,
      bouncedTotal,
      repliedTotal,
      positiveReplies,
      demosBooked,
      trialsStarted,
      paidClinics,
      optedOutTotal
    };

    return NextResponse.json({
      success: true,
      stats,
      prospects: prospectsWithStatus,
      senderInfo: engine.getSenderInfo(),
      recentLogs: sendLog.slice(-20).reverse()
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
