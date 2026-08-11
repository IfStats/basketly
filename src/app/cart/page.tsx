"use client";

import Link from "next/link";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const deliveryFee =
    subtotal >= 50 || subtotal === 0 ? 0 : 4.99;

  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FFFBEB]">
        <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
              <ShoppingBag size={36} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#1F2937]">
              Your basket is empty
            </h1>

            <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600">
              Looks like you haven't added anything yet. Browse our
              groceries and everyday essentials to get started.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-7 py-3.5 font-bold text-white transition hover:bg-[#15803D]"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFBEB]">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F97316]">
            Your basket
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#1F2937]">
            Review your order
          </h1>

          <p className="mt-3 text-gray-600">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your basket
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
              >
                {/* Product Image */}
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-5xl">
                  {getProductEmoji(item.category)}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    {item.category}
                  </p>

                  <Link
                    href={`/products/${item.id}`}
                    className="mt-1 block text-lg font-bold text-[#1F2937] transition hover:text-[#16A34A]"
                  >
                    {item.name}
                  </Link>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.unit}
                  </p>

                  <p className="mt-2 font-bold text-[#16A34A]">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity & Remove */}
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-full border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <Minus size={15} />
                    </button>

                    <span className="w-9 text-center text-sm font-bold text-[#1F2937]">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
                      aria-label={`Increase ${item.name}`}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    className="inline-flex items-center gap-2 text-sm text-red-500 transition hover:text-red-600"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right sm:w-24">
                  <p className="text-lg font-bold text-[#1F2937]">
                    $
                    {(
                      item.price * item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-[#16A34A] transition hover:text-[#15803D]"
            >
              ← Continue shopping
            </Link>
          </div>

          {/* Order Summary */}
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold text-[#1F2937]">
              Order summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Delivery
                </span>

                <span className="font-semibold text-gray-900">
                  {deliveryFee === 0
                    ? "FREE"
                    : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {subtotal > 0 && subtotal < 50 && (
                <div className="rounded-2xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
                  Add $
                  {(50 - subtotal).toFixed(2)} more to
                  qualify for free delivery.
                </div>
              )}

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1F2937]">
                  Total
                </span>

                <span className="text-xl font-bold text-[#16A34A]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] px-6 py-4 font-bold text-white transition hover:bg-[#15803D]"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              Delivery options and final charges will be confirmed
              at checkout.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function getProductEmoji(category: string) {
  switch (category) {
    case "Fresh Produce":
      return "🥬";

    case "Dairy & Eggs":
      return "🥛";

    case "Groceries & Pantry":
      return "🍚";

    case "Drinks":
      return "🥤";

    case "Snacks":
      return "🍿";

    case "Household":
      return "🧴";

    case "Meat & Seafood":
      return "🥩";

    default:
      return "🛒";
  }
}