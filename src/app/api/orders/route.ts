import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function GET() {
  const res = await fetch(`${API_URL}/api/orders`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  // Forward multipart form data (includes proof image) straight to the backend
  const formData = await req.formData();

  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    body: formData as unknown as BodyInit,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
