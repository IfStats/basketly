"use client";

import Link from "next/link";
import {
  Menu,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  countries,
  type CountryCode,
} from "@/config/countries";
import { useCountry } from "@/context/CountryContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const { itemCount } = useCart();
  const { country, setCountry } =
    useCountry();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() =>
            setMobileOpen(false)
          }
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-xl shadow-sm">
            🛒
          </div>

          <span className="text-2xl font-black tracking-tight text-[#111827]">
            Basket
            <span className="text-[#16A34A]">
              ly
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 transition hover:text-[#16A34A]"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-sm font-semibold text-gray-600 transition hover:text-[#16A34A]"
          >
            Shop
          </Link>

          <Link
            href="/deals"
            className="text-sm font-semibold text-gray-600 transition hover:text-[#16A34A]"
          >
            Deals
          </Link>

          <Link
            href="/delivery"
            className="text-sm font-semibold text-gray-600 transition hover:text-[#16A34A]"
          >
            Delivery
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <label className="relative">
            <span className="sr-only">
              Country
            </span>

            <select
              value={country}
              onChange={(event) =>
                setCountry(
                  event.target
                    .value as CountryCode
                )
              }
              className="appearance-none rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-3 pr-8 text-xs font-bold text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
            >
              {Object.values(
                countries
              ).map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.flag} {item.code} ·{" "}
                  {item.currency}
                </option>
              ))}
            </select>
          </label>

          <Link
            href="/shop"
            aria-label="Search products"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-[#16A34A]"
          >
            <Search size={20} />
          </Link>

          <Link
            href="/cart"
            aria-label={`Shopping basket with ${itemCount} items`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-[#16A34A] transition hover:bg-green-100"
          >
            <ShoppingCart size={21} />

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F97316] px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {itemCount > 99
                  ? "99+"
                  : itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/shop"
            className="rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#15803D]"
          >
            Shop Now
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            aria-label={`Shopping basket with ${itemCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-[#16A34A]"
          >
            <ShoppingCart size={20} />

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F97316] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount > 99
                  ? "99+"
                  : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label={
              mobileOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            onClick={() =>
              setMobileOpen(
                (current) => !current
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          >
            {mobileOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-5 md:hidden">
          <div className="mb-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Shopping country
            </label>

            <select
              value={country}
              onChange={(event) =>
                setCountry(
                  event.target
                    .value as CountryCode
                )
              }
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
            >
              {Object.values(
                countries
              ).map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.flag} {item.name} ·{" "}
                  {item.currency}
                </option>
              ))}
            </select>
          </div>

          <nav className="flex flex-col gap-1">
            <MobileLink
              href="/"
              label="Home"
              onClick={() =>
                setMobileOpen(false)
              }
            />

            <MobileLink
              href="/shop"
              label="Shop"
              onClick={() =>
                setMobileOpen(false)
              }
            />

            <MobileLink
              href="/deals"
              label="Deals"
              onClick={() =>
                setMobileOpen(false)
              }
            />

            <MobileLink
              href="/delivery"
              label="Delivery"
              onClick={() =>
                setMobileOpen(false)
              }
            />

            <MobileLink
              href="/cart"
              label={`Basket${
                itemCount > 0
                  ? ` (${itemCount})`
                  : ""
              }`}
              onClick={() =>
                setMobileOpen(false)
              }
            />
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-4 py-3 font-semibold text-gray-700 transition hover:bg-green-50 hover:text-[#16A34A]"
    >
      {label}
    </Link>
  );
}