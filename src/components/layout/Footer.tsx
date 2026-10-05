import Link from "next/link";
import {
  MapPin,
  ShoppingBasket,
} from "lucide-react";

const shopLinks = [
  {
    name: "All products",
    href: "/shop",
  },
  {
    name: "Fresh produce",
    href:
      "/shop?category=Fresh%20Produce",
  },
  {
    name: "Groceries & pantry",
    href:
      "/shop?category=Groceries%20%26%20Pantry",
  },
  {
    name: "Drinks",
    href:
      "/shop?category=Drinks",
  },
  {
    name: "Household",
    href:
      "/shop?category=Household",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#111827] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-white">
                <ShoppingBasket
                  size={20}
                />
              </div>

              <span className="text-2xl font-black tracking-[-0.04em]">
                Basket
                <span className="text-green-400">
                  ly
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-300">
              Everyday groceries and
              essentials, organized for a
              faster and simpler shopping
              experience.
            </p>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300">
              <MapPin
                size={16}
                className="text-green-400"
              />

              Ghana market
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              Shop
            </h3>

            <ul className="mt-5 space-y-3">
              {shopLinks.map(
                (link) => (
                  <li
                    key={link.name}
                  >
                    <Link
                      href={
                        link.href
                      }
                      className="text-sm text-gray-300 transition hover:text-white"
                    >
                      {
                        link.name
                      }
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              Basketly
            </h3>

            <p className="mt-5 max-w-xs text-sm leading-6 text-gray-300">
              We are currently preparing
              Basketly for our Ghana
              pilot. Additional markets
              and customer services will
              be introduced progressively.
            </p>

            <Link
              href="/cart"
              className="mt-6 inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              View basket
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-gray-400">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Basketly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}