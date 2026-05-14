import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function PATCH(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id") ?? "";
  const body = await req.json();

  const res = await fetch(`${API_URL}/api/cart/update`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-session-id": sessionId },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
