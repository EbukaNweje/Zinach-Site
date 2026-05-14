import Link from "next/link";
import Image from "next/image";
import { fetchProducts, Product } from "../lib/products";
import AddToCartButton from "../components/AddToCartButton";

export const dynamic = "force-dynamic";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Use the product section to choose a medication and then visit the Billing page to complete your purchase.",
  },
  {
    question: "Can I choose a different payment method?",
    answer:
      "Yes. The billing page offers Chime, Apple Pay, Zelle, PayPal, Venmo, Credit Card, and BTC address options.",
  },
  {
    question: "Do you ship nationwide?",
    answer:
      "Yes. We ship across the United States with express shipping available at checkout.",
  },
  {
    question: "Is payment required before shipping?",
    answer:
      "Yes. Orders are only processed and shipped after payment is confirmed and cleared.",
  },
];

export default async function Home() {
  const products = await fetchProducts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        {/* ── Hero ── */}
        <section
          id="home"
          className="relative overflow-hidden px-6 py-20 text-white"
        >
          <img
            src="/drdc.jpeg"
            alt="Dr. William Makis MD"
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-slate-950/50" />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-slate-200">
                Licensed U.S. Pharmacy
              </p>
              <h1 className="text-5xl font-bold leading-tight md:text-6xl">
                Dr William Makis MD — Wellness Pharmacy
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
                Access real healthcare from the comfort of your own home with
                trusted medications, fast shipping, and physician-reviewed
                prescriptions.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
                >
                  Order Now
                </a>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
            <div className="grid w-full max-w-lg place-items-center">
              <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] bg-slate-800">
                  <img
                    src="/rightimage.jpeg"
                    alt="Dr William Makis MD holding wellness products"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 grid gap-4 rounded-3xl bg-slate-900/80 p-6 text-slate-200 shadow-xl">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>FedEx 1–4 Days Shipping</span>
                    <span>Physician-Supervised</span>
                  </div>
                  <div className="rounded-3xl bg-slate-800/80 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                      Featured Offer
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      Ivermectin 9mg
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Fast, reliable treatment in a convenient capsule.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Products ── */}
        <section id="products" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 flex flex-col gap-4 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              Product List
            </p>
            <h2 className="text-4xl font-semibold text-slate-900">
              Our Most Popular Products
            </h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              Choose the right medication for your needs and complete your order
              in the billing section.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <p className="text-slate-500">No Products available</p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {products.slice(0, 3).map((product: Product) => (
                <article
                  key={product._id}
                  className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="overflow-hidden rounded-[1.75rem] bg-slate-50">
                    {product.image ? (
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" />
                    )}
                  </div>
                  <span className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    {product.brand}
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {product.price}
                  </p>
                  <div className="mt-5 flex gap-3">
                    <AddToCartButton product={product} />
                    <Link
                      href={`/product/${product.slug}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {products.length > 3 && (
            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View all products
              </Link>
            </div>
          )}
        </section>

        {/* ── About ── */}
        <section id="about" className="bg-slate-950 px-6 py-20 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                  About Us
                </p>
                <h2 className="mt-4 text-4xl font-semibold">
                  Trusted care with every order
                </h2>
                <p className="mt-6 max-w-xl leading-8 text-slate-300">
                  All Family Health is a licensed U.S. pharmacy delivering
                  physician-supervised prescriptions and wellness essentials
                  with fast shipping and clear payment guidance.
                </p>
              </div>
              <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
                <div className="rounded-3xl bg-slate-900/90 p-6">
                  <h3 className="text-xl font-semibold">Safe delivery</h3>
                  <p className="mt-3 text-slate-300">
                    Orders are verified and processed only after payment clears.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-6">
                  <h3 className="text-xl font-semibold">Easy checkout</h3>
                  <p className="mt-3 text-slate-300">
                    Complete your billing information and choose Chime, Apple
                    Pay, Zelle, PayPal, Venmo, Credit Card, or BTC address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              FAQ
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {item.question}
                </h3>
                <p className="mt-4 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="bg-slate-900 px-6 py-20 text-white">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/90 p-10 shadow-2xl">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                  Contact
                </p>
                <h2 className="mt-4 text-4xl font-semibold">
                  Questions or order help?
                </h2>
                <p className="mt-5 max-w-xl leading-8 text-slate-300">
                  Reach out anytime for support with your order or payment.
                </p>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>
                  <span className="font-semibold text-white">Email:</span>{" "}
                  <a
                    href="mailto:williammakismd1946@outlook.com"
                    className="text-cyan-300 hover:text-cyan-200"
                  >
                    williammakismd1946@outlook.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-white">WhatsApp:</span>{" "}
                  <a
                    href="https://wa.me/12134201622"
                    className="text-cyan-300 hover:text-cyan-200"
                  >
                    +1 213 420 1622
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-10 text-slate-700">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Dr William Makis MD
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6">
              Licensed pharmacy with fast US shipping, physician oversight, and
              secure order processing.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p>williammakismd1946@outlook.com</p>
            <p>WhatsApp: +1 213 420 1622</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
