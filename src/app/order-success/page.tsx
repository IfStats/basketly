"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Home,
  Package,
  ShoppingBag,
  Tag,
  Truck,
} from "lucide-react";

import { formatMoney } from "@/lib/currency";

type Order = {
  orderNumber: string;
  marketCode?: string;
  currency?: string;
  locale?: string;

  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  delivery: {
    address: string;
    area: string;
    city: string;
    notes?: string;
    time: string;
  };

  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];

  subtotal: number;
  deliveryFee: number;
  discount?: number;
  promotionCode?: string | null;
  total: number;
  createdAt: string;
};

const STORAGE_KEY =
  "basketly-last-order";

export default function OrderSuccessPage() {
  const [order, setOrder] =
    useState<Order | null>(null);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        try {
          const savedOrder =
            window.localStorage.getItem(
              STORAGE_KEY
            );

          if (!savedOrder) {
            setOrder(null);
            return;
          }

          const parsedOrder =
            JSON.parse(
              savedOrder
            ) as Order;

          const params =
            new URLSearchParams(
              window.location.search
            );

          const requestedOrder =
            params.get("order");

          /*
           * Never show another cached order
           * when a specific order number was
           * requested in the URL.
           */
          if (
            requestedOrder &&
            requestedOrder !==
              parsedOrder.orderNumber
          ) {
            setOrder(null);
            return;
          }

          setOrder(parsedOrder);
        } catch {
          setOrder(null);
        } finally {
          setLoaded(true);
        }
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8F6]">
        <p className="text-sm font-semibold text-gray-500">
          Loading order...
        </p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#F7F8F6]">
        <section className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-5 py-16 sm:px-8">
          <div className="w-full rounded-[2rem] border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <Package size={36} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#111827]">
              Order not found
            </h1>

            <p className="mt-3 leading-6 text-gray-600">
              We couldn&apos;t find this
              Basketly order on this
              device.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-7 py-3.5 font-bold text-white transition hover:bg-[#15803D]"
            >
              Continue shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const currency =
    order.currency ?? "GHS";

  const locale =
    order.locale ?? "en-GH";

  const discount =
    order.discount ?? 0;

  function money(amount: number) {
    return formatMoney(
      amount,
      currency,
      locale
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8F6]">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
            <Check
              size={40}
              strokeWidth={3}
            />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">
            Order confirmed
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
            Thank you,{" "}
            {
              order.customer
                .firstName
            }
            !
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
            Your Basketly order has
            been received. We&apos;re
            getting your items ready
            for delivery.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700">
            <span>Order</span>

            <span className="text-[#16A34A]">
              #
              {
                order.orderNumber
              }
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#111827]">
              Delivery status
            </h2>

            <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-700">
              Order received
            </span>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <StatusStep
              icon={
                <Check
                  size={18}
                />
              }
              title="Order received"
              active
            />

            <StatusStep
              icon={
                <Package
                  size={18}
                />
              }
              title="Preparing"
            />

            <StatusStep
              icon={
                <Truck
                  size={18}
                />
              }
              title="On the way"
            />
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-2xl bg-green-50 p-4">
            <Clock3
              size={20}
              className="mt-0.5 shrink-0 text-[#16A34A]"
            />

            <div>
              <p className="font-bold text-[#111827]">
                Delivery window
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {formatDeliveryTime(
                  order.delivery
                    .time
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
                  <ShoppingBag
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#111827]">
                    Order details
                  </h2>

                  <p className="text-sm text-gray-500">
                    {
                      order.items
                        .length
                    }{" "}
                    {order.items
                      .length === 1
                      ? "product"
                      : "products"}
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-gray-100">
                {order.items.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[#111827]">
                          {
                            item.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            item.quantity
                          }{" "}
                          ×{" "}
                          {money(
                            item.price
                          )}
                        </p>
                      </div>

                      <p className="shrink-0 font-bold text-[#111827]">
                        {money(
                          item.price *
                            item.quantity
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-[#F97316]">
                  <Home
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#111827]">
                    Delivery address
                  </h2>

                  <p className="text-sm text-gray-500">
                    Your order will
                    be delivered
                    here.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                <p className="font-semibold text-[#111827]">
                  {
                    order.customer
                      .firstName
                  }{" "}
                  {
                    order.customer
                      .lastName
                  }
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {
                    order.delivery
                      .address
                  }
                  <br />

                  {
                    order.delivery
                      .area
                  }
                  <br />

                  {
                    order.delivery
                      .city
                  }
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  {
                    order.customer
                      .phone
                  }
                </p>

                {order.delivery
                  .notes && (
                  <p className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-500">
                    <strong>
                      Note:
                    </strong>{" "}
                    {
                      order
                        .delivery
                        .notes
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-[#111827]">
              Order summary
            </h2>

            <div className="mt-6 space-y-4">
              <SummaryRow
                label="Subtotal"
                value={money(
                  order.subtotal
                )}
              />

              <SummaryRow
                label="Delivery"
                value={
                  order.deliveryFee ===
                  0
                    ? "FREE"
                    : money(
                        order.deliveryFee
                      )
                }
              />

              {discount > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`-${money(
                    discount
                  )}`}
                  accent
                />
              )}

              {order.promotionCode && (
                <div className="flex items-center justify-between gap-4 rounded-xl bg-green-50 px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-700">
                    <Tag
                      size={14}
                    />
                    Promotion
                  </span>

                  <span className="text-xs font-bold uppercase tracking-wide text-green-800">
                    {
                      order.promotionCode
                    }
                  </span>
                </div>
              )}

              <div className="h-px bg-gray-200" />

              <div className="flex items-end justify-between gap-4">
                <span className="font-bold text-[#111827]">
                  Total
                </span>

                <span className="text-2xl font-bold text-[#16A34A]">
                  {money(
                    order.total
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Payment
              </p>

              <p className="mt-1 text-sm font-semibold text-[#111827]">
                Pay on delivery
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Market
              </p>

              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {order.marketCode ??
                  "GH"}{" "}
                · {currency}
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] px-6 py-4 font-bold text-white transition hover:bg-[#15803D]"
            >
              Continue shopping
              <ArrowRight
                size={18}
              />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500">
        {label}
      </span>

      <span
        className={`font-semibold ${
          accent
            ? "text-[#16A34A]"
            : "text-[#111827]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusStep({
  icon,
  title,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  active?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
          active
            ? "bg-[#16A34A] text-white"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </div>

      <p
        className={`mt-3 text-xs font-bold sm:text-sm ${
          active
            ? "text-[#111827]"
            : "text-gray-400"
        }`}
      >
        {title}
      </p>
    </div>
  );
}

function formatDeliveryTime(
  value: string
) {
  switch (value) {
    case "12-3":
      return "12:00 PM – 3:00 PM";

    case "5-8":
      return "5:00 PM – 8:00 PM";

    case "as-soon-as-possible":
    default:
      return "As soon as possible";
  }
}