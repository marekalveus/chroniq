import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const url = `https://ariregister.rik.ee/est/api/autocomplete?q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }

  const data = await res.json();

  return NextResponse.json(data);
}
