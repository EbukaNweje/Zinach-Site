import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function DELETE(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id") ?? "";

  const res = await fetch(`${API_URL}/api/cart/clear`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "x-session-id": sessionId },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
