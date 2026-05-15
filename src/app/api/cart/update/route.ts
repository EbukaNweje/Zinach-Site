import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Cart } from "@/lib/models/Cart";

export async function PATCH(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id");
  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: "Missing session ID" },
      { status: 400 },
    );
  }
  try {
    await connectDB();
    const { slug, packageOption, quantity } = await req.json();

    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 },
      );
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i: { slug: string; packageOption: string }) =>
          !(i.slug === slug && i.packageOption === (packageOption || "")),
      );
    } else {
      const item = cart.items.find(
        (i: { slug: string; packageOption: string }) =>
          i.slug === slug && i.packageOption === (packageOption || ""),
      );
      if (item) item.quantity = quantity;
    }

    await cart.save();
    return NextResponse.json({ success: true, data: cart.items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
