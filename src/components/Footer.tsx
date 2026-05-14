import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Dr William Makis MD
            </h3>
            <p className="text-sm">
              Trusted pharmacy services with physician-reviewed orders and
              secure checkout.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-white">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: williammakismd1946@outlook.com</li>
              <li>Phone: +1 213 420 1622</li>
              <li>Hours: Mon - Fri, 9AM - 5PM EST</li>
              <li>
                <a
                  href="https://www.facebook.com/share/1HJPs4dkBa/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-white"
                >
                  Facebook share
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/Dr_William_Makis_MD"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-white"
                >
                  Telegram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm">
          <p>&copy; {currentYear} Dr William Makis MD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
