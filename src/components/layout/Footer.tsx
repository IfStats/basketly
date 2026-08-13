import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const shopLinks = [
  { name: "All products", href: "/shop" },
  { name: "Fresh produce", href: "/shop?category=Fresh%20Produce" },
  { name: "Groceries & pantry", href: "/shop?category=Groceries%20%26%20Pantry" },
  { name: "Drinks", href: "/shop?category=Drinks" },
  { name: "Household", href: "/shop?category=Household" },
];

const supportLinks = [
  { name: "Delivery information", href: "/delivery" },
  { name: "FAQs", href: "/faq" },
  { name: "Contact us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#111827] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.25fr]">
          <div>
            <Link href="/" className="text-2xl font-black tracking-[-0.04em]">
              Basket<span className="text-green-400">ly</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
              Everyday groceries and essentials, organized for a faster, calmer shopping experience.
            </p>

            <div className="mt-6 space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3"><Phone size={16} className="text-green-400" /><span>+233 000 000 000</span></div>
              <div className="flex items-center gap-3"><Mail size={16} className="text-green-400" /><span>hello@basketly.com</span></div>
              <div className="flex items-center gap-3"><MapPin size={16} className="text-green-400" /><span>Accra, Ghana</span></div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-400">Shop</h3>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.name}><Link href={link.href} className="text-sm text-gray-300 transition hover:text-white">{link.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-400">Support</h3>
            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}><Link href={link.href} className="text-sm text-gray-300 transition hover:text-white">{link.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-300">Stay in the loop</p>
            <h3 className="mt-2 text-xl font-bold">Fresh deals. Useful updates.</h3>
            <p className="mt-2 text-sm leading-6 text-gray-300">Get occasional Basketly offers and product updates.</p>
            <form className="mt-5 flex overflow-hidden rounded-full bg-white p-1">
              <input
                type="email"
                aria-label="Email address"
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              <button type="submit" className="rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#15803D]">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Basketly. All rights reserved.</p>
          <div className="flex gap-5"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></div>
        </div>
      </div>
    </footer>
  );
}
