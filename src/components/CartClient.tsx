"use client";

import { useMemo } from "react";
import Link from "next/link";
import { products } from "../lib/products";
import { clearCart, removeFromCart, updateCartQuantity } from "../lib/cart";
import { useCart } from "./CartContext";

type CartEntry = {
  slug: string;
  quantity: number;
  product: (typeof products)[number] | null;
};

export default function CartClient() {
  const { cartItems, refreshCart } = useCart();

  const entries = useMemo<CartEntry[]>(() => {
    return cartItems.map((item) => ({
      ...item,
      product: products.find((product) => product.slug === item.slug) ?? null,
    }));
  }, [cartItems]);

  const handleRemove = (slug: string) => {
    removeFromCart(slug);
    refreshCart();
  };

  const handleDecrease = (slug: string, currentQuantity: number) => {
    updateCartQuantity(slug, currentQuantity - 1);
    refreshCart();
  };

  const handleIncrease = (slug: string, currentQuantity: number) => {
    updateCartQuantity(slug, currentQuantity + 1);
    refreshCart();
  };

  const handleClear = () => {
    clearCart();
    refreshCart();
  };

  const total = entries.reduce((sum, item) => {
    const price = item.product?.price.replace(/[^0-9.]/g, "");
    return sum + (price ? Number(price) * item.quantity : 0);
  }, 0);

  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-lg">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Shopping Cart
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Your selected products
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="rounded-full border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Continue Shopping
          </Link>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-lg font-semibold text-slate-900">
            Your cart is empty.
          </p>
          <p className="mt-3 text-slate-600">
            Add products from the shop to review them here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry.slug}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm text-slate-500">{entry.product?.brand}</p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {entry.product?.name}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {entry.product?.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                <div className="flex items-center rounded-full border border-slate-200 bg-white text-slate-900">
                  <button
                    type="button"
                    onClick={() => handleDecrease(entry.slug, entry.quantity)}
                    className="h-10 w-10 rounded-l-full border-r border-slate-200 bg-slate-100 text-lg font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    –
                  </button>
                  <span className="px-4 text-sm font-semibold">
                    {entry.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrease(entry.slug, entry.quantity)}
                    className="h-10 w-10 rounded-r-full border-l border-slate-200 bg-slate-100 text-lg font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
                <span>{entry.product?.price}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(entry.slug)}
                  className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Order Summary
              </p>
              <p className="text-2xl font-semibold">
                Total: ${total.toFixed(2)}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/billing"
                className="inline-flex items-center justify-center rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
              >
                Checkout Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
