import Link from "next/link";

interface PaymentPageProps {
  searchParams: {
    method?: string;
  };
}

type PaymentMethod =
  | "Chime"
  | "Apple Pay"
  | "Zelle"
  | "PayPal"
  | "Venmo"
  | "Credit Card"
  | "BTC address";

export default function PaymentPage({ searchParams }: PaymentPageProps) {
  const method = (searchParams.method || "Chime") as PaymentMethod;
  const paymentInstructions: Record<PaymentMethod, string> = {
    Chime: "Use your Chime app to send payment to our Chime account.",
    "Apple Pay": "Use Apple Pay to complete the payment through your device.",
    Zelle: "Use Zelle and send payment to our registered Zelle email.",
    PayPal: "Use PayPal to transfer payment to our PayPal account.",
    Venmo: "Use Venmo to send payment to our Venmo handle.",
    "Credit Card": "Use your card details to complete the secure checkout.",
    "BTC address":
      "Send BTC to the address shown below using your crypto wallet.",
  };
  const instructions = paymentInstructions[method] || paymentInstructions.Chime;
  const btcAddress = "bc1qexamplebtcaddress0000000000000";
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-[2rem] bg-white p-10 shadow-xl">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Payment Info
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-900">
              Complete your payment
            </h1>
            <p className="mt-3 text-slate-600">
              Use the details below to finish your transaction. We only process
              orders once payment has been confirmed.
            </p>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Selected Payment Method
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {method}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Instructions
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                {instructions}
                Once payment is completed, return to the site for order
                confirmation.
              </p>
              <div className="mt-6 space-y-3 rounded-3xl bg-white p-5 text-slate-700 shadow-sm">
                <p>
                  <span className="font-semibold">Method:</span> {method}
                </p>
                <p>
                  <span className="font-semibold">Amount:</span> $XX.XX
                </p>
                {method === "BTC address" ? (
                  <p>
                    <span className="font-semibold">BTC Address:</span>{" "}
                    {btcAddress}
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold">Reference:</span> Your order
                    email or phone number
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Order Processing Reminder
              </h2>
              <p className="mt-4 leading-7 text-slate-700">
                Full payment must be successfully completed and confirmed before
                your order can be processed, prepared, and dispatched. No
                shipment will start until funds are received and cleared.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/billing"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Back to Billing
              </Link>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open {method}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
