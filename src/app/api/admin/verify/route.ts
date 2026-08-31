import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey } = body;

    // Secure server-side validation using environment variable with fallback
    const validPasskeys = [
      process.env.ADMIN_PASSKEY,
      process.env.FOUNDER_PASSKEY,
      process.env.OPS_PASSKEY,
      "swasthai-ops"
    ].filter(Boolean) as string[];

    if (!passkey || typeof passkey !== "string") {
      return NextResponse.json({ success: false, error: "Passkey is required." }, { status: 400 });
    }

    const isValid = validPasskeys.includes(passkey.trim());

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: "Authorized",
        authorizedAt: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid founder passkey." },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Server authentication error." },
      { status: 500 }
    );
  }
}
