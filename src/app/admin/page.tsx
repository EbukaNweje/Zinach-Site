"use client";

import Link from "next/link";
import { useState, ChangeEvent, useEffect, useCallback } from "react";
import Script from "next/script";

const ADMIN_PASSWORD = "Zinach2026";

type LiveOrder = {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string };
  total: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
};

const paymentMethodFields = {
  Chime: [
    { id: "tag", label: "Tag", placeholder: "@DrWilliamChime" },
    { id: "name", label: "Name", placeholder: "Dr William Makis" },
  ],
  "Apple Pay": [
    {
      id: "link",
      label: "Link",
      placeholder: "applepay://pay?pa=drwmakis@applepay.com",
    },
    { id: "name", label: "Name", placeholder: "Dr William Makis" },
  ],
  Zelle: [
    { id: "email", label: "Email", placeholder: "drwmakis@zelle.com" },
    { id: "name", label: "Name", placeholder: "Dr William Makis" },
  ],
  PayPal: [
    { id: "email", label: "Email", placeholder: "drwmakis-paypal@example.com" },
    { id: "name", label: "Name", placeholder: "Dr William Makis" },
  ],
  Venmo: [
    { id: "tag", label: "Tag", placeholder: "@DrWilliamVenmo" },
    { id: "name", label: "Name", placeholder: "Dr William Makis" },
    { id: "code", label: "Last digit code", placeholder: "1234" },
  ],
  "BTC address": [
    { id: "btc", label: "BTC", placeholder: "bc1qdrwmakisbtc0000000000000000" },
  ],
};

type PaymentMethod = keyof typeof paymentMethodFields;

type SavedPaymentInfo = Record<PaymentMethod, Record<string, string>>;

type PackageOption = {
  label: string;
  price: string;
};

type Product = {
  name: string;
  brand: string;
  price: string;
  description: string;
  image: string;
  packageOptions: PackageOption[];
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // ── Live orders & metrics ──────────────────────────────────────────────────
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) setLiveOrders(data.data);
    } catch {
      // silently fail
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated, fetchOrders]);

  const metrics = [
    { label: "Total orders", value: String(liveOrders.length) },
    {
      label: "Revenue",
      value: `$${liveOrders
        .filter((o) => o.paymentStatus === "paid")
        .reduce(
          (sum, o) => sum + Number(o.total.replace(/[^0-9.]/g, "") || 0),
          0,
        )
        .toFixed(2)}`,
    },
    {
      label: "Pending payments",
      value: String(
        liveOrders.filter((o) => o.paymentStatus === "pending").length,
      ),
    },
    {
      label: "Processing",
      value: String(
        liveOrders.filter((o) => o.paymentStatus === "processing").length,
      ),
    },
  ];

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "paid" }),
      });
      if (res.ok) fetchOrders();
    } catch {
      // silently fail
    }
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Incorrect password. Please try again.");
      setLoginPassword("");
    }
  };

  const [product, setProduct] = useState<Product>({
    name: "",
    brand: "",
    price: "",
    description: "",
    image: "",
    packageOptions: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [productMessage, setProductMessage] = useState("");
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [newPackageLabel, setNewPackageLabel] = useState("");
  const [newPackagePrice, setNewPackagePrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Chime");
  const [paymentFields, setPaymentFields] = useState<Record<string, string>>({
    tag: "@DrWilliamChime",
    name: "Dr William Makis",
  });

  const handleAddPackageOption = () => {
    if (!newPackageLabel.trim() || !newPackagePrice.trim()) return;
    setProduct((current) => ({
      ...current,
      packageOptions: [
        ...current.packageOptions,
        { label: newPackageLabel.trim(), price: newPackagePrice.trim() },
      ],
    }));
    setNewPackageLabel("");
    setNewPackagePrice("");
  };

  const handleRemovePackageOption = (idx: number) => {
    setProduct((current) => ({
      ...current,
      packageOptions: current.packageOptions.filter((_, i) => i !== idx),
    }));
  };
  const [savedPaymentInfo, setSavedPaymentInfo] = useState<SavedPaymentInfo>({
    Chime: { tag: "@DrWilliamChime", name: "Dr William Makis" },
    "Apple Pay": {
      link: "applepay://pay?pa=drwmakis@applepay.com",
      name: "Dr William Makis",
    },
    Zelle: { email: "drwmakis@zelle.com", name: "Dr William Makis" },
    PayPal: { email: "drwmakis-paypal@example.com", name: "Dr William Makis" },
    Venmo: { tag: "@DrWilliamVenmo", name: "Dr William Makis", code: "1234" },
    "BTC address": { btc: "bc1qdrwmakisbtc0000000000000000" },
  });
  const [paymentMessage, setPaymentMessage] = useState("");

  const handleProductChange = (key: keyof Product, value: string) => {
    setProduct((current) => ({ ...current, [key]: value }));
  };

  // Handle file input for image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct((current) => ({
          ...current,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setProductSubmitting(true);
    setProductMessage("");

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("brand", product.brand);
      formData.append("price", product.price);
      formData.append("description", product.description);
      formData.append("packageOptions", JSON.stringify(product.packageOptions));
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product.");

      setProducts((current) => [...current, data.data]);
      setProduct({
        name: "",
        brand: "",
        price: "",
        description: "",
        image: "",
        packageOptions: [],
      });
      setImageFile(null);
      setNewPackageLabel("");
      setNewPackagePrice("");
      setProductMessage("Product added successfully.");
    } catch (err: unknown) {
      setProductMessage(
        err instanceof Error ? err.message : "Error adding product.",
      );
    } finally {
      setProductSubmitting(false);
      window.setTimeout(() => setProductMessage(""), 4000);
    }
  };

  const handlePaymentFieldChange = (field: string, value: string) => {
    setPaymentFields((current) => ({ ...current, [field]: value }));
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setPaymentFields(savedPaymentInfo[method] || {});
    setPaymentMessage("");
  };

  const handlePaymentSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      const res = await fetch(
        `/api/payments/${encodeURIComponent(paymentMethod)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: paymentFields }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save.");

      setSavedPaymentInfo((current) => ({
        ...current,
        [paymentMethod]: { ...paymentFields },
      }));
      setPaymentMessage(`${paymentMethod} payment info updated.`);
    } catch (err: unknown) {
      setPaymentMessage(
        err instanceof Error ? err.message : "Error saving payment info.",
      );
    } finally {
      window.setTimeout(() => setPaymentMessage(""), 4000);
    }
  };

  const fieldDefinitions = paymentMethodFields[paymentMethod];

  return (
    <>
      <Script
        src="//code.jivosite.com/widget/DAE4ZBUumk"
        strategy="afterInteractive"
        async
      />

      {/* Login gate */}
      {!isAuthenticated ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-4xl border border-slate-200 bg-white p-10 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xl">
                WM
              </div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                Admin access
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Sign in
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-600">
                  Password
                </span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </label>

              {loginError && (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                    Admin dashboard
                  </p>
                  <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                    Product and payment control center
                  </h1>
                  <p className="mt-4 max-w-2xl text-slate-600">
                    Upload new products and update your payment payout details
                    from here.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Sign out
                  </button>
                  <Link
                    href="/admin"
                    className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Refresh page
                  </Link>
                  <Link
                    href="/billing"
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Open billing
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-7"
                  >
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                      {metric.label}
                    </p>
                    <p className="mt-4 text-3xl font-semibold text-slate-900">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Product upload
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                    Add a new product
                  </h2>
                </div>

                <form onSubmit={handleProductSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-600">
                        Product name
                      </span>
                      <input
                        value={product.name}
                        onChange={(e) =>
                          handleProductChange("name", e.target.value)
                        }
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        placeholder="Ivermectin 9mg"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-600">
                        Brand
                      </span>
                      <input
                        value={product.brand}
                        onChange={(e) =>
                          handleProductChange("brand", e.target.value)
                        }
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        placeholder="Edenbridge"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-600">
                        Price
                      </span>
                      <input
                        value={product.price}
                        onChange={(e) =>
                          handleProductChange("price", e.target.value)
                        }
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        placeholder="$80.00"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-600">
                        Product image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                    </label>
                  </div>

                  {/* Per-product package options UI */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 mb-4">
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      Package options for this product
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 mb-4">
                      <input
                        value={newPackageLabel}
                        onChange={(e) => setNewPackageLabel(e.target.value)}
                        placeholder="e.g. 20 capsules"
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                      <input
                        value={newPackagePrice}
                        onChange={(e) => setNewPackagePrice(e.target.value)}
                        placeholder="$80.00"
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPackageOption}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 mb-4"
                    >
                      Add package option
                    </button>
                    {product.packageOptions.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {product.packageOptions.map((opt, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <span className="text-slate-700">
                              {opt.label} — {opt.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePackageOption(idx)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-600">
                      Description
                    </span>
                    <textarea
                      value={product.description}
                      onChange={(e) =>
                        handleProductChange("description", e.target.value)
                      }
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      rows={4}
                      placeholder="Short product description"
                    />
                    {product.image && (
                      <div className="mt-4">
                        <span className="text-xs text-slate-500 block mb-1">
                          Image preview:
                        </span>
                        <img
                          src={product.image}
                          alt="Product preview"
                          className="max-h-32 rounded-xl border border-slate-200 bg-white"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </label>

                  {productMessage && (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {productMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={productSubmitting}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {productSubmitting ? "Adding…" : "Add product"}
                  </button>
                </form>

                {products.length > 0 && (
                  <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                      Added products
                    </p>
                    <div className="mt-4 space-y-4">
                      {products.map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="rounded-3xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {item.brand}
                              </p>
                              {item.packageOptions &&
                                item.packageOptions.length > 0 && (
                                  <ul className="mt-1 text-xs text-slate-600">
                                    {item.packageOptions.map((opt, idx) => (
                                      <li key={idx}>
                                        {opt.label} — {opt.price}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.price}
                            </p>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">
                            {item.description}
                          </p>
                          {item.image && (
                            <p className="mt-2 text-xs text-slate-500">
                              Image URL: {item.image}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Payment info
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                    Update payout details
                  </h2>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-600">
                      Payment method
                    </span>
                    <select
                      value={paymentMethod}
                      onChange={(event) =>
                        handlePaymentMethodChange(
                          event.target.value as PaymentMethod,
                        )
                      }
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      {Object.keys(paymentMethodFields).map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </label>

                  {fieldDefinitions.map((field) => (
                    <label key={field.id} className="block">
                      <span className="text-sm font-medium text-slate-600">
                        {field.label}
                      </span>
                      <input
                        value={paymentFields[field.id] || ""}
                        onChange={(e) =>
                          handlePaymentFieldChange(field.id, e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                    </label>
                  ))}

                  {paymentMessage && (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {paymentMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Save payment info
                  </button>
                </form>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                    Current saved payment info
                  </p>
                  <div className="mt-4 space-y-4">
                    {Object.entries(savedPaymentInfo).map(([method, info]) => (
                      <div
                        key={method}
                        className="rounded-3xl border border-slate-200 bg-white p-4"
                      >
                        <p className="font-semibold text-slate-900">{method}</p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-600">
                          {Object.entries(info).map(([key, value]) => (
                            <div key={key} className="flex flex-wrap gap-2">
                              <span className="font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {key}:
                              </span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                      Recent orders
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                      Latest activity
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                    Live
                  </span>
                  <button
                    onClick={fetchOrders}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    Loading orders…
                  </p>
                ) : liveOrders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                    <p className="text-sm text-slate-500">No orders yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Order</th>
                          <th className="px-6 py-4 font-semibold">Customer</th>
                          <th className="px-6 py-4 font-semibold">Amount</th>
                          <th className="px-6 py-4 font-semibold">Method</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {liveOrders.map((order) => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              {order.orderNumber}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-slate-900">
                                {order.customer.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {order.customer.email}
                              </p>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              ${order.total}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {order.paymentMethod}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  order.paymentStatus === "paid"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : order.paymentStatus === "processing"
                                      ? "bg-amber-100 text-amber-700"
                                      : order.paymentStatus === "failed"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {order.paymentStatus !== "paid" && (
                                <button
                                  onClick={() => handleMarkPaid(order._id)}
                                  className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  Mark paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
