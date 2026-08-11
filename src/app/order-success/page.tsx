"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Home,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

type Order = {
  orderNumber: string;
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
    notes: string;
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
  total: number;
  createdAt: string;
};

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem(
        "basketly-last-order"
      );

      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    } catch {
      setOrder(null);
    }
  }, []);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#FFFBEB]">
        <section className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <Package size={36} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#1F2937]">
              Order not found
            </h1>

            <p className="mt-3 text-gray-600">
              We couldn't find a recent Basketly order on this device.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#16A34A] px-7 py-3.5 font-bold text-white transition hover:bg-[#15803D]"
            >
              Continue Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFBEB]">
      {/* Success Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
            <Check size={40} strokeWidth={3} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-wider text-[#16A34A]">
            Order confirmed
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl">
            Thank you, {order.customer.firstName}!
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
            Your Basketly order has been received. We're getting your
            items ready for delivery.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700">
            <span>Order</span>
            <span className="text-[#16A34A]">
              #{order.orderNumber}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Delivery Progress */}
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1F2937]">
              Delivery status
            </h2>

            <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-700">
              Order received
            </span>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <StatusStep
              icon={<Check size={18} />}
              title="Order received"
              active
            />

            <StatusStep
              icon={<Package size={18} />}
              title="Preparing"
            />

            <StatusStep
              icon={<Truck size={18} />}
              title="On the way"
            />
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-2xl bg-green-50 p-4">
            <Clock3
              size={20}
              className="mt-0.5 shrink-0 text-[#16A34A]"
            />

            <div>
              <p className="font-bold text-[#1F2937]">
                Delivery window
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {formatDeliveryTime(order.delivery.time)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Order Details */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-[#16A34A]">
                  <ShoppingBag size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">
                    Order details
                  </h2>

                  <p className="text-sm text-gray-500">
                    {order.items.length} products
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-[#1F2937]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.quantity} × $
                        {item.price.toFixed(2)}
                      </p>
                    </div>

                    <p className="font-bold text-[#1F2937]">
                      $
                      {(
                        item.price * item.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-[#F97316]">
                  <Home size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">
                    Delivery address
                  </h2>

                  <p className="text-sm text-gray-500">
                    Your order will be delivered here.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                <p className="font-semibold text-[#1F2937]">
                  {order.customer.firstName}{" "}
                  {order.customer.lastName}
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {order.delivery.address}
                  <br />
                  {order.delivery.area}
                  <br />
                  {order.delivery.city}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  {order.customer.phone}
                </p>

                {order.delivery.notes && (
                  <p className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-500">
                    <strong>Note:</strong>{" "}
                    {order.delivery.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-[#1F2937]">
              Order summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-semibold">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Delivery
                </span>

                <span className="font-semibold">
                  {order.deliveryFee === 0
                    ? "FREE"
                    : `$${order.deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="flex justify-between">
                <span className="font-bold text-[#1F2937]">
                  Total
                </span>

                <span className="text-2xl font-bold text-[#16A34A]">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Payment
              </p>

              <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                Pay on delivery
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#16A34A] px-6 py-4 font-bold text-white transition hover:bg-[#15803D]"
            >
              Continue Shopping
              <ArrowRight size={18} />
            </Link>
          </aside>
        </div>
      </section>
    </main>
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
          active ? "text-[#1F2937]" : "text-gray-400"
        }`}
      >
        {title}
      </p>
    </div>
  );
}

function formatDeliveryTime(value: string) {
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