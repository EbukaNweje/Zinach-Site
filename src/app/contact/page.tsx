"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send message.");

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Contact Us
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            Get in Touch
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Have questions about our services or need assistance? We&apos;re
            here to help. Reach out to our team for support.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-slate-900">
                Email Support
              </h3>
              <p className="mb-4 text-slate-600">
                Send us an email and we&apos;ll respond within 24 hours.
              </p>
              <a
                href="mailto:williammakismd1946@outlook.com"
                className="text-slate-900 hover:text-slate-700 font-medium"
              >
                williammakismd1946@outlook.com
              </a>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-slate-900">
                Phone Support
              </h3>
              <p className="mb-4 text-slate-600">
                Call us during business hours for immediate assistance.
              </p>
              <p className="text-slate-900 font-medium">+1 213 420 1622</p>
              <p className="text-sm text-slate-500 mt-2">
                Mon - Fri: 9AM - 5PM EST
              </p>
            </div>

            {/* <div className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-slate-900">
                Office Location
              </h3>
              <p className="text-slate-600">
                Dr William Makis MD
                <br />
                123 Medical Plaza Drive
                <br />
                Suite 456
                <br />
                Healthcare City, HC 12345
              </p>
            </div> */}
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-lg">
            <h3 className="mb-6 text-2xl font-semibold text-slate-900">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder="Please describe your question or concern..."
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>

              {status === "success" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  ✅ Message sent! We&apos;ll get back to you within 24 hours.
                </div>
              )}
              {status === "error" && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  ❌ {errorMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
