import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ method: string }> },
) {
  const { method } = await params;
  const body = await req.json();

  const res = await fetch(
    `${API_URL}/api/payments/${encodeURIComponent(method)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
