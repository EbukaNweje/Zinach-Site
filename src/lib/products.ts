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

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/products`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/products/${slug}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}
