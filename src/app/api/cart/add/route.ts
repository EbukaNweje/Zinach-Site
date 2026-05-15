import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import CartModel from "@/lib/models/Cart";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing session ID" },
        { status: 400 },
      );
    }

    const {
      productId,
      slug,
      name,
      brand,
      price,
      image,
      packageOption,
      quantity = 1,
    } = await req.json();

    let cart = await CartModel.findOne({ sessionId });
    if (!cart) {
      cart = new CartModel({ sessionId, items: [] });
    }

    const existing = cart.items.find(
      (i: { slug: string; packageOption: string }) =>
        i.slug === slug && i.packageOption === (packageOption || ""),
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        slug,
        name,
        brand,
        price,
        image,
        packageOption: packageOption || "",
        quantity,
      });
    }

    await cart.save();
    return NextResponse.json({ success: true, data: cart.items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
