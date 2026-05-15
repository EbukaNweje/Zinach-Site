import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import OrderModel from "@/lib/models/Order";
import { sendPaymentConfirmation } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const { paymentStatus } = await req.json();

    const validStatuses = ["pending", "processing", "paid", "failed"];
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true },
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (paymentStatus === "paid") {
      sendPaymentConfirmation(order).catch((e: Error) =>
        console.error("Payment confirmation email failed:", e.message),
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
