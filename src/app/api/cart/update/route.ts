import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import CartModel from "@/lib/models/Cart";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing session ID" },
        { status: 400 },
      );
    }

    const { slug, packageOption, quantity } = await req.json();

    const cart = await CartModel.findOne({ sessionId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 },
      );
    }

    const itemIndex = cart.items.findIndex(
      (i: { slug: string; packageOption: string }) =>
        i.slug === slug && i.packageOption === (packageOption || ""),
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 },
      );
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return NextResponse.json({ success: true, data: cart.items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
