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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-xl shadow-sm">
            🛒
          </div>

          <span className="text-2xl font-black tracking-tight text-[#1F2937]">
            Basket<span className="text-[#16A34A]">ly</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
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
                {itemCount > 99 ? "99+" : itemCount}
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

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            aria-label={`Shopping basket with ${itemCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-[#16A34A]"
          >
            <ShoppingCart size={20} />

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F97316] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount > 99 ? "99+" : itemCount}
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
            onClick={() => setMobileOpen((current) => !current)}
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

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-1">
            <MobileLink
              href="/"
              label="Home"
              onClick={() => setMobileOpen(false)}
            />

            <MobileLink
              href="/shop"
              label="Shop"
              onClick={() => setMobileOpen(false)}
            />

            <MobileLink
              href="/deals"
              label="Deals"
              onClick={() => setMobileOpen(false)}
            />

            <MobileLink
              href="/delivery"
              label="Delivery"
              onClick={() => setMobileOpen(false)}
            />

            <MobileLink
              href="/cart"
              label={`Basket${itemCount > 0 ? ` (${itemCount})` : ""}`}
              onClick={() => setMobileOpen(false)}
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