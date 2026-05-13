import PaymentForm, { PaymentMethod } from "./PaymentForm";

interface PaymentPageProps {
  searchParams: {
    method?: string;
    amount?: string;
  };
}

const normalizeMethod = (value: string | null): PaymentMethod => {
  if (!value) {
    return "Chime";
  }

  const normalized = value.trim().toLowerCase();
  const methodMap: Record<string, PaymentMethod> = {
    chime: "Chime",
    "apple pay": "Apple Pay",
    zelle: "Zelle",
    paypal: "PayPal",
    venmo: "Venmo",
    "credit card": "Credit Card",
    "creditcard": "Credit Card",
    "btc address": "BTC address",
    btc: "BTC address",
    btcaddress: "BTC address",
  };

  return methodMap[normalized] ??
    (Object.values(methodMap).includes(value as PaymentMethod)
      ? (value as PaymentMethod)
      : "Chime");
};

export default function PaymentPage({ searchParams }: PaymentPageProps) {
  const selectedMethod = normalizeMethod(searchParams.method ?? "Chime");
  const amount = searchParams.amount ?? "XX.XX";
  return <PaymentForm selectedMethod={selectedMethod} amount={amount} />;
}
