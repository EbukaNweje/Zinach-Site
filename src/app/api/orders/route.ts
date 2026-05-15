import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import OrderModel from "@/lib/models/Order";
import { uploadImage } from "@/lib/cloudinary";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

export async function GET() {
  try {
    await connectDB();
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: orders });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    const customerRaw = formData.get("customer") as string;
    const itemsRaw = formData.get("items") as string;
    const total = formData.get("total") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const notes = formData.get("notes") as string | null;
    const proofFile = formData.get("proofImage") as File | null;

    const customer = JSON.parse(customerRaw);
    const items = JSON.parse(itemsRaw);

    let proofImageUrl = "";
    let proofImagePublicId = "";

    if (proofFile && proofFile.size > 0) {
      const buffer = Buffer.from(await proofFile.arrayBuffer());
      const uploaded = await uploadImage(buffer, "zinach/payment-proofs");
      proofImageUrl = uploaded.url;
      proofImagePublicId = uploaded.publicId;
    }

    // Generate order number inline (no pre-hook needed)
    const count = await OrderModel.countDocuments();
    const orderNumber = `ORD-${String(count + 1001).padStart(4, "0")}`;

    const order = new OrderModel({
      orderNumber,
      customer,
      items,
      total,
      paymentMethod,
      notes: notes ?? "",
      proofImageUrl,
      proofImagePublicId,
      paymentStatus: proofFile && proofFile.size > 0 ? "processing" : "pending",
    });

    await order.save();

    // Fire emails without blocking response
    Promise.all([
      sendOrderConfirmation(order).catch((e: Error) =>
        console.error("Order email failed:", e.message),
      ),
      sendAdminNotification(order).catch((e: Error) =>
        console.error("Admin email failed:", e.message),
      ),
    ]);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
