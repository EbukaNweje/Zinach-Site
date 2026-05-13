import Link from "next/link";
import AddToCartButton from "../../components/AddToCartButton";
import { products } from "../../lib/products";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              Shop Products
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Explore our available medicines
            </h1>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View Cart
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.slug}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-6 h-56 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" />
              <span className="mb-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                {product.brand}
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">
                {product.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {product.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Per capsule</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {product.price}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/product/${product.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    View Details
                  </Link>
                  <AddToCartButton product={product} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
