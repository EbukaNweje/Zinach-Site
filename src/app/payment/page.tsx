import PaymentForm, { PaymentMethod } from "./PaymentForm";

interface PaymentPageProps {
  searchParams: Promise<{
    method?: string;
    amount?: string;
    name?: string;
    email?: string;
    phone?: string;
    billingStreetAddress?: string;
    billingStreetAddress2?: string;
    billingCity?: string;
    billingStateProvince?: string;
    billingPostalCode?: string;
    billingCountry?: string;
    shippingStreetAddress?: string;
    shippingStreetAddress2?: string;
    shippingCity?: string;
    shippingStateProvince?: string;
    shippingPostalCode?: string;
    shippingCountry?: string;
    shippingMethod?: string;
    sameShipping?: string;
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
    interac: "Interac",
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
  const billingAddress = {
    streetAddress: params.billingStreetAddress ?? "",
    streetAddress2: params.billingStreetAddress2 ?? "",
    city: params.billingCity ?? "",
    stateProvince: params.billingStateProvince ?? "",
    postalCode: params.billingPostalCode ?? "",
    country: params.billingCountry ?? "",
  };
  const shippingAddress = {
    streetAddress: params.shippingStreetAddress ?? "",
    streetAddress2: params.shippingStreetAddress2 ?? "",
    city: params.shippingCity ?? "",
    stateProvince: params.shippingStateProvince ?? "",
    postalCode: params.shippingPostalCode ?? "",
    country: params.shippingCountry ?? "",
  };

  return (
    <PaymentForm
      selectedMethod={selectedMethod}
      amount={amount}
      customerName={customerName}
      customerEmail={customerEmail}
      customerPhone={customerPhone}
      billingAddress={billingAddress}
      shippingAddress={shippingAddress}
      shippingMethod={params.shippingMethod ?? ""}
      sameShipping={params.sameShipping === "true"}
    />
  );
}
