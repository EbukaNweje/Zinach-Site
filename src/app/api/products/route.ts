import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://drwilliammakis-md.vercel.app/";

export async function GET() {
  const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  // Forward multipart form data (includes product image) to the backend
  const formData = await req.formData();

  const res = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    body: formData as unknown as BodyInit,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
