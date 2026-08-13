"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

type PromotionPreview = {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DELIVERY";
  discount: number;
  deliveryFee: number;
  total: number;
  message?: string;
};

export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    itemCount,
    subtotal,
    clearCart,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [promotionCode, setPromotionCode] = useState("");
  const [promotion, setPromotion] =
    useState<PromotionPreview | null>(null);
  const [promotionError, setPromotionError] =
    useState("");
  const [checkingPromotion, setCheckingPromotion] =
    useState(false);

  const baseDeliveryFee =
    subtotal >= 50 || subtotal === 0 ? 0 : 4.99;

  const deliveryFee =
    promotion?.deliveryFee ?? baseDeliveryFee;

  const discount = promotion?.discount ?? 0;

  const total = promotion
    ? promotion.total
    : subtotal + baseDeliveryFee;

  async function applyPromotion() {
    const code = promotionCode.trim().toUpperCase();

    if (!code) {
      setPromotionError("Enter a promotion code.");
      return;
    }

    try {
      setCheckingPromotion(true);
      setPromotionError("");

      const response = await fetch(
        "/api/promotions/validate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            subtotal,
            email: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "This promotion cannot be applied."
        );
      }

      setPromotion({
        code,
        type: data.promotion.type,
        discount: data.discount,
        deliveryFee: data.deliveryFee,
        total: data.total,
      });

      setPromotionCode(code);
    } catch (err) {
      setPromotion(null);
      setPromotionError(
        err instanceof Error
          ? err.message
          : "This promotion cannot be applied."
      );
    } finally {
      setCheckingPromotion(false);
    }
  }

  function removePromotion() {
    setPromotion(null);
    setPromotionCode("");
    setPromotionError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);

      const payload = {
        customer: {
          firstName: String(
            formData.get("firstName") || ""
          ),
          lastName: String(
            formData.get("lastName") || ""
          ),
          email: String(
            formData.get("email") || ""
          ),
          phone: String(
            formData.get("phone") || ""
          ),
        },

        delivery: {
          address: String(
            formData.get("address") || ""
          ),
          area: String(
            formData.get("area") || ""
          ),
          city: String(
            formData.get("city") || ""
          ),
          notes: String(
            formData.get("deliveryNotes") || ""
          ),
          time: String(
            formData.get("deliveryTime") ||
              "as-soon-as-possible"
          ),
        },

        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),

        promotionCode: promotion?.code || null,

        subtotal,
        deliveryFee: baseDeliveryFee,
        total: subtotal + baseDeliveryFee,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to place your order."
        );
      }

      clearCart();

      router.push(
        `/order-success?order=${data.order.orderNumber}`
      );
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while placing your order."
      );

      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FFFBEB]">
        <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
              <CheckCircle2 size={38} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#1F2937]">
              Your basket is empty
            </h1>

            <p className="mt-3 text-gray-600">
              Add some products before proceeding to checkout.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center rounded-full bg-[#16A34A] px-7 py-3.5 font-bold text-white transition hover:bg-[#15803D]"
            >
              Start Shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFBEB]">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#16A34A]"
          >
            <ArrowLeft size={16} />
            Back to basket
          </Link>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#1F2937]">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your details and choose your delivery time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#1F2937]">
                Contact information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                We'll use these details to contact you about your order.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Input
                  id="firstName"
                  label="First name"
                  placeholder="First name"
                  required
                />

                <Input
                  id="lastName"
                  label="Last name"
                  placeholder="Last name"
                  required
                />

                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  required
                />

                <Input
                  id="phone"
                  label="Phone number"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  required
                />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">
                    Delivery address
                  </h2>

                  <p className="text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <Input
                  id="address"
                  label="Street address"
                  placeholder="House number and street"
                  required
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    id="area"
                    label="Area / Neighborhood"
                    placeholder="e.g. East Legon"
                    required
                  />

                  <Input
                    id="city"
                    label="City"
                    placeholder="Accra"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="deliveryNotes"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Delivery notes
                    <span className="ml-1 font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="deliveryNotes"
                    name="deliveryNotes"
                    rows={3}
                    placeholder="Landmark, gate instructions, or anything the rider should know..."
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-[#F97316]">
                  <Clock3 size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">
                    Delivery time
                  </h2>

                  <p className="text-sm text-gray-500">
                    Choose when you'd like your order delivered.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <DeliveryOption
                  value="as-soon-as-possible"
                  title="ASAP"
                  subtitle="Earliest available"
                  defaultChecked
                />

                <DeliveryOption
                  value="12-3"
                  title="12:00 – 3:00"
                  subtitle="Afternoon"
                />

                <DeliveryOption
                  value="5-8"
                  title="5:00 – 8:00"
                  subtitle="Evening"
                />
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-[#1F2937]">
              Your order
            </h2>

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1F2937]">
                      {item.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {item.quantity} × $
                      {item.price.toFixed(2)}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    $
                    {(
                      item.price * item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-6 h-px bg-gray-200" />

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Tag
                  size={17}
                  className="text-[#16A34A]"
                />

                <p className="text-sm font-bold text-[#1F2937]">
                  Have a promo code?
                </p>
              </div>

              {!promotion ? (
                <div className="mt-3 flex gap-2">
                  <input
                    value={promotionCode}
                    onChange={(event) =>
                      setPromotionCode(
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="ENTER CODE"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold uppercase tracking-wide outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={applyPromotion}
                    disabled={checkingPromotion}
                    className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {checkingPromotion
                      ? "..."
                      : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Check
                      size={16}
                      className="text-[#16A34A]"
                    />

                    <div>
                      <p className="text-sm font-bold text-green-800">
                        {promotion.code}
                      </p>

                      <p className="text-xs text-green-700">
                        Promotion applied
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removePromotion}
                    className="rounded-lg p-2 text-green-700 hover:bg-green-100"
                    aria-label="Remove promotion"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {promotionError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {promotionError}
                </p>
              )}
            </div>

            <div className="my-6 h-px bg-gray-200" />

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({itemCount} items)
                </span>

                <span className="font-semibold">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {promotion && discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Promotion
                  </span>

                  <span className="font-semibold text-[#16A34A]">
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Delivery
                </span>

                <span className="font-semibold">
                  {deliveryFee === 0
                    ? "FREE"
                    : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1F2937]">
                  Total
                </span>

                <span className="text-2xl font-bold text-[#16A34A]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 w-full rounded-full bg-[#16A34A] px-6 py-4 font-bold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Placing Order..."
                : "Place Order"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              Your order total and promotion will be verified securely when the order is placed.
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}

function Input({
  id,
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
      />
    </div>
  );
}

function DeliveryOption({
  value,
  title,
  subtitle,
  defaultChecked = false,
}: {
  value: string;
  title: string;
  subtitle: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name="deliveryTime"
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />

      <div className="rounded-2xl border border-gray-200 p-4 transition peer-checked:border-[#16A34A] peer-checked:bg-green-50">
        <p className="font-bold text-[#1F2937]">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {subtitle}
        </p>
      </div>
    </label>
  );
}