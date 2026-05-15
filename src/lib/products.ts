import connectDB from "./db/mongoose";
import ProductModel from "./models/Product";

export interface Product {
  _id: string;
  slug: string;
  name: string;
  brand?: string;
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
    // Ensure returned objects are plain JSON-serializable values
    const sanitized = (products as unknown as Array<Record<string, any>>).map(
      (p) => ({
        ...p,
        _id: String(p._id),
        // Convert nested subdocument _id fields (packageOptions) to strings
        packageOptions: Array.isArray(p.packageOptions)
          ? p.packageOptions.map((opt: any) => ({
              ...opt,
              _id: opt && opt._id ? String(opt._id) : undefined,
            }))
          : [],
        features: Array.isArray(p.features) ? p.features : [],
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
      })
    );

    return sanitized as unknown as Product[];
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
    if (!product) return null;
    return ({
      ...product,
      _id: String((product as any)._id),
      packageOptions: Array.isArray(product.packageOptions)
        ? product.packageOptions.map((opt: any) => ({
            ...opt,
            _id: opt && opt._id ? String(opt._id) : undefined,
          }))
        : [],
      features: Array.isArray(product.features) ? product.features : [],
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : undefined,
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
    } as unknown) as Product;
  } catch {
    return null;
  }
}
