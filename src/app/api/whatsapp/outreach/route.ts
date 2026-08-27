import { NextRequest, NextResponse } from "next/server";
import { WhatsAppOutreachEngine } from "@/lib/whatsapp/engine";

export const dynamic = "force-static";

const engine = new WhatsAppOutreachEngine();
const store = engine.getStore();

/**
 * GET: Fetch CRM summary metrics, recent logs, and prospect queue
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const phone = searchParams.get("phone");

  if (phone) {
    const preview = engine.previewOutreach(phone);
    return NextResponse.json(preview);
  }

  const summary = store.getOutreachSummary();
  const logs = store.getRecentLogs(15);
  const prospects = store.getAllProspects();
  const followUps = store.getDueFollowUps();
  const objections = store.getObjectionStats();

  return NextResponse.json({
    summary,
    logs,
    prospectsCount: prospects.length,
    followUpsDue: followUps.length,
    objections,
    dailySendLimit: engine.getMetaClient().getConfig().dailyLimit
  });
}

/**
 * POST: Execute preview, send, opt-out, or objection logging
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, options } = body;

    if (action === "preview") {
      const preview = engine.previewOutreach(phone, options);
      return NextResponse.json(preview);
    }

    if (action === "send") {
      const result = await engine.executeSend(phone, options);
      return NextResponse.json(result);
    }

    if (action === "optout") {
      const success = store.optOut(phone, options?.reason || "Admin requested opt-out");
      return NextResponse.json({ success, phone, status: "OPTED_OUT" });
    }

    if (action === "resume") {
      const success = store.resumeContact(phone);
      return NextResponse.json({ success, phone, status: "RESUMED" });
    }

    if (action === "import_leads") {
      const mdPath = `${process.cwd()}/../cold_email_leads.md`;
      const result = engine.importLeadsFromMarkdown(mdPath);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("Error in WhatsApp outreach API:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
