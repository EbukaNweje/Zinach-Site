import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import ProductModel from "@/lib/models/Product";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    // Support lookup by slug or _id
    const product = await ProductModel.findOne({
      $or: [{ slug: id }, { _id: id.match(/^[a-f\d]{24}$/i) ? id : null }],
    }).lean();
    if (!product)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const formData = await req.formData();

    const product = await ProductModel.findById(id);
    if (!product)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );

    const name = formData.get("name") as string | null;
    const price = formData.get("price") as string | null;
    const description = formData.get("description") as string | null;
    const packageOptionsRaw = formData.get("packageOptions") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (name) product.name = name;
    if (price) product.price = price;
    if (description !== null) product.description = description;
    if (packageOptionsRaw)
      product.packageOptions = JSON.parse(packageOptionsRaw);

    if (imageFile && imageFile.size > 0) {
      if (product.imagePublicId) await deleteImage(product.imagePublicId);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploaded = await uploadImage(buffer, "zinach/products");
      product.image = uploaded.url;
      product.imagePublicId = uploaded.publicId;
    }

    await product.save();
    return NextResponse.json({ success: true, data: product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await ProductModel.findById(id);
    if (!product)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    if (product.imagePublicId) await deleteImage(product.imagePublicId);
    await product.deleteOne();
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
