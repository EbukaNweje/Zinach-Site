"use client";

import { useState } from "react";
import { Product } from "../lib/products";
import { addToCart } from "../lib/cart";
import { useCart } from "./CartContext";

export default function AddToCartButton({
  product,
  packageOption,
  fullWidth = true,
}: {
  product: Product;
  packageOption?: string;
  fullWidth?: boolean;
}) {
  const { cartItems, setCartItems } = useCart();
  const [adding, setAdding] = useState(false);

  const isAdded = cartItems.some(
    (item) =>
      item.slug === product.slug &&
      (item.packageOption ?? "") === (packageOption ?? ""),
  );

  const handleAdd = async () => {
    if (isAdded || adding) return;
    setAdding(true);
    try {
      const optPrice = packageOption
        ? product.packageOptions?.find((o) => o.label === packageOption)?.price
        : undefined;
      const price = optPrice ?? product.price;

      const updated = await addToCart({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: price.startsWith("$") ? price : `$${price}`,
        image: product.image,
        packageOption: packageOption ?? "",
        quantity: 1,
      });
      setCartItems(updated);
    } finally {
      setAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={adding}
      className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-bold tracking-wide transition ${
        isAdded
          ? "bg-emerald-600 text-white cursor-default"
          : adding
            ? "bg-slate-400 text-white cursor-not-allowed"
            : "bg-[#1a2744] text-white hover:bg-[#243460] active:scale-[0.98]"
      }`}
    >
      {isAdded ? "Added to Cart ✓" : adding ? "Adding…" : "Add to Cart"}
    </button>
  );
}
