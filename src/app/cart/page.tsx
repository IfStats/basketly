"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useCountry } from "@/context/CountryContext";
import { formatMoney } from "@/lib/currency";
import { calculateMarketDeliveryFee } from "@/lib/market-pricing";
import type { Product } from "@/types/product";

export default function CartPage() {
  const { config } =
    useCountry();

  const {
    items,
    itemCount,
    subtotal,
    hydrated,
    updateQuantity,
    removeFromCart,
    reconcileCart,
  } = useCart();

  const [
    validating,
    setValidating,
  ] = useState(false);

  const [
    validated,
    setValidated,
  ] = useState(false);

  const [
    validationError,
    setValidationError,
  ] = useState("");

  const [
    adjustmentMessage,
    setAdjustmentMessage,
  ] = useState("");

  const reconciliationStarted =
    useRef(false);

  useEffect(() => {
    if (
      !hydrated ||
      reconciliationStarted.current
    ) {
      return;
    }

    reconciliationStarted.current =
      true;

    if (items.length === 0) {
      setValidated(true);
      return;
    }

    async function validateCart() {
      try {
        setValidating(true);
        setValidationError("");

        const response =
          await fetch(
            "/api/products",
            {
              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to refresh basket availability."
          );
        }

        const data =
          await response.json();

        const liveProducts =
          (
            data.products ?? []
          ) as Product[];

        const productMap =
          new Map(
            liveProducts.map(
              (product) => [
                product.id,
                product,
              ]
            )
          );

        let removed = 0;
        let repriced = 0;
        let quantityAdjusted =
          0;

        for (const item of items) {
          const liveProduct =
            productMap.get(
              item.id
            );

          if (
            !liveProduct ||
            liveProduct.stock <=
              0
          ) {
            removed += 1;
            continue;
          }

          if (
            liveProduct.price !==
            item.price
          ) {
            repriced += 1;
          }

          if (
            item.quantity >
            liveProduct.stock
          ) {
            quantityAdjusted +=
              1;
          }
        }

        reconcileCart(
          liveProducts
        );

        const messages: string[] =
          [];

        if (removed > 0) {
          messages.push(
            `${removed} unavailable ${
              removed === 1
                ? "item was"
                : "items were"
            } removed`
          );
        }

        if (repriced > 0) {
          messages.push(
            `${repriced} ${
              repriced === 1
                ? "price was"
                : "prices were"
            } updated`
          );
        }

        if (
          quantityAdjusted > 0
        ) {
          messages.push(
            `${quantityAdjusted} ${
              quantityAdjusted ===
              1
                ? "quantity was"
                : "quantities were"
            } adjusted to current stock`
          );
        }

        if (
          messages.length > 0
        ) {
          setAdjustmentMessage(
            `${messages.join(
              ", "
            )}.`
          );
        }

        setValidated(true);
      } catch (error) {
        console.error(
          "Cart validation error:",
          error
        );

        setValidationError(
          error instanceof Error
            ? error.message
            : "Unable to refresh basket."
        );
      } finally {
        setValidating(false);
      }
    }

    void validateCart();
  }, [
    hydrated,
    items,
    reconcileCart,
  ]);

  const deliveryFee =
    calculateMarketDeliveryFee(
      subtotal,
      config
    );

  const total =
    subtotal +
    deliveryFee;

  const freeDeliveryThreshold =
    config.freeDeliveryThreshold;

  const amountUntilFreeDelivery =
    freeDeliveryThreshold !== null
      ? Math.max(
          0,
          freeDeliveryThreshold -
            subtotal
        )
      : 0;

  if (!hydrated) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F8F6]">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-[#16A34A]"
          />

          <p className="mt-3 text-sm font-semibold text-gray-500">
            Loading basket...
          </p>
        </div>
      </main>
    );
  }

  if (
    items.length === 0 &&
    !validating
  ) {
    return (
      <main className="min-h-screen bg-[#F7F8F6]">
        <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-5 py-16 sm:px-8">
          <div className="w-full rounded-[2rem] border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
              <ShoppingBag
                size={36}
              />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#111827]">
              Your basket is
              empty
            </h1>

            <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600">
              Browse Basketly&apos;s
              groceries and everyday
              essentials to get
              started.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-7 py-3.5 font-bold text-white transition hover:bg-[#15803D]"
            >
              Start shopping
              <ArrowRight
                size={18}
              />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const checkoutAllowed =
    validated &&
    !validating &&
    !validationError &&
    config.deliveryEnabled &&
    items.length > 0;

  return (
    <main className="min-h-screen bg-[#F7F8F6]">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">
            Your basket
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#111827]">
            Review your order
          </h1>

          <p className="mt-3 text-gray-600">
            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}{" "}
            in your basket
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
        {validating && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
            <RefreshCw
              size={17}
              className="animate-spin"
            />

            Refreshing current
            prices and stock...
          </div>
        )}

        {adjustmentMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {adjustmentMessage}
            </span>
          </div>
        )}

        {validationError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {
                validationError
              }{" "}
              Refresh the page
              before proceeding to
              checkout.
            </span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map(
              (item) => {
                const atStockLimit =
                  item.quantity >=
                  item.stock;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <Link
                      href={`/products/${item.id}`}
                      className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100"
                    >
                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Package
                            size={30}
                          />
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {
                          item.category
                        }
                      </p>

                      <Link
                        href={`/products/${item.id}`}
                        className="mt-1 block text-lg font-bold text-[#111827] transition hover:text-[#16A34A]"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.unit}
                      </p>

                      <p className="mt-2 font-bold text-[#16A34A]">
                        {formatMoney(
                          item.price,
                          config.currency,
                          config.locale
                        )}
                      </p>

                      {item.stock <=
                        5 && (
                        <p className="mt-1 text-xs font-semibold text-amber-600">
                          {
                            item.stock
                          }{" "}
                          left in stock
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center rounded-full border border-gray-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity -
                                1
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus
                            size={
                              15
                            }
                          />
                        </button>

                        <span className="w-9 text-center text-sm font-bold text-[#111827]">
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity +
                                1
                            )
                          }
                          disabled={
                            atStockLimit
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus
                            size={
                              15
                            }
                          />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item.id
                          )
                        }
                        className="inline-flex items-center gap-2 text-sm text-red-500 transition hover:text-red-600"
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                        Remove
                      </button>
                    </div>

                    <div className="text-right sm:w-32">
                      <p className="text-lg font-bold text-[#111827]">
                        {formatMoney(
                          item.price *
                            item.quantity,
                          config.currency,
                          config.locale
                        )}
                      </p>
                    </div>
                  </div>
                );
              }
            )}

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-[#16A34A] transition hover:text-[#15803D]"
            >
              ← Continue shopping
            </Link>
          </div>

          <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-[#111827]">
              Order summary
            </h2>

            <div className="mt-6 space-y-4">
              <SummaryRow
                label="Subtotal"
                value={formatMoney(
                  subtotal,
                  config.currency,
                  config.locale
                )}
              />

              <SummaryRow
                label="Delivery"
                value={
                  deliveryFee === 0
                    ? "FREE"
                    : formatMoney(
                        deliveryFee,
                        config.currency,
                        config.locale
                      )
                }
              />

              {config.deliveryEnabled &&
                freeDeliveryThreshold !==
                  null &&
                subtotal > 0 &&
                subtotal <
                  freeDeliveryThreshold && (
                  <div className="rounded-2xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
                    Add{" "}
                    {formatMoney(
                      amountUntilFreeDelivery,
                      config.currency,
                      config.locale
                    )}{" "}
                    more to qualify
                    for free delivery.
                  </div>
                )}

              {!config.deliveryEnabled && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                  Delivery is
                  currently
                  unavailable in
                  this market.
                </div>
              )}

              <div className="h-px bg-gray-200" />

              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-[#111827]">
                  Total
                </span>

                <span className="text-xl font-bold text-[#16A34A]">
                  {formatMoney(
                    total,
                    config.currency,
                    config.locale
                  )}
                </span>
              </div>
            </div>

            {checkoutAllowed ? (
              <Link
                href="/checkout"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] px-6 py-4 font-bold text-white transition hover:bg-[#15803D]"
              >
                Proceed to
                checkout
                <ArrowRight
                  size={18}
                />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-7 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-gray-200 px-6 py-4 font-bold text-gray-400"
              >
                {validating
                  ? "Checking basket..."
                  : "Checkout unavailable"}
              </button>
            )}

            <p className="mt-4 text-center text-xs leading-5 text-gray-400">
              Basket prices and
              availability are
              checked against the
              live catalog before
              checkout.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}