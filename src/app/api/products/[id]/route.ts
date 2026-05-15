import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const formData = await req.formData();

  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    body: formData as unknown as BodyInit,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
