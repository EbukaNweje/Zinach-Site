"use client";

import { Product } from "../lib/products";
import { addToCart } from "../lib/cart";
import { useCart } from "./CartContext";

export default function AddToCartButton({ product }: { product: Product }) {
  const { cartItems, refreshCart } = useCart();
  const isAdded = cartItems.some((item) => item.slug === product.slug);

  const handleAdd = () => {
    addToCart(product.slug);
    refreshCart();
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
        isAdded
          ? "bg-slate-300 text-slate-800"
          : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {isAdded ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
