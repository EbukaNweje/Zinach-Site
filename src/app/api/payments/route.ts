import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import PaymentInfoModel from "@/lib/models/PaymentInfo";

export async function GET() {
  try {
    await connectDB();
    const info = await PaymentInfoModel.find().lean();
    return NextResponse.json({ success: true, data: info });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
