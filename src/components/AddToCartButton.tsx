"use client";

import { useState } from "react";
import { Product } from "../lib/products";
import { addToCart } from "../lib/cart";
import { useCart } from "./CartContext";

export default function AddToCartButton({
  product,
  packageOption,
}: {
  product: Product;
  packageOption?: string;
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
      const updated = await addToCart({
        productId: product._id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: packageOption
          ? (product.packageOptions.find((o) => o.label === packageOption)
              ?.price ?? product.price)
          : product.price,
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
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
        isAdded
          ? "bg-emerald-600 text-white cursor-default"
          : adding
            ? "bg-slate-400 text-white cursor-not-allowed"
            : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {isAdded ? "Added ✓" : adding ? "Adding…" : "Add to Cart"}
    </button>
  );
}
