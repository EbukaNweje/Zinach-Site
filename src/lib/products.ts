import connectDB from "./db/mongoose";
import ProductModel from "./models/Product";

export interface Product {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  price: string;
  description: string;
  image: string;
  features?: string[];
  packageOptions: { label: string; price: string }[];
}

// Used in server components — queries MongoDB directly (no HTTP round-trip)
export async function fetchProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await ProductModel.find().sort({ createdAt: -1 }).lean();
    return products as unknown as Product[];
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    await connectDB();
    const product = await ProductModel.findOne({ slug }).lean();
    return product as unknown as Product | null;
  } catch {
    return null;
  }
}
