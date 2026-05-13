export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            About Us
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            Dr William Makis MD — Wellness Pharmacy
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Dedicated to providing trusted healthcare solutions with
            physician-reviewed prescriptions and reliable shipping across the
            United States.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-slate-900">
                Physician-Supervised Care
              </h3>
              <p className="text-slate-600">
                Every prescription is reviewed by licensed physicians to ensure
                safety and appropriateness for your health needs.
              </p>
            </div>

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
                Secure & Private
              </h3>
              <p className="text-slate-600">
                Your health information is protected with enterprise-grade
                security and HIPAA-compliant practices.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4zm11 16H4V9h2v2h2V9h8v2h2V9h2v11z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-slate-900">
                Fast Shipping
              </h3>
              <p className="text-slate-600">
                Express shipping options available with tracking and delivery
                within 2-6 business days nationwide.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-slate-900">
                Quality Assurance
              </h3>
              <p className="text-slate-600">
                All medications are sourced from licensed U.S. pharmacies with
                rigorous quality control standards.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[2rem] bg-white p-8 shadow-lg">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Verified Credential
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">
              Licensed Medical Certificate
            </h2>
            <p className="mt-4 text-slate-600">
              This certificate demonstrates Dr William Makis MD’s official
              medical degree and qualification. The credential is issued from a
              recognized university and supports the pharmacy’s licensed care
              model.
            </p>
            <ul className="mt-8 space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-slate-900" />
                Physician-approved medical services
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-slate-900" />
                Accredited degree from an established institution
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-slate-900" />
                Trusted credential for safe prescription fulfillment
              </li>
            </ul>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-2xl">
            <img
              src="/WhatsApp%20Image%202026-05-12%20at%2012.58.39.jpeg"
              alt="Certificate for Dr William Makis MD"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-20 rounded-[2rem] bg-slate-900 p-12 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-semibold">Our Mission</h2>
            <p className="text-lg leading-8 text-slate-300">
              To provide accessible, affordable healthcare solutions that
              prioritize patient safety and physician oversight. We believe
              everyone deserves access to quality medications and professional
              medical guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
