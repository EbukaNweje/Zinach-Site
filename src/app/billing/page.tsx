"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
  paymentMethod: "Paypal",
  agree: false,
};

export default function BillingPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);

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
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="mb-10 rounded-[2rem] bg-white p-10 shadow-lg">
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

          <form onSubmit={handleSubmit} className="space-y-8">
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
                  onChange={(event) => updateField("email", event.target.value)}
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

            <div className="rounded-[2rem] bg-slate-50 p-6">
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

              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">
                  Payment Method*
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Paypal", value: "Paypal" },
                    { label: "CashApp", value: "CashApp" },
                    { label: "Venmo", value: "Venmo" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center justify-between rounded-3xl border p-4 transition ${
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
            </div>

            <div className="rounded-[2rem] bg-slate-50 p-6 text-slate-700">
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Authorization & Order Processing Agreement
              </h2>
              <p className="mt-4 leading-7">
                By proceeding with this purchase, you acknowledge and agree that
                full payment must be successfully completed and confirmed before
                your order can be processed, prepared, and dispatched. All
                orders are subject to payment verification, and no shipment will
                be initiated until funds have been received in full and cleared
                through our payment system.
              </p>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(event) => updateField("agree", event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-slate-900"
              />
              I have read and agree to the payment authorization and order
              processing agreement.
            </label>

            <button
              type="submit"
              disabled={!form.agree}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Proceed to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
