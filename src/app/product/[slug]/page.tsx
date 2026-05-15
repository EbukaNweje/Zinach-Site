import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchProductBySlug } from "../../../lib/products";
import AddToCartButton from "../../../components/AddToCartButton";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Main card */}
          <div className="rounded-4xl bg-white p-10 shadow-lg">
            <div className="overflow-hidden rounded-3xl bg-slate-100">
              {product.image ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200" />
              )}
            </div>

            <h1 className="mt-6 text-5xl font-semibold text-slate-900">
              {product.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {product.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}

            {/* Package options */}
            {product.packageOptions?.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-medium text-slate-600 mb-3">
                  Package options
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {product.packageOptions.map((opt) => (
                    <div
                      key={opt.label}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm text-slate-700">
                        {opt.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {opt.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <AddToCartButton product={product} />
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                View Cart
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Starting from
              </p>
              <p className="mt-3 text-4xl font-semibold">{product.price}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Why choose this product?
              </h2>
              <p className="text-slate-600">
                Trusted care from Dr William Makis MD with reliable shipping and
                physician-reviewed orders.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Order Benefits</p>
              <ul className="mt-4 space-y-3">
                <li>Doctor review required before approval</li>
                <li>If not approved, you will be 100% refunded</li>
                <li>Ships within 2–6 business days after approval</li>
                <li>Secure checkout — no hidden fees</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
