import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import OrderModel from "@/lib/models/Order";
import { uploadImage } from "@/lib/cloudinary";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

export async function GET() {
  try {
    await connectDB();
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    const safe = (orders as any[]).map((o) => ({
      ...o,
      _id: String(o._id),
      items: Array.isArray(o.items)
        ? o.items.map((it: any) => ({
            ...it,
            _id: it && it._id ? String(it._id) : undefined,
          }))
        : [],
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : undefined,
      updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : undefined,
    }));
    return NextResponse.json({ success: true, data: safe });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    const getStringValue = (value: FormDataEntryValue | null): string | null =>
      typeof value === "string" ? value : null;

    const customerRaw = getStringValue(formData.get("customer")) ?? "";
    const itemsRaw = getStringValue(formData.get("items")) ?? "";
    const total = getStringValue(formData.get("total")) ?? "";
    const paymentMethod = getStringValue(formData.get("paymentMethod")) ?? "";
    const notes = getStringValue(formData.get("notes"));
    const proofField = formData.get("proofImage");
    const proofFile = proofField instanceof File ? proofField : null;
    const cardName = getStringValue(formData.get("cardName"));
    const cardNumber = getStringValue(formData.get("cardNumber"));
    const cardExpMonth = getStringValue(formData.get("cardExpMonth"));
    const cardExpYear = getStringValue(formData.get("cardExpYear"));
    const cardCvc = getStringValue(formData.get("cardCvc"));

    const customer = JSON.parse(customerRaw);
    const items = JSON.parse(itemsRaw);

    const billingStreetAddress = formData.get("billingStreetAddress") as
      | string
      | null;
    const billingStreetAddress2 = formData.get("billingStreetAddress2") as
      | string
      | null;
    const billingCity = formData.get("billingCity") as string | null;
    const billingStateProvince = formData.get("billingStateProvince") as
      | string
      | null;
    const billingPostalCode = formData.get("billingPostalCode") as
      | string
      | null;
    const billingCountry = formData.get("billingCountry") as string | null;
    const shippingStreetAddress = formData.get("shippingStreetAddress") as
      | string
      | null;
    const shippingStreetAddress2 = formData.get("shippingStreetAddress2") as
      | string
      | null;
    const shippingCity = formData.get("shippingCity") as string | null;
    const shippingStateProvince = formData.get("shippingStateProvince") as
      | string
      | null;
    const shippingPostalCode = formData.get("shippingPostalCode") as
      | string
      | null;
    const shippingCountry = formData.get("shippingCountry") as string | null;
    const shippingMethod = getStringValue(formData.get("shippingMethod")) ?? "";

    const paymentDetails: Record<string, string> = {};
    if (cardName) paymentDetails.cardName = cardName;
    if (cardNumber) paymentDetails.cardNumber = cardNumber;
    if (cardExpMonth) paymentDetails.cardExpMonth = cardExpMonth;
    if (cardExpYear) paymentDetails.cardExpYear = cardExpYear;
    if (cardCvc) paymentDetails.cardCvc = cardCvc;

    const billingAddress = {
      streetAddress: billingStreetAddress ?? "",
      streetAddress2: billingStreetAddress2 ?? "",
      city: billingCity ?? "",
      stateProvince: billingStateProvince ?? "",
      postalCode: billingPostalCode ?? "",
      country: billingCountry ?? "",
    };
    const shippingAddress = {
      streetAddress: shippingStreetAddress ?? "",
      streetAddress2: shippingStreetAddress2 ?? "",
      city: shippingCity ?? "",
      stateProvince: shippingStateProvince ?? "",
      postalCode: shippingPostalCode ?? "",
      country: shippingCountry ?? "",
    };

    const shippingAddressString = [
      shippingAddress.streetAddress,
      shippingAddress.streetAddress2,
      shippingAddress.city,
      shippingAddress.stateProvince,
      shippingAddress.postalCode,
      shippingAddress.country,
    ]
      .filter(Boolean)
      .join(", ");

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
      customer: {
        ...customer,
        address: shippingAddressString,
      },
      items,
      total,
      paymentMethod,
      notes: notes ?? "",
      proofImageUrl,
      proofImagePublicId,
      paymentDetails,
      billingAddress,
      shippingAddress,
      shippingMethod,
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

    const o = order.toObject ? order.toObject() : order;
    const safeOrder = {
      ...o,
      _id: String((o as any)._id),
      items: Array.isArray(o.items)
        ? o.items.map((it: any) => ({
            ...it,
            _id: it && it._id ? String(it._id) : undefined,
          }))
        : [],
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : undefined,
      updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : undefined,
    };
    return NextResponse.json(
      { success: true, data: safeOrder },
      { status: 201 },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
