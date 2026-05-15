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

const PAYMENT_METHODS = [
  "Chime",
  "Apple Pay",
  "Zelle",
  "PayPal",
  "Venmo",
  "BTC ",
] as const;
type PaymentMethodName = (typeof PAYMENT_METHODS)[number];

type PaymentField = { label: string; value: string };
// Each method has a list of label/value pairs the admin configures
type PaymentInfoMap = Record<PaymentMethodName, PaymentField[]>;

type PackageOption = { label: string; price: string };

type LiveProduct = {
  _id: string;
  name: string;
  // brand: string;
  price: string;
  description: string;
  image: string;
  packageOptions: PackageOption[];
  slug: string;
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

  // (auth effect handled below with fetchLiveProducts)

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

  // ── Live products ──────────────────────────────────────────────────────────
  const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LiveProduct | null>(
    null,
  );
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchLiveProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) setLiveProducts(data.data);
    } catch {
      // silently fail
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchLiveProducts();
      fetchPaymentInfo();
    }
  }, [isAuthenticated]);

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLiveProducts((prev) => prev.filter((p) => p._id !== id));
        setDeleteConfirmId(null);
      }
    } catch {
      // silently fail
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSubmitting(true);
    setEditMessage("");

    try {
      const formData = new FormData();
      formData.append("name", editingProduct.name);
      // formData.append("brand", editingProduct.brand);
      formData.append(
        "price",
        editingProduct.price.startsWith("$")
          ? editingProduct.price
          : `$${editingProduct.price}`,
      );
      formData.append("description", editingProduct.description);
      formData.append(
        "packageOptions",
        JSON.stringify(editingProduct.packageOptions),
      );
      if (editImageFile) formData.append("image", editImageFile);

      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update.");

      setLiveProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? data.data : p)),
      );
      setEditMessage("Product updated successfully.");
      setEditImageFile(null);
      window.setTimeout(() => {
        setEditMessage("");
        setEditingProduct(null);
      }, 1500);
    } catch (err: unknown) {
      setEditMessage(
        err instanceof Error ? err.message : "Error updating product.",
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const [product, setProduct] = useState<Omit<LiveProduct, "_id" | "slug">>({
    name: "",
    price: "",
    description: "",
    image: "",
    packageOptions: [],
  });
  const [productMessage, setProductMessage] = useState("");
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [newPackageLabel, setNewPackageLabel] = useState("");
  const [newPackagePrice, setNewPackagePrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodName>("Chime");
  // paymentInfoMap holds the live fields per method loaded from the API
  const [paymentInfoMap, setPaymentInfoMap] = useState<PaymentInfoMap>(() => {
    const empty = {} as PaymentInfoMap;
    PAYMENT_METHODS.forEach((m) => {
      empty[m] = [];
    });
    return empty;
  });
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  // New field being added
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  // Load existing payment info from API on auth
  const fetchPaymentInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success) {
        const map = { ...paymentInfoMap };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.data.forEach((item: any) => {
          if (PAYMENT_METHODS.includes(item.method)) {
            const fields = Object.entries(
              item.fields as Record<string, string>,
            ).map(([label, value]) => ({ label, value }));
            map[item.method as PaymentMethodName] = fields;
          }
        });
        setPaymentInfoMap(map);
      }
    } catch {
      /* silently fail */
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddPackageOption = () => {
    if (!newPackageLabel.trim() || !newPackagePrice.trim()) return;
    const price = newPackagePrice.trim();
    setProduct((current) => ({
      ...current,
      packageOptions: [
        ...current.packageOptions,
        {
          label: newPackageLabel.trim(),
          price: price.startsWith("$") ? price : `$${price}`,
        },
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

  const handleProductChange = (
    key: keyof Omit<LiveProduct, "_id" | "slug">,
    value: string,
  ) => {
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
      // formData.append("brand", product.brand);
      formData.append(
        "price",
        product.price.startsWith("$") ? product.price : `$${product.price}`,
      );
      formData.append("description", product.description);
      formData.append("packageOptions", JSON.stringify(product.packageOptions));
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add product.");

      await fetchLiveProducts();
      setProduct({
        name: "",
        // brand: "",
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

  const handlePaymentFieldChange = (
    index: number,
    key: "label" | "value",
    val: string,
  ) => {
    setPaymentInfoMap((prev) => {
      const fields = [...prev[paymentMethod]];
      fields[index] = { ...fields[index], [key]: val };
      return { ...prev, [paymentMethod]: fields };
    });
  };

  const handleAddPaymentField = () => {
    if (!newFieldLabel.trim()) return;
    setPaymentInfoMap((prev) => ({
      ...prev,
      [paymentMethod]: [
        ...prev[paymentMethod],
        { label: newFieldLabel.trim(), value: newFieldValue.trim() },
      ],
    }));
    setNewFieldLabel("");
    setNewFieldValue("");
  };

  const handleRemovePaymentField = (index: number) => {
    setPaymentInfoMap((prev) => ({
      ...prev,
      [paymentMethod]: prev[paymentMethod].filter((_, i) => i !== index),
    }));
  };

  const handlePaymentSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setPaymentSubmitting(true);
    setPaymentMessage("");
    try {
      const fields: Record<string, string> = {};
      paymentInfoMap[paymentMethod].forEach((f) => {
        if (f.label.trim()) fields[f.label.trim()] = f.value;
      });
      const res = await fetch(
        `/api/payments/${encodeURIComponent(paymentMethod)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save.");
      setPaymentMessage(`${paymentMethod} payment info saved.`);
    } catch (err: unknown) {
      setPaymentMessage(err instanceof Error ? err.message : "Error saving.");
    } finally {
      setPaymentSubmitting(false);
      window.setTimeout(() => setPaymentMessage(""), 4000);
    }
  };

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
                        Price
                      </span>
                      <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                          $
                        </span>
                        <input
                          value={product.price.replace(/^\$/, "")}
                          onChange={(e) =>
                            handleProductChange(
                              "price",
                              e.target.value.replace(/^\$/, ""),
                            )
                          }
                          className="w-full rounded-3xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                          placeholder="80.00"
                        />
                      </div>
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
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                          $
                        </span>
                        <input
                          value={newPackagePrice.replace(/^\$/, "")}
                          onChange={(e) =>
                            setNewPackagePrice(
                              e.target.value.replace(/^\$/, ""),
                            )
                          }
                          placeholder="80.00"
                          className="w-full rounded-3xl border border-slate-200 bg-white pl-8 pr-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        />
                      </div>
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
              </section>

              {/* ── Manage Products ── */}
              <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl xl:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                      Product management
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                      All products
                    </h2>
                  </div>
                  <button
                    onClick={fetchLiveProducts}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                </div>

                {productsLoading ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    Loading products…
                  </p>
                ) : liveProducts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                    <p className="text-sm text-slate-500">
                      No products yet. Add one above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveProducts.map((p) => (
                      <div
                        key={p._id}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                      >
                        {editingProduct?._id === p._id ? (
                          /* ── Inline edit form ── */
                          <form
                            onSubmit={handleEditSubmit}
                            className="space-y-4"
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="block">
                                <span className="text-xs font-medium text-slate-500">
                                  Name
                                </span>
                                <input
                                  value={editingProduct.name}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      name: e.target.value,
                                    })
                                  }
                                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                                />
                              </label>
                              <label className="block">
                                <span className="text-xs font-medium text-slate-500">
                                  Price
                                </span>
                                <div className="relative mt-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                                    $
                                  </span>
                                  <input
                                    value={editingProduct.price.replace(
                                      /^\$/,
                                      "",
                                    )}
                                    onChange={(e) =>
                                      setEditingProduct({
                                        ...editingProduct,
                                        price: e.target.value.replace(
                                          /^\$/,
                                          "",
                                        ),
                                      })
                                    }
                                    className="w-full rounded-2xl border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                                  />
                                </div>
                              </label>
                              <label className="block">
                                <span className="text-xs font-medium text-slate-500">
                                  Replace image (optional)
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    setEditImageFile(
                                      e.target.files?.[0] ?? null,
                                    )
                                  }
                                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                                />
                              </label>
                              <label className="block sm:col-span-2">
                                <span className="text-xs font-medium text-slate-500">
                                  Description
                                </span>
                                <textarea
                                  value={editingProduct.description}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      description: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                                />
                              </label>
                            </div>

                            {editMessage && (
                              <div
                                className={`rounded-2xl px-4 py-2 text-sm ${
                                  editMessage.includes("success")
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {editMessage}
                              </div>
                            )}

                            <div className="flex gap-3">
                              <button
                                type="submit"
                                disabled={editSubmitting}
                                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                              >
                                {editSubmitting ? "Saving…" : "Save changes"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(null);
                                  setEditMessage("");
                                  setEditImageFile(null);
                                }}
                                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* ── Product row ── */
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="h-14 w-14 rounded-2xl border border-slate-200 bg-white object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="h-14 w-14 rounded-2xl bg-slate-200 flex-shrink-0" />
                              )}
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {p.name}
                                </p>
                                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                                  {p.price}
                                </p>
                                {p.packageOptions?.length > 0 && (
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {p.packageOptions.length} package option
                                    {p.packageOptions.length > 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setEditMessage("");
                                  setEditImageFile(null);
                                }}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                              >
                                Edit
                              </button>

                              {deleteConfirmId === p._id ? (
                                <>
                                  <span className="text-xs text-red-600 font-medium">
                                    Sure?
                                  </span>
                                  <button
                                    onClick={() => handleDeleteProduct(p._id)}
                                    className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                  >
                                    Yes, delete
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(p._id)}
                                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
                  <p className="mt-2 text-sm text-slate-500">
                    Add the label and value for each field customers will see on
                    the payment page.
                  </p>
                </div>

                {/* Method tabs */}
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m);
                        setPaymentMessage("");
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        paymentMethod === m
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Existing fields */}
                  {paymentInfoMap[paymentMethod].length === 0 ? (
                    <p className="text-sm text-slate-400 italic">
                      No fields yet. Add one below.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {paymentInfoMap[paymentMethod].map((field, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            value={field.label}
                            onChange={(e) =>
                              handlePaymentFieldChange(
                                idx,
                                "label",
                                e.target.value,
                              )
                            }
                            placeholder="Label (e.g. Tag)"
                            className="w-1/3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                          />
                          <input
                            value={field.value}
                            onChange={(e) =>
                              handlePaymentFieldChange(
                                idx,
                                "value",
                                e.target.value,
                              )
                            }
                            placeholder="Value (e.g. @DrWilliam)"
                            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePaymentField(idx)}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new field row */}
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <input
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="New label (e.g. Email)"
                      className="w-1/3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                    <input
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      placeholder="Value"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddPaymentField}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      + Add
                    </button>
                  </div>

                  {paymentMessage && (
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        paymentMessage.includes("saved")
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {paymentMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={paymentSubmitting}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {paymentSubmitting
                      ? "Saving…"
                      : `Save ${paymentMethod} info`}
                  </button>
                </form>
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
