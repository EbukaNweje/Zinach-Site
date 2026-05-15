import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import CartModel from "@/lib/models/Cart";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing session ID" },
        { status: 400 },
      );
    }

    const { slug, packageOption } = await req.json();

    const cart = await CartModel.findOne({ sessionId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 },
      );
    }

    cart.items = cart.items.filter(
      (i: { slug: string; packageOption: string }) =>
        !(i.slug === slug && i.packageOption === (packageOption || "")),
    );

    await cart.save();
    return NextResponse.json({ success: true, data: cart.items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
