import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import CartModel from "@/lib/models/Cart";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing session ID" },
        { status: 400 },
      );
    }
    const cart = await CartModel.findOne({ sessionId }).lean();
    return NextResponse.json({
      success: true,
      data: cart ? (cart as { items: unknown[] }).items : [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
