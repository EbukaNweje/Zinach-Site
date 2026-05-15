import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import ProductModel, { toSlug } from "@/lib/models/Product";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
  try {
    await connectDB();
    const products = await ProductModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: products });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const packageOptions = JSON.parse(
      (formData.get("packageOptions") as string) || "[]",
    );
    const imageFile = formData.get("image") as File | null;

    let imageUrl = "";
    let imagePublicId = "";

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploaded = await uploadImage(buffer, "zinach/products");
      imageUrl = uploaded.url;
      imagePublicId = uploaded.publicId;
    }

    // Generate unique slug
    const baseSlug = toSlug(name);
    const existing = await ProductModel.findOne({ slug: baseSlug });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const product = new ProductModel({
      name,
      price,
      description,
      image: imageUrl,
      imagePublicId,
      packageOptions,
      slug,
    });

    await product.save();
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
