"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

export type PaymentMethod =
  | "Chime"
  | "Apple Pay"
  | "Zelle"
  | "PayPal"
  | "Venmo"
  | "Credit Card"
  | "BTC address";

type PaymentMethodDetails = {
  title: string;
  detail: string;
  note: string;
  networkLabel: string;
  showQr: boolean;
  showCopy: boolean;
  instructions: string[];
};

const methodDetails: Record<PaymentMethod, PaymentMethodDetails> = {
  Chime: {
    title: "Chime Tag",
    detail: "$YourChimeTag",
    note: "Send the exact total to this Chime username from your Chime app.",
    networkLabel: "Chime",
    showQr: true,
    showCopy: true,
    instructions: [
      "Open your Chime app.",
      "Send payment to the Chime tag shown below.",
      "Confirm the exact amount and complete the transfer.",
      "Upload your payment receipt or screenshot.",
    ],
  },
  "Apple Pay": {
    title: "Apple Pay Link",
    detail: "applepay://pay?pa=your@applepay.email",
    note: "Use Apple Pay on your device to send the payment to this link.",
    networkLabel: "Apple Pay",
    showQr: false,
    showCopy: true,
    instructions: [
      "Tap or copy the Apple Pay link below.",
      "Open Apple Pay and initiate the payment.",
      "Send the exact total amount.",
      "Upload your payment receipt once complete.",
    ],
  },
  Zelle: {
    title: "Zelle Email",
    detail: "zelle@example.com",
    note: "Send the payment using Zelle to the email address below.",
    networkLabel: "Zelle",
    showQr: false,
    showCopy: true,
    instructions: [
      "Open Zelle or your banking app.",
      "Send payment to the email address shown below.",
      "Confirm the exact total amount.",
      "Upload a screenshot of the completed transfer.",
    ],
  },
  PayPal: {
    title: "PayPal Email",
    detail: "your-paypal@example.com",
    note: "Send the payment using PayPal to this email address.",
    networkLabel: "PayPal",
    showQr: false,
    showCopy: true,
    instructions: [
      "Open PayPal and choose Send Money.",
      "Send payment to the email address shown below.",
      "Use the exact total amount.",
      "Upload your PayPal payment receipt.",
    ],
  },
  Venmo: {
    title: "Venmo Handle",
    detail: "@YourVenmoHandle",
    note: "Send the payment using Venmo to this business handle.",
    networkLabel: "Venmo",
    showQr: false,
    showCopy: true,
    instructions: [
      "Open Venmo and search for the handle below.",
      "Send payment for the exact amount.",
      "Include any note if needed.",
      "Upload your payment proof screenshot.",
    ],
  },
  "Credit Card": {
    title: "Secure Credit Card Checkout",
    detail: "Enter your card details in the secure form below.",
    note: "Your card will be charged securely for the order total.",
    networkLabel: "Credit Card",
    showQr: false,
    showCopy: false,
    instructions: [
      "Enter your credit card information below.",
      "Review the amount and submit the payment.",
      "No external transfer is required.",
      "Upload any proof only if requested.",
    ],
  },
  "BTC address": {
    title: "Bitcoin Address",
    detail: "bc1qexamplebtcaddress0000000000000",
    note: "Send BTC to this wallet address using the Bitcoin network.",
    networkLabel: "BTC address",
    showQr: true,
    showCopy: true,
    instructions: [
      "Open your Bitcoin wallet.",
      "Send BTC to the address shown below.",
      "Confirm the exact amount in USD equivalent.",
      "Upload a screenshot of the blockchain confirmation.",
    ],
  },
};

export default function PaymentForm({
  selectedMethod,
  amount,
}: {
  selectedMethod: PaymentMethod;
  amount: string;
}) {
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalName, setPaypalName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>("");

  const details = methodDetails[selectedMethod];
  const showPayPalFields = selectedMethod === "PayPal";
  const showWalletField = selectedMethod === "BTC address";
  const showCardFields = selectedMethod === "Credit Card";
  const showProofUpload = selectedMethod !== "Credit Card";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPaymentProof(file);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(details.detail);
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
      "Payment details saved. We will verify your payment proof and contact you if any additional information is needed.",
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[2rem] bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Selected Payment Method
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {selectedMethod}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Amount to deposit
                </p>
                <p className="mt-4 text-5xl font-bold text-white">${amount}</p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Payment Details
                </p>
                <div className="mt-5 space-y-4">
                  {details.showQr && (
                    <div className="rounded-3xl bg-slate-900 p-6 text-center shadow-inner shadow-slate-950/20">
                      <div className="mx-auto mb-4 h-[220px] w-[220px] rounded-3xl bg-slate-800 shadow-lg shadow-slate-950/40" />
                      <p className="text-sm text-slate-500">
                        Scan this QR code to load the payment details
                      </p>
                    </div>
                  )}

                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                          {details.title}
                        </p>
                        <p className="mt-2 text-base text-slate-200 break-words">
                          {details.detail}
                        </p>
                        <p className="mt-3 text-sm text-slate-500">
                          {details.note}
                        </p>
                      </div>
                      {details.showCopy && (
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white transition hover:border-slate-500 hover:bg-slate-800"
                        >
                          {copyMessage || "Copy"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Payment method: {details.networkLabel}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Payment Instructions
                </p>
                <ol className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                  {details.instructions.map((instruction, index) => (
                    <li key={instruction}>
                      {index + 1}. {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-6"
              >
                {showCardFields ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="First Last"
                        className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-300">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="123"
                          className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
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

                {showCardFields && (
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
                    Submit Payment
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
