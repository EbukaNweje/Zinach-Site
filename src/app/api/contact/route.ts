import connectDB from "@/lib/db/mongoose";
import ContactMessage from "@/lib/models/ContactMessage";
import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address." },
        { status: 400 },
      );
    }

    await connectDB();
    await ContactMessage.create({ name, email, subject, message });

    await sendContactEmail({ name, email, subject, message });
    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (err: unknown) {
    console.error("Contact email error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}
