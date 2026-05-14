import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

function forwardHeaders(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id") ?? "";
  return { "x-session-id": sessionId, "Content-Type": "application/json" };
}

// GET /api/cart
export async function GET(req: NextRequest) {
  const res = await fetch(`${API_URL}/api/cart`, {
    headers: forwardHeaders(req),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
