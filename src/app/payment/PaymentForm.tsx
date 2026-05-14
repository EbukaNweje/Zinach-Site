"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export type PaymentMethod =
  | "Chime"
  | "Apple Pay"
  | "Zelle"
  | "PayPal"
  | "Venmo"
  | "Credit Card"
  | "BTC address";

type PaymentField = {
  label: string;
  value: string;
};

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
  "BTC address": {
    title: "BTC Payment Information",
    note: "Copy the Bitcoin address below to complete your payment.",
    fields: [{ label: "BTC", value: "bc1qdrwmakisbtc0000000000000000" }],
    instructions: [
      "Open your Bitcoin wallet.",
      "Send BTC to the address shown below.",
      "Confirm the amount matches the USD total.",
      "Save the blockchain confirmation.",
    ],
  },
};

const paymentMethods: PaymentMethod[] = [
  "Chime",
  "Apple Pay",
  "Zelle",
  "PayPal",
  "Venmo",
  "BTC address",
  "Credit Card",
];

export default function PaymentForm({
  selectedMethod,
  amount,
}: {
  selectedMethod: PaymentMethod;
  amount: string;
}) {
  const [method, setMethod] = useState<PaymentMethod>(selectedMethod);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>("");

  const details = methodDetails[method];
  const showCardFields = method === "Credit Card";
  const showProofUpload = method !== "Credit Card";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPaymentProof(file);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied!");
      window.setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Copy failed");
      window.setTimeout(() => setCopyMessage(""), 2000);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(
      "Payment details saved. We will verify your payment and send confirmation shortly.",
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-[2rem] bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Payment method
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {paymentMethods.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMethod(option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        option === method
                          ? "bg-white text-slate-950 shadow-lg"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Order total
                </p>
                <p className="mt-4 text-5xl font-bold text-white">${amount}</p>
                <p className="mt-3 text-sm text-slate-400">
                  Selected method: {method}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Summary
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {details.title}
                </h2>
                <p className="mt-3 text-sm text-slate-400">{details.note}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Payment instructions
                </p>
                <ol className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                  {details.instructions.map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-[2rem] border border-slate-800 bg-slate-950 p-6"
              >
                {showCardFields ? (
                  <div className="space-y-6">
                    <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-slate-950/20">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                            Secure payment
                          </p>
                          <h2 className="mt-3 text-2xl font-semibold text-white">
                            Credit Card
                          </h2>
                        </div>
                        <div className="rounded-full bg-slate-800 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                          Secure checkout
                        </div>
                      </div>

                      <div className="mt-8 space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300">
                            Card Number *
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            className="mt-3 w-full rounded-[1.5rem] border border-slate-800 bg-slate-950 px-4 py-4 text-lg text-white outline-none transition focus:border-slate-500"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-300">
                              Exp Month *
                            </label>
                            <input
                              type="text"
                              value={cardExpMonth}
                              onChange={(e) => setCardExpMonth(e.target.value)}
                              placeholder="MM"
                              className="mt-3 w-full rounded-[1.5rem] border border-slate-800 bg-slate-950 px-4 py-4 text-lg text-white outline-none transition focus:border-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300">
                              Exp Year *
                            </label>
                            <input
                              type="text"
                              value={cardExpYear}
                              onChange={(e) => setCardExpYear(e.target.value)}
                              placeholder="YYYY"
                              className="mt-3 w-full rounded-[1.5rem] border border-slate-800 bg-slate-950 px-4 py-4 text-lg text-white outline-none transition focus:border-slate-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300">
                              CVV *
                            </label>
                            <input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="123"
                              className="mt-3 w-full rounded-[1.5rem] border border-slate-800 bg-slate-950 px-4 py-4 text-lg text-white outline-none transition focus:border-slate-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                        Cardholder name
                      </p>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="First Last"
                        className="mt-3 w-full rounded-[1.5rem] border border-slate-800 bg-slate-900 px-4 py-4 text-lg text-white outline-none transition focus:border-slate-500"
                      />
                      <p className="mt-3 text-sm text-slate-400">
                        Enter your credit card information exactly as it appears
                        on the card.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                      <div className="grid gap-4">
                        {details.fields.map((field) => (
                          <div
                            key={field.label}
                            className="rounded-3xl border border-slate-800 bg-slate-900 p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                                  {field.label}
                                </p>
                                <p className="mt-2 text-lg text-slate-100 break-words">
                                  {field.value}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(field.value)}
                                className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white transition hover:border-slate-500 hover:bg-slate-800"
                              >
                                {copyMessage || "Copy"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                        Ready to pay
                      </p>
                      <p className="mt-3 text-sm text-slate-400">
                        Copy the values above and complete your payment in the
                        selected app.
                      </p>
                    </div>
                  </div>
                )}

                {showProofUpload && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Upload Payment Proof
                    </label>
                    <label className="mt-3 flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900 px-4 py-6 text-center text-sm text-slate-400 transition hover:border-slate-500 hover:text-slate-200">
                      <span className="mb-4 inline-block text-4xl">📎</span>
                      <span className="font-medium text-slate-200">
                        Click to upload payment proof
                      </span>
                      <span className="mt-2 text-xs text-slate-500">
                        Supported formats: JPG, PNG, PDF (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    {paymentProof && (
                      <p className="mt-3 text-sm text-slate-300">
                        Selected file: {paymentProof.name}
                      </p>
                    )}
                  </div>
                )}

                {statusMessage && (
                  <div className="rounded-3xl border border-emerald-700 bg-emerald-950/50 p-4 text-sm text-emerald-300">
                    {statusMessage}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/billing"
                    className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
                  >
                    {showCardFields ? `Pay $${amount}` : `Pay $${amount}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
