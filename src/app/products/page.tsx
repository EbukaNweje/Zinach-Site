"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../../lib/products";
import AddToCartButton from "../../components/AddToCartButton";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
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

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl bg-white shadow-md overflow-hidden"
              >
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 rounded-full bg-slate-200" />
                  <div className="h-6 w-40 rounded bg-slate-200" />
                  <div className="h-8 w-28 rounded bg-slate-200" />
                  <div className="h-12 rounded-2xl bg-slate-200" />
                  <div className="h-12 rounded-2xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <p className="text-lg font-semibold text-slate-900">
              No Products available
            </p>
            <p className="mt-3 text-slate-500">
              Check back soon — products will appear here once added.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const selected = selectedOptions[product._id] ?? "";
              return (
                <article
                  key={product._id}
                  className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <Link href={`/product/${product.slug}`} className="block">
                    <div className="relative aspect-[4/3] w-full bg-slate-100">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200" />
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5 gap-3">
                    {/* Brand badge */}
                    <span className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
                      {product.brand}
                    </span>

                    {/* Name */}
                    <h2 className="text-xl font-bold text-[#1a2744]">
                      {product.name}
                    </h2>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-slate-400">
                        per capsule
                      </span>
                      <span className="text-3xl font-bold text-[#1a2744]">
                        {product.price.startsWith("$")
                          ? product.price
                          : `$${product.price}`}
                      </span>
                    </div>

                    {/* Package option select */}
                    <div className="relative mt-1">
                      <select
                        value={selected}
                        onChange={(e) =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [product._id]: e.target.value,
                          }))
                        }
                        className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 pr-10"
                      >
                        <option value="">— Select option —</option>
                        {product.packageOptions?.map((opt) => (
                          <option key={opt.label} value={opt.label}>
                            {opt.label} —{" "}
                            {opt.price.startsWith("$")
                              ? opt.price
                              : `$${opt.price}`}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        ▾
                      </span>
                    </div>

                    {/* Add to Cart button */}
                    <div className="mt-auto pt-1">
                      <AddToCartButton
                        product={product}
                        packageOption={selected || undefined}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
