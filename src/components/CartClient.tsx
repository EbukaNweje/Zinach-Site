"use client";

import Link from "next/link";
import Image from "next/image";
import { removeFromCart, updateCartQuantity } from "../lib/cart";
import { useCart } from "./CartContext";

export default function CartClient() {
  const { cartItems, cartCount, loading, clearCart, setCartItems } = useCart();

  const handleRemove = async (slug: string, packageOption = "") => {
    const updated = await removeFromCart(slug, packageOption);
    setCartItems(updated);
  };

  const handleQuantityChange = async (
    slug: string,
    quantity: number,
    packageOption = "",
  ) => {
    const updated = await updateCartQuantity(slug, quantity, packageOption);
    setCartItems(updated);
  };

  const handleClear = async () => {
    await clearCart();
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.price.replace(/[^0-9.]/g, "");
    return sum + (price ? Number(price) * item.quantity : 0);
  }, 0);

  if (loading) {
    return (
      <div className="rounded-4xl bg-white p-8 shadow-lg text-center py-20">
        <p className="text-slate-500 text-sm">Loading your cart…</p>
      </div>
    );
  }

  return (
    <div className="rounded-4xl bg-white p-8 shadow-lg">
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
          {cartCount > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-lg font-semibold text-slate-900">
            Your cart is empty.
          </p>
          <p className="mt-3 text-slate-600">
            Add products from the shop to review them here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={`${item.slug}-${item.packageOption}`}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {item.image ? (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-slate-200" />
                )}
                <div>
                  {item.brand ? (
                    <p className="text-xs text-slate-500">{item.brand}</p>
                  ) : null}
                  <h2 className="text-lg font-semibold text-slate-900">
                    {item.name}
                  </h2>
                  {item.packageOption && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.packageOption}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {item.price}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-slate-900 w-16 text-right">
                  $
                  {(
                    Number(item.price.replace(/[^0-9.]/g, "")) * item.quantity
                  ).toFixed(2)}
                </p>

                <button
                  type="button"
                  onClick={() => handleRemove(item.slug, item.packageOption)}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
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
            <div className="mt-6">
              <Link
                href="/billing"
                className="inline-flex items-center justify-center rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-white"
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
