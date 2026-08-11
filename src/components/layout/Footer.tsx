import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const shopLinks = [
  { name: "All Products", href: "/shop" },
  { name: "Fresh Produce", href: "/shop?category=fresh-produce" },
  { name: "Groceries", href: "/shop?category=pantry" },
  { name: "Drinks", href: "/shop?category=drinks" },
  { name: "Household", href: "/shop?category=household" },
];

const supportLinks = [
  { name: "Track Order", href: "/track-order" },
  { name: "Delivery Information", href: "/delivery" },
  { name: "FAQs", href: "/faq" },
  { name: "Contact Us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-[#FBBF24]"
            >
              Basketly
            </Link>

            <p className="mt-4 max-w-sm leading-7 text-gray-300">
              Your everyday essentials, delivered. Shop groceries,
              household products, drinks, snacks, and more from one
              convenient place.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <Phone size={17} className="text-[#FBBF24]" />
                <span>+233 000 000 000</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={17} className="text-[#FBBF24]" />
                <span>hello@basketly.com</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={17} className="text-[#FBBF24]" />
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold">Shop</h3>

            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition hover:text-[#FBBF24]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold">Support</h3>

            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition hover:text-[#FBBF24]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold">Stay in the loop</h3>

            <p className="mt-4 text-sm leading-6 text-gray-300">
              Get updates about new products, special offers, and Basketly
              deals.
            </p>

            <form className="mt-5 flex">
              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-l-full border-0 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />

              <button
                type="submit"
                className="rounded-r-full bg-[#FBBF24] px-5 py-3 text-sm font-bold text-[#1F2937] transition hover:bg-[#F59E0B]"
              >
                Subscribe
              </button>
            </form>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold transition hover:bg-[#16A34A]"
              >
                f
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold transition hover:bg-[#F97316]"
              >
                ig
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold transition hover:bg-[#16A34A]"
              >
                X
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Basketly. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}