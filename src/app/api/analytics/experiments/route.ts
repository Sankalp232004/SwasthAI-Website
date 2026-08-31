import { NextRequest, NextResponse } from "next/server";
import { getExperiments, saveExperiment } from "@/lib/analytics/storage";
import { ContentExperiment } from "@/lib/analytics/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await getExperiments();
    return NextResponse.json({ experiments: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experiments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.articleSlug || !body.description || !body.experimentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newExperiment: ContentExperiment = {
      id: body.id || `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      articleSlug: body.articleSlug,
      articleTitle: body.articleTitle || body.articleSlug,
      experimentType: body.experimentType,
      changeDate: body.changeDate || new Date().toISOString().split("T")[0],
      description: body.description,
      beforeMetrics: body.beforeMetrics || {
        views: 0,
        avgActiveSeconds: 0,
        ctaClicks: 0,
        searchClicks: 0,
        searchCtr: 0
      },
      afterMetrics: body.afterMetrics
    };

    await saveExperiment(newExperiment);
    return NextResponse.json({ success: true, experiment: newExperiment });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record experiment" }, { status: 500 });
  }
}
