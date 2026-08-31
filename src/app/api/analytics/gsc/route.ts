import { NextRequest, NextResponse } from "next/server";
import { getGSCMetrics, saveGSCMetrics } from "@/lib/analytics/storage";
import { SearchQueryMetric } from "@/lib/analytics/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const metrics = await getGSCMetrics();
    return NextResponse.json({ queries: metrics });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch GSC metrics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const queries: SearchQueryMetric[] = body.queries || [];

    if (!Array.isArray(queries)) {
      return NextResponse.json({ error: "Invalid queries payload" }, { status: 400 });
    }

    const processed = queries.map((q) => {
      const isHighImpressionLowCtr = q.impressions >= 150 && q.ctr < 3.0;
      return {
        ...q,
        isHighImpressionLowCtr,
        trend: q.trend || "STABLE"
      };
    });

    await saveGSCMetrics(processed);
    return NextResponse.json({ success: true, count: processed.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save GSC data" }, { status: 500 });
  }
}
