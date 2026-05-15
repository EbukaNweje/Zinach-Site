import PaymentForm, { PaymentMethod } from "./PaymentForm";

interface PaymentPageProps {
  searchParams: Promise<{
    method?: string;
    amount?: string;
    name?: string;
    email?: string;
    phone?: string;
  }>;
}

const normalizeMethod = (value: string | undefined): PaymentMethod => {
  if (!value) return "Chime";
  const normalized = value.trim().toLowerCase();
  const methodMap: Record<string, PaymentMethod> = {
    chime: "Chime",
    "apple pay": "Apple Pay",
    zelle: "Zelle",
    paypal: "PayPal",
    venmo: "Venmo",
    "credit card": "Credit Card",
    creditcard: "Credit Card",
    "btc address": "BTC",
    btc: "BTC",
    btcaddress: "BTC",
  };
  return (
    methodMap[normalized] ??
    (Object.values(methodMap).includes(value as PaymentMethod)
      ? (value as PaymentMethod)
      : "Chime")
  );
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const selectedMethod = normalizeMethod(params.method);
  const amount = params.amount ?? "0.00";
  const customerName = params.name ?? "";
  const customerEmail = params.email ?? "";
  const customerPhone = params.phone ?? "";

  return (
    <PaymentForm
      selectedMethod={selectedMethod}
      amount={amount}
      customerName={customerName}
      customerEmail={customerEmail}
      customerPhone={customerPhone}
    />
  );
}
