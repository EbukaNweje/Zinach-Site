import connectDB from "@/lib/db/mongoose";
import ContactMessage from "@/lib/models/ContactMessage";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Contact messages fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load contact messages." },
      { status: 500 },
    );
  }
}
