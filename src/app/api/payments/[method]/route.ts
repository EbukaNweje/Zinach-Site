import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import PaymentInfoModel from "@/lib/models/PaymentInfo";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ method: string }> },
) {
  try {
    await connectDB();
    const { method } = await params;
    const { fields } = await req.json();

    const info = await PaymentInfoModel.findOneAndUpdate(
      { method },
      { method, fields },
      { new: true, upsert: true, runValidators: true },
    );

    return NextResponse.json({ success: true, data: info });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
