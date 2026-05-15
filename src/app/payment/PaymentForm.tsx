"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartContext";

export type PaymentMethod =
  | "Chime"
  | "Apple Pay"
  | "Zelle"
  | "PayPal"
  | "Venmo"
  | "Credit Card"
  | "BTC";

type PaymentField = { label: string; value: string };

type PaymentMethodDetails = {
  title: string;
  note: string;
  fields: PaymentField[];
  instructions: string[];
};

const methodDetails: Record<PaymentMethod, PaymentMethodDetails> = {
  Chime: {
    title: "Chime Payment Information",
    note: "Copy the tag and name below to pay with Chime.",
    fields: [
      { label: "Tag", value: "@DrWilliamChime" },
      { label: "Name", value: "Dr William Makis" },
    ],
    instructions: [
      "Open your Chime app.",
      "Copy the tag and name shown below.",
      "Send the exact total amount.",
      "Save the screenshot for your records.",
    ],
  },
  "Apple Pay": {
    title: "Apple Pay Payment Information",
    note: "Use the Apple Pay link below to complete the payment.",
    fields: [
      { label: "Link", value: "applepay://pay?pa=drwmakis@applepay.com" },
      { label: "Name", value: "Dr William Makis" },
    ],
    instructions: [
      "Open Apple Pay on your device.",
      "Copy the payment link below.",
      "Send the exact total amount.",
      "Save the confirmation screenshot.",
    ],
  },
  Zelle: {
    title: "Zelle Payment Information",
    note: "Copy the email and name below to pay with Zelle.",
    fields: [
      { label: "Email", value: "drwmakis@zelle.com" },
      { label: "Name", value: "Dr William Makis" },
    ],
    instructions: [
      "Open your bank or Zelle app.",
      "Send payment to the email shown below.",
      "Confirm the exact amount before sending.",
      "Keep the screenshot as proof.",
    ],
  },
  PayPal: {
    title: "PayPal Payment Information",
    note: "Strictly friends and family. Copy the email and name below.",
    fields: [
      { label: "Email", value: "drwmakis-paypal@example.com" },
      { label: "Name", value: "Dr William Makis" },
    ],
    instructions: [
      "Open PayPal and choose Send Money.",
      "Use the email shown below.",
      "Select friends and family.",
      "Send the exact total amount.",
    ],
  },
  Venmo: {
    title: "Venmo Payment Information",
    note: "Copy the tag, name, and last digit code below.",
    fields: [
      { label: "Tag", value: "@DrWilliamVenmo" },
      { label: "Name", value: "Dr William Makis" },
      { label: "Last digit code", value: "1234" },
    ],
    instructions: [
      "Open Venmo and search for the handle below.",
      "Send payment for the exact amount.",
      "Include the last digit code in your notes.",
      "Save a screenshot of the transfer.",
    ],
  },
  "Credit Card": {
    title: "Credit Card Checkout",
    note: "Enter your card details below to pay securely.",
    fields: [],
    instructions: [
      "Enter your card number, expiration, and CVV.",
      "Review the order total.",
      "Submit the payment.",
      "Keep the receipt confirmation.",
    ],
  },
  BTC: {
    title: "BTC Payment Information",
    note: "Copy the Bitcoin address below to complete your payment.",
    fields: [
      { label: "BTC Address", value: "bc1qdrwmakisbtc0000000000000000" },
    ],
    instructions: [
      "Open your Bitcoin wallet.",
      "Send BTC to the address shown below.",
      "Confirm the amount matches the USD total.",
      "Save the blockchain confirmation.",
    ],
  },
};

export default function PaymentForm({
  selectedMethod,
  amount,
  customerName: initialName,
  customerEmail: initialEmail,
  customerPhone: initialPhone,
}: {
  selectedMethod: PaymentMethod;
  amount: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  const { cartItems, clearCart } = useCart();

  // Method is fixed to what was chosen on billing — no switching here
  const method = selectedMethod;
  const details = methodDetails[method];
  const showCardFields = method === "Credit Card";
  const showProofUpload = method !== "Credit Card";

  // Pre-filled from billing page
  const [customerName, setCustomerName] = useState(initialName ?? "");
  const [customerEmail, setCustomerEmail] = useState(initialEmail ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialPhone ?? "");

  // Card fields (only for Credit Card)
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

  const handleCopy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates((prev) => ({ ...prev, [label]: true }));
      setTimeout(
        () => setCopyStates((prev) => ({ ...prev, [label]: false })),
        2000,
      );
    } catch {
      // silently fail
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customerName || !customerEmail) {
      setStatusMessage("Please enter your name and email.");
      return;
    }

    setSubmitStatus("submitting");
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append(
        "customer",
        JSON.stringify({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        }),
      );

      const items =
        cartItems && cartItems.length > 0
          ? cartItems.map((item) => ({
              name: item.name,
              brand: item.brand ?? "",
              price: item.price,
              quantity: item.quantity ?? 1,
              packageOption: item.packageOption ?? "",
            }))
          : [{ name: "Order", price: amount, quantity: 1 }];

      formData.append("items", JSON.stringify(items));
      formData.append("total", amount);
      formData.append("paymentMethod", method);
      if (paymentProof) formData.append("proofImage", paymentProof);

      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order.");

      clearCart?.();
      setSubmitStatus("success");
      setStatusMessage(
        `Order ${data.data?.orderNumber ?? ""} placed! Check your email for confirmation.`,
      );
    } catch (err: unknown) {
      setSubmitStatus("error");
      setStatusMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-slate-900 p-8 shadow-2xl">
          <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
            {/* ── Left column ── */}
            <div className="space-y-6">
              {/* Selected payment method — display only */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-4">
                  Payment method
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {method}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Selected on the billing page.{" "}
                  <Link
                    href="/billing"
                    className="text-slate-400 underline hover:text-white"
                  >
                    Change
                  </Link>
                </p>
              </div>

              {/* Order total */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Order total
                </p>
                <p className="mt-4 text-5xl font-bold text-white">${amount}</p>
                <p className="mt-2 text-sm text-slate-400">via {method}</p>
              </div>

              {/* Summary */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Summary
                </p>
                <h2 className="mt-4 text-xl font-semibold text-white">
                  {details.title}
                </h2>
                <p className="mt-2 text-sm text-slate-400">{details.note}</p>
              </div>

              {/* Instructions */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-4">
                  Payment instructions
                </p>
                <ol className="space-y-3 text-sm leading-7 text-slate-300 list-decimal list-inside">
                  {details.instructions.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* ── Right column ── */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Your details — pre-filled from billing */}
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Your details
                </p>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name *"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition focus:border-slate-500 placeholder:text-slate-500"
                />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email address * (for order confirmation)"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition focus:border-slate-500 placeholder:text-slate-500"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none transition focus:border-slate-500 placeholder:text-slate-500"
                />
              </div>

              {/* Payment method fields */}
              {showCardFields ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Card details
                  </p>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card number *"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none focus:border-slate-500 placeholder:text-slate-500"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value)}
                      placeholder="MM"
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none focus:border-slate-500 placeholder:text-slate-500"
                    />
                    <input
                      type="text"
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value)}
                      placeholder="YYYY"
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none focus:border-slate-500 placeholder:text-slate-500"
                    />
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVV"
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none focus:border-slate-500 placeholder:text-slate-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Cardholder name"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white outline-none focus:border-slate-500 placeholder:text-slate-500"
                  />
                </div>
              ) : (
                /* Payment info fields with copy buttons */
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
                    {method} details — copy &amp; send payment
                  </p>
                  {details.fields.map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {field.label}
                        </p>
                        <p className="mt-1 text-base font-semibold text-white break-all">
                          {field.value}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(field.label, field.value)}
                        className="flex-shrink-0 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                      >
                        {copyStates[field.label] ? "Copied ✓" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Proof upload */}
              {showProofUpload && (
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">
                    Upload payment proof
                  </p>
                  <label className="flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-4 py-5 text-center transition hover:border-slate-500">
                    <span className="text-3xl mb-2">📎</span>
                    <span className="text-sm font-medium text-slate-200">
                      {paymentProof
                        ? paymentProof.name
                        : "Click to upload screenshot or PDF"}
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      JPG, PNG, PDF — max 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setPaymentProof(e.target.files?.[0] ?? null)
                      }
                      className="sr-only"
                    />
                  </label>
                </div>
              )}

              {/* Status message */}
              {statusMessage && (
                <div
                  className={`rounded-2xl border p-4 text-sm ${
                    submitStatus === "success"
                      ? "border-emerald-700 bg-emerald-950/50 text-emerald-300"
                      : submitStatus === "error"
                        ? "border-red-700 bg-red-950/50 text-red-300"
                        : "border-slate-700 bg-slate-900 text-slate-300"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              {/* Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/billing"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  ← Back to billing
                </Link>
                <button
                  type="submit"
                  disabled={
                    submitStatus === "submitting" || submitStatus === "success"
                  }
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitStatus === "submitting"
                    ? "Placing order…"
                    : submitStatus === "success"
                      ? "Order placed ✓"
                      : `Confirm & Pay $${amount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
