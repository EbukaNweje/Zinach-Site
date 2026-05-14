"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../components/CartContext";

const initialForm = {
  fullName: "",
  email: "",
  contactNumber: "",
  streetAddress: "",
  streetAddress2: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  country: "",
  sameShipping: true,
  expressShipping: false,
  shippingMethod: "standard",
  paymentMethod: "Chime",
  agree: false,
};

const shippingOptions = [
  { label: "FedEx Standard — $10.00", value: "standard", fee: 10 },
  { label: "FedEx Overnight — $50.00", value: "overnight", fee: 50 },
  { label: "UPS Express — $30.00", value: "express", fee: 30 },
];

const paymentMethods = [
  "Chime",
  "Apple Pay",
  "Zelle",
  "PayPal",
  "Venmo",
  "Credit Card",
  "BTC",
];

export default function BillingPage() {
  const router = useRouter();
  const { cartItems, loading } = useCart();
  const [form, setForm] = useState(initialForm);

  function updateField(field: string, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price.replace(/[^0-9.]/g, "")) || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const shippingFee = useMemo(
    () =>
      shippingOptions.find((o) => o.value === form.shippingMethod)?.fee ?? 0,
    [form.shippingMethod],
  );

  const vat = useMemo(
    () => Number(((subtotal + shippingFee) * 0.08).toFixed(2)),
    [subtotal, shippingFee],
  );

  const total = useMemo(
    () => subtotal + shippingFee + vat,
    [subtotal, shippingFee, vat],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.agree) return;
    router.push(
      `/payment?method=${encodeURIComponent(form.paymentMethod)}&amount=${total.toFixed(2)}`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <form
          onSubmit={handleSubmit}
          className="grid gap-10 lg:grid-cols-[1.65fr_1fr]"
        >
          {/* ── Left: billing details ── */}
          <div className="rounded-4xl bg-white p-10 shadow-lg">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Billing
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                Complete your payment details
              </h1>
              <p className="mt-3 text-slate-600">
                Fill out the form below and proceed to payment for final
                confirmation.
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Full Name
                  </span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    E-mail
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Contact Number
                  </span>
                  <input
                    required
                    value={form.contactNumber}
                    onChange={(e) =>
                      updateField("contactNumber", e.target.value)
                    }
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                  />
                </label>
              </div>

              <div className="rounded-4xl bg-slate-50 p-6">
                <h2 className="mb-5 text-xl font-semibold text-slate-900">
                  Billing Address
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">
                      Street Address
                    </span>
                    <input
                      required
                      value={form.streetAddress}
                      onChange={(e) =>
                        updateField("streetAddress", e.target.value)
                      }
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">
                      Street Address Line 2
                    </span>
                    <input
                      value={form.streetAddress2}
                      onChange={(e) =>
                        updateField("streetAddress2", e.target.value)
                      }
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      City
                    </span>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      State / Province
                    </span>
                    <input
                      required
                      value={form.stateProvince}
                      onChange={(e) =>
                        updateField("stateProvince", e.target.value)
                      }
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Postal / Zip Code
                    </span>
                    <input
                      required
                      value={form.postalCode}
                      onChange={(e) =>
                        updateField("postalCode", e.target.value)
                      }
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Country
                    </span>
                    <input
                      required
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 rounded-3xl border border-slate-200 bg-white p-5">
                <label className="flex items-center gap-3 text-slate-800 text-sm">
                  <input
                    type="checkbox"
                    checked={form.sameShipping}
                    onChange={(e) =>
                      updateField("sameShipping", e.target.checked)
                    }
                    className="h-5 w-5 rounded border-slate-300"
                  />
                  Shipping address same as billing
                </label>
                <label className="flex items-center gap-3 text-slate-800 text-sm">
                  <input
                    type="checkbox"
                    checked={form.expressShipping}
                    onChange={(e) =>
                      updateField("expressShipping", e.target.checked)
                    }
                    className="h-5 w-5 rounded border-slate-300"
                  />
                  Express Shipping
                </label>
              </div>

              <div className="rounded-4xl bg-slate-50 p-6 text-slate-700">
                <h2 className="text-lg font-semibold text-slate-900">
                  Payment Authorization &amp; Order Processing Agreement
                </h2>
                <p className="mt-4 leading-7">
                  By proceeding with this purchase, you acknowledge and agree
                  that full payment must be successfully completed and confirmed
                  before your order can be processed, prepared, and dispatched.
                  All orders are subject to payment verification, and no
                  shipment will be initiated until funds have been received in
                  full.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: order summary ── */}
          <aside className="space-y-6">
            <div className="sticky top-8 rounded-4xl bg-white p-8 shadow-lg">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                Order summary
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">
                Cart total
              </h2>

              {loading ? (
                <p className="mt-6 text-sm text-slate-400">Loading cart…</p>
              ) : cartItems.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500 text-sm">
                  Your cart is empty. Add products first.
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {/* Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.slug}-${item.packageOption}`}
                        className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.name}
                          </p>
                          {item.packageOption && (
                            <p className="text-xs text-slate-400">
                              {item.packageOption}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          $
                          {(
                            Number(item.price.replace(/[^0-9.]/g, "")) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Payment method */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Payment Method *
                    </p>
                    <div className="grid gap-2">
                      {paymentMethods.map((option) => (
                        <label
                          key={option}
                          className={`flex w-full cursor-pointer items-center justify-between rounded-3xl border p-4 transition ${
                            form.paymentMethod === option
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          <span className="text-sm">{option}</span>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={option}
                            checked={form.paymentMethod === option}
                            onChange={(e) =>
                              updateField("paymentMethod", e.target.value)
                            }
                            className="h-4 w-4"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Shipping method
                    </p>
                    <select
                      value={form.shippingMethod}
                      onChange={(e) =>
                        updateField("shippingMethod", e.target.value)
                      }
                      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                    >
                      {shippingOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (8%)</span>
                      <span>${vat.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-900 p-5 text-white flex items-center justify-between">
                    <span className="text-sm uppercase tracking-[0.24em] text-slate-400">
                      Total
                    </span>
                    <span className="text-xl font-bold">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={(e) => updateField("agree", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-slate-300"
                    />
                    I have read and agree to the payment authorization and order
                    processing agreement.
                  </label>

                  <button
                    type="submit"
                    disabled={!form.agree || cartItems.length === 0}
                    className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
