import { NextRequest, NextResponse } from "next/server";
import { getResearch } from "../../../lib/providers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Missing ticker or company query." }, { status: 400 });
  }

  try {
    const result = await getResearch(q);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
      }
    });
  } catch {
    return NextResponse.json({ error: "Research lookup failed." }, { status: 500 });
  }
}
