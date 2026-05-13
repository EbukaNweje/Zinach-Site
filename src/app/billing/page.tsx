"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "../../lib/products";
import { getCart } from "../../lib/cart";

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

export default function BillingPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [cartEntries, setCartEntries] = useState<
    {
      slug: string;
      quantity: number;
      product: (typeof products)[number] | null;
    }[]
  >([]);

  useEffect(() => {
    const cart = getCart();
    setCartEntries(
      cart.map((item) => ({
        ...item,
        product: products.find((product) => product.slug === item.slug) ?? null,
      })),
    );
  }, []);

  const subtotal = useMemo(() => {
    return cartEntries.reduce((sum, entry) => {
      const price = entry.product?.price.replace(/[^0-9.]/g, "");
      return sum + (price ? Number(price) * entry.quantity : 0);
    }, 0);
  }, [cartEntries]);

  const shippingFee = useMemo(
    () =>
      shippingOptions.find((option) => option.value === form.shippingMethod)
        ?.fee ?? 0,
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

  function updateField(field: string, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.agree) {
      return;
    }
    router.push(`/payment?method=${encodeURIComponent(form.paymentMethod)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <form
          onSubmit={handleSubmit}
          className="grid gap-10 lg:grid-cols-[1.65fr_1fr]"
        >
          <div className="rounded-[2rem] bg-white p-10 shadow-lg">
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
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
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
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
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
                    onChange={(event) =>
                      updateField("contactNumber", event.target.value)
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
                      onChange={(event) =>
                        updateField("streetAddress", event.target.value)
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
                      onChange={(event) =>
                        updateField("streetAddress2", event.target.value)
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
                      onChange={(event) =>
                        updateField("city", event.target.value)
                      }
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
                      onChange={(event) =>
                        updateField("stateProvince", event.target.value)
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
                      onChange={(event) =>
                        updateField("postalCode", event.target.value)
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
                      onChange={(event) =>
                        updateField("country", event.target.value)
                      }
                      className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <label className="flex items-center gap-3 text-slate-800">
                    <input
                      type="checkbox"
                      checked={form.sameShipping}
                      onChange={(event) =>
                        updateField("sameShipping", event.target.checked)
                      }
                      className="h-5 w-5 rounded border-slate-300 text-slate-900"
                    />
                    Shipping address same as billing address?
                  </label>
                  <label className="flex items-center gap-3 text-slate-800">
                    <input
                      type="checkbox"
                      checked={form.expressShipping}
                      onChange={(event) =>
                        updateField("expressShipping", event.target.checked)
                      }
                      className="h-5 w-5 rounded border-slate-300 text-slate-900"
                    />
                    Express Shipping?
                  </label>
                </div>
              </div>

              <div className="rounded-[2rem] bg-slate-50 p-6 text-slate-700">
                <h2 className="text-lg font-semibold text-slate-900">
                  Payment Authorization & Order Processing Agreement
                </h2>
                <p className="mt-4 leading-7">
                  By proceeding with this purchase, you acknowledge and agree
                  that full payment must be successfully completed and confirmed
                  before your order can be processed, prepared, and dispatched.
                  All orders are subject to payment verification, and no
                  shipment will be initiated until funds have been received in
                  full and cleared through our payment system.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-8 rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                  Order summary
                </p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900">
                  Cart total
                </h2>
                <p className="mt-3 text-slate-600">
                  Review shipping, VAT, and the final total before checkout.
                </p>
              </div>

              {cartEntries.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
                  Your cart is empty. Add products first to see the order
                  summary.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {cartEntries.map((entry) => (
                      <div
                        key={entry.slug}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {entry.product?.name || entry.slug}
                            </p>
                            <p className="text-sm text-slate-600">
                              Qty {entry.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-900">
                            $
                            {(
                              (entry.product?.price.replace(/[^0-9.]/g, "")
                                ? Number(
                                    entry.product?.price.replace(
                                      /[^0-9.]/g,
                                      "",
                                    ),
                                  )
                                : 0) * entry.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-5">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Payment Method*
                      </p>
                      <div className="mt-4 grid gap-3">
                        {[
                          { label: "Chime", value: "Chime" },
                          { label: "Apple Pay", value: "Apple Pay" },
                          { label: "Zelle", value: "Zelle" },
                          { label: "PayPal", value: "PayPal" },
                          { label: "Venmo", value: "Venmo" },
                          { label: "Credit Card", value: "Credit Card" },
                          { label: "BTC address", value: "BTC address" },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-3xl border p-4 transition ${
                              form.paymentMethod === option.value
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                            }`}
                          >
                            <span>{option.label}</span>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={option.value}
                              checked={form.paymentMethod === option.value}
                              onChange={(event) =>
                                updateField("paymentMethod", event.target.value)
                              }
                              className="h-4 w-4 text-slate-900"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Shipping method
                      </p>
                      <select
                        value={form.shippingMethod}
                        onChange={(event) =>
                          updateField("shippingMethod", event.target.value)
                        }
                        className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
                      >
                        {shippingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 text-slate-700">
                      <div className="flex items-center justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Shipping fee</span>
                        <span>${shippingFee.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>VAT (8%)</span>
                        <span>${vat.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-900 p-5 text-white">
                      <div className="flex items-center justify-between text-sm uppercase tracking-[0.24em] text-slate-400">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.agree}
                        onChange={(event) =>
                          updateField("agree", event.target.checked)
                        }
                        className="h-5 w-5 rounded border-slate-300 text-slate-900"
                      />
                      I have read and agree to the payment authorization and
                      order processing agreement.
                    </label>

                    <button
                      type="submit"
                      disabled={!form.agree}
                      className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
