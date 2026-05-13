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
              Explore our available Ivermectin kits
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
              <div className="overflow-hidden rounded-[1.75rem] bg-slate-50">
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" />
              </div>
              <span className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                {product.brand}
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                {product.name}
              </h2>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    per capsule
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {product.price}
                  </p>
                </div>
              </div>
              <select className="mt-6 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400">
                <option>— Select option —</option>
              </select>
              <div className="mt-5">
                <AddToCartButton product={product} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
