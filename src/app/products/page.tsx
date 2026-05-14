import Link from "next/link";
import Image from "next/image";
import { fetchProducts } from "../../lib/products";
import AddToCartButton from "../../components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              Shop Products
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Available products
            </h1>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View Cart
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No products available yet.
            </p>
            <p className="mt-3 text-slate-500">
              Check back soon — products will appear here once added.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.slug}
                className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="overflow-hidden rounded-3xl bg-slate-50">
                  {product.image ? (
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" />
                  )}
                </div>

                <span className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  {product.brand}
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                  {product.name}
                </h2>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                  {product.description}
                </p>

                <div className="mt-4">
                  <p className="text-3xl font-bold text-slate-900">
                    {product.price}
                  </p>
                </div>

                {product.packageOptions?.length > 0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    {product.packageOptions.length} package option
                    {product.packageOptions.length > 1 ? "s" : ""} available
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <AddToCartButton product={product} />
                  <Link
                    href={`/product/${product.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
