import { NextRequest, NextResponse } from "next/server";
import { getResearch } from "../../../lib/providers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "NVDA";
  const result = await getResearch(q);
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
