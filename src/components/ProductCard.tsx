"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../lib/products";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const [selected, setSelected] = useState("");

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
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
        {product.brand ? (
          <span className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
            {product.brand}
          </span>
        ) : null}

        {/* Name */}
        <h2 className="text-xl font-bold text-[#1a2744]">{product.name}</h2>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-slate-400">per capsule</span>
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
            onChange={(e) => setSelected(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 pr-10"
          >
            <option value="">— Select option —</option>
            {product.packageOptions?.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label} —{" "}
                {opt.price.startsWith("$") ? opt.price : `$${opt.price}`}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>

        {/* Add to Cart */}
        <div className="mt-auto pt-1">
          <AddToCartButton
            product={product}
            packageOption={selected || undefined}
          />
        </div>
      </div>
    </article>
  );
}
