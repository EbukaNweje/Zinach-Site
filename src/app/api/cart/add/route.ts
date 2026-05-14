import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function POST(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id") ?? "";
  const body = await req.json();

  const res = await fetch(`${API_URL}/api/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-session-id": sessionId },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
