import { NextRequest, NextResponse } from "next/server";
import { WhatsAppOutreachEngine } from "@/lib/whatsapp/engine";

export const dynamic = "force-static";

const engine = new WhatsAppOutreachEngine();
const metaClient = engine.getMetaClient();

/**
 * GET: Meta Webhook Handshake & Verification
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifiedChallenge = metaClient.verifyWebhook(mode, token, challenge);

  if (verifiedChallenge) {
    return new NextResponse(verifiedChallenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden: Invalid webhook verification token" }, { status: 403 });
}

/**
 * POST: Real-time Inbound Message & Delivery Event Processing
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = engine.processWebhookPayload(payload);

    return NextResponse.json({
      status: "success",
      eventsProcessed: result.eventsProcessed,
      statusesUpdated: result.statusesUpdated,
      repliesHandled: result.repliesHandled
    });
  } catch (err: any) {
    console.error("Error processing WhatsApp webhook event:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
