"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

export type PaymentMethod =
  | "Chime"
  | "Apple Pay"
  | "Zelle"
  | "PayPal"
  | "Venmo"
  | "Interac"
  | "Credit Card"
  | "BTC";

type Address = {
  streetAddress: string;
  streetAddress2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
};

// Static instructions per method
const methodInstructions: Record<string, string[]> = {
  Chime: [
    "Open your Chime app.",
    "Copy the tag and name shown below.",
    "Send the exact total amount.",
    "Save the screenshot for your records.",
  ],
  "Apple Pay": [
    "Open Apple Pay on your device.",
    "Copy the payment link below.",
    "Send the exact total amount.",
    "Save the confirmation screenshot.",
  ],
  Zelle: [
    "Open your bank or Zelle app.",
    "Send payment to the details shown below.",
    "Confirm the exact amount before sending.",
    "Keep the screenshot as proof.",
  ],
  PayPal: [
    "Open PayPal and choose Send Money.",
    "Use the details shown below.",
    "Select Friends and Family.",
    "Send the exact total amount.",
  ],
  Venmo: [
    "Open Venmo and search for the handle below.",
    "Send payment for the exact amount.",
    "Include the last digit code in your notes.",
    "Save a screenshot of the transfer.",
  ],
  Interac: [
    "Open your Interac e-Transfer app or mobile banking.",
    "Enter the email and name shown below.",
    "Send the exact total amount.",
    "Save the transfer confirmation as proof.",
  ],
  "Credit Card": [
    "Enter your card number, expiration, and CVV.",
    "Review the order total.",
    "Submit the payment.",
    "Keep the receipt confirmation.",
  ],
  BTC: [
    "Open your Bitcoin wallet.",
    "Send BTC to the address shown below.",
    "Confirm the amount matches the USD total.",
    "Save the blockchain confirmation.",
  ],
  "BTC address": [
    "Open your Bitcoin wallet.",
    "Send BTC to the address shown below.",
    "Confirm the amount matches the USD total.",
    "Save the blockchain confirmation.",
  ],
};

// ── Order success modal ───────────────────────────────────────────────────────
function OrderSuccessModal({
  orderNumber,
  amount,
  method,
  onClose,
}: {
  orderNumber: string;
  amount: string;
  method: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 px-8 py-7 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-3xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-white">Order Placed!</h2>
          <p className="mt-1 text-sm text-emerald-100">
            Your order has been received
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          {/* Amount block */}
          <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800 p-5 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-1">
              Amount to pay
            </p>
            <p className="text-4xl font-extrabold text-white">${amount}</p>
            <p className="mt-1 text-sm text-emerald-300">via {method}</p>
          </div>

          {/* Order number */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4">
            <span className="text-sm text-slate-400">Order number</span>
            <span className="text-sm font-bold text-white">{orderNumber}</span>
          </div>

          <p className="text-sm text-slate-400 text-center leading-6">
            A confirmation email has been sent to your inbox. Please complete
            your payment using the {method} details shown on this page.
          </p>

          <button
            onClick={onClose}
            className="w-full rounded-full bg-white py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PaymentForm({
  selectedMethod,
  amount,
  customerName: initialName,
  customerEmail: initialEmail,
  customerPhone: initialPhone,
  billingAddress,
  shippingAddress,
  shippingMethod,
  sameShipping,
}: {
  selectedMethod: PaymentMethod;
  amount: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  shippingMethod?: string;
  sameShipping?: boolean;
}) {
  const { cartItems, clearCart } = useCart();
  const method = selectedMethod;
  const showCardFields = method === "Credit Card";
  const showProofUpload = method !== "Credit Card";
  const instructions =
    methodInstructions[method] ?? methodInstructions["Chime"];

  // Fetch live payment info from admin-configured API
  const [liveFields, setLiveFields] = useState<
    { label: string; value: string }[]
  >([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);

  useEffect(() => {
    const methodKey = method === "BTC" ? "BTC address" : method;
    fetch(`/api/payments`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const match = data.data.find(
            (p: { method: string }) => p.method === methodKey,
          );
          if (match?.fields) {
            const entries = Object.entries(
              match.fields as Record<string, string>,
            ).map(([label, value]) => ({ label, value }));
            setLiveFields(entries);
          }
        }
      })
      .catch(() => {})
      .finally(() => setFieldsLoading(false));
  }, [method]);

  // Form state
  const [customerName, setCustomerName] = useState(initialName ?? "");
  const [customerEmail, setCustomerEmail] = useState(initialEmail ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialPhone ?? "");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");
  const [modalAmount, setModalAmount] = useState("");
  const [initialBillingAddress] = useState<Address>(
    billingAddress ?? {
      streetAddress: "",
      streetAddress2: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "",
    },
  );
  const [initialShippingAddress] = useState<Address>(
    shippingAddress ?? {
      streetAddress: "",
      streetAddress2: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "",
    },
  );
  const router = useRouter();

  const [billingStreetAddress, setBillingStreetAddress] = useState(
    initialBillingAddress.streetAddress,
  );
  const [billingStreetAddress2, setBillingStreetAddress2] = useState(
    initialBillingAddress.streetAddress2,
  );
  const [billingCity, setBillingCity] = useState(initialBillingAddress.city);
  const [billingStateProvince, setBillingStateProvince] = useState(
    initialBillingAddress.stateProvince,
  );
  const [billingPostalCode, setBillingPostalCode] = useState(
    initialBillingAddress.postalCode,
  );
  const [billingCountry, setBillingCountry] = useState(
    initialBillingAddress.country,
  );
  const [shippingStreetAddress, setShippingStreetAddress] = useState(
    initialShippingAddress.streetAddress,
  );
  const [shippingStreetAddress2, setShippingStreetAddress2] = useState(
    initialShippingAddress.streetAddress2,
  );
  const [shippingCity, setShippingCity] = useState(initialShippingAddress.city);
  const [shippingStateProvince, setShippingStateProvince] = useState(
    initialShippingAddress.stateProvince,
  );
  const [shippingPostalCode, setShippingPostalCode] = useState(
    initialShippingAddress.postalCode,
  );
  const [shippingCountry, setShippingCountry] = useState(
    initialShippingAddress.country,
  );

  const handleCopy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates((prev) => ({ ...prev, [label]: true }));
      setTimeout(
        () => setCopyStates((prev) => ({ ...prev, [label]: false })),
        2000,
      );
    } catch {
      /* silently fail */
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerName || !customerEmail) {
      setErrorMessage("Please enter your name and email.");
      return;
    }
    setSubmitStatus("submitting");
    setErrorMessage(null);

    if (
      showCardFields &&
      (!cardName || !cardNumber || !cardExpMonth || !cardExpYear || !cardCvc)
    ) {
      setErrorMessage("Please enter all card details before continuing.");
      setSubmitStatus("idle");
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        "customer",
        JSON.stringify({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: shippingStreetAddress,
        }),
      );
      formData.append("billingStreetAddress", billingStreetAddress);
      formData.append("billingStreetAddress2", billingStreetAddress2);
      formData.append("billingCity", billingCity);
      formData.append("billingStateProvince", billingStateProvince);
      formData.append("billingPostalCode", billingPostalCode);
      formData.append("billingCountry", billingCountry);
      formData.append("shippingStreetAddress", shippingStreetAddress);
      formData.append("shippingStreetAddress2", shippingStreetAddress2);
      formData.append("shippingCity", shippingCity);
      formData.append("shippingStateProvince", shippingStateProvince);
      formData.append("shippingPostalCode", shippingPostalCode);
      formData.append("shippingCountry", shippingCountry);
      formData.append("shippingMethod", shippingMethod ?? "");
      formData.append("sameShipping", String(sameShipping));

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

      if (showCardFields) {
        formData.append("cardName", cardName);
        formData.append("cardNumber", cardNumber);
        formData.append("cardExpMonth", cardExpMonth);
        formData.append("cardExpYear", cardExpYear);
        formData.append("cardCvc", cardCvc);
      }

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
      setPlacedOrderNumber(data.data?.orderNumber ?? "");
      setModalAmount(amount);
      setSubmitStatus("success");
      setShowModal(true);
    } catch (err: unknown) {
      setSubmitStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/");
  };

  return (
    <>
      {/* Success modal */}
      {showModal && (
        <OrderSuccessModal
          orderNumber={placedOrderNumber}
          amount={modalAmount}
          method={method}
          onClose={() => handleCloseModal()}
        />
      )}

      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-3xl bg-slate-900 p-8 shadow-2xl">
            <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
              {/* ── Left column ── */}
              <div className="space-y-6">
                {/* Selected method badge */}
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
                  <p className="mt-4 text-5xl font-bold text-white">
                    ${amount}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">via {method}</p>
                </div>

                {/* Instructions */}
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-4">
                    Payment instructions
                  </p>
                  <ol className="space-y-3 text-sm leading-7 text-slate-300 list-decimal list-inside">
                    {instructions.map((step) => (
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

                {/* Payment fields from API or card fields */}
                {showCardFields ? (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
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
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
                      {method} details — copy &amp; send payment
                    </p>
                    {fieldsLoading ? (
                      <p className="text-sm text-slate-500 py-4 text-center">
                        Loading payment details…
                      </p>
                    ) : liveFields.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center">
                        Payment details not configured yet. Contact support.
                      </p>
                    ) : (
                      liveFields.map((field) => (
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
                      ))
                    )}
                  </div>
                )}

                {/* Proof upload */}
                {showProofUpload && (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">
                      Upload payment proof
                    </p>
                    <label className="flex min-h-[130px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-4 py-5 text-center transition hover:border-slate-500">
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

                {/* Error message */}
                {errorMessage && (
                  <div className="rounded-2xl border border-red-700 bg-red-950/50 p-4 text-sm text-red-300">
                    {errorMessage}
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
                      submitStatus === "submitting" ||
                      submitStatus === "success"
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
    </>
  );
}
