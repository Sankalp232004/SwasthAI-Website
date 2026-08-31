import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/analytics/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period") || "30d";
    const period = (["7d", "30d", "90d", "all"].includes(periodParam) ? periodParam : "30d") as "7d" | "30d" | "90d" | "all";

    const summary = await getAnalyticsSummary(period);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Analytics stats error:", error);
    return NextResponse.json({ error: "Failed to aggregate analytics" }, { status: 500 });
  }
}
