"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  items: {
    id: string;
    quantity: number;
  }[];
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/orders");

      if (!response.ok) {
        throw new Error("Failed to load dashboard data.");
      }

      const data = await response.json();

      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "DELIVERED" &&
      order.status !== "CANCELLED"
  ).length;

  const uniqueCustomers = new Set(
    orders.map(
      (order) =>
        `${order.customer.firstName} ${order.customer.lastName}`
    )
  ).size;

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#16A34A]">
                Basketly Admin
              </p>

              <h1 className="mt-1 text-3xl font-bold text-[#1F2937]">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Overview of your Basketly store.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#16A34A] hover:text-[#16A34A] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6">
          <Link
            href="/admin"
            className="border-b-2 border-[#16A34A] px-4 py-4 text-sm font-semibold text-[#16A34A]"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
          >
            Orders
          </Link>

          <Link
            href="/shop"
            className="ml-auto px-4 py-4 text-sm font-semibold text-gray-500 transition hover:text-[#16A34A]"
          >
            View Store
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total orders"
            value={orders.length}
            icon={<ShoppingBag size={20} />}
          />

          <StatCard
            label="Pending orders"
            value={pendingOrders}
            icon={<Clock3 size={20} />}
          />

          <StatCard
            label="Active orders"
            value={activeOrders}
            icon={<Truck size={20} />}
          />

          <StatCard
            label="Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<span className="text-lg font-bold">$</span>}
          />
        </div>

        {/* Secondary Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Customers
                </p>

                <p className="mt-1 text-2xl font-bold text-[#1F2937]">
                  {uniqueCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
                <Package size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Delivered orders
                </p>

                <p className="mt-1 text-2xl font-bold text-[#1F2937]">
                  {deliveredOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-[#1F2937]">
                Recent orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest customer orders from your store.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#16A34A] hover:text-[#15803D]"
            >
              View all orders
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-500">
              Loading dashboard...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package
                size={40}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 font-bold text-[#1F2937]">
                No orders yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Customer orders will appear here once they
                start placing orders.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center rounded-full bg-[#16A34A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#15803D]"
              >
                View Store
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.slice(0, 8).map((order) => (
                <RecentOrderRow
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
        {icon}
      </div>

      <p className="mt-5 text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-[#1F2937]">
        {value}
      </p>
    </div>
  );
}

function RecentOrderRow({
  order,
}: {
  order: Order;
}) {
  const customerName = `${order.customer.firstName} ${order.customer.lastName}`;

  const formattedDate = new Date(
    order.createdAt
  ).toLocaleString();

  return (
    <div className="flex flex-col gap-4 px-6 py-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#16A34A]">
          <Package size={19} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-bold text-[#1F2937]">
              {order.orderNumber}
            </p>

            <StatusBadge status={order.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span>{customerName}</span>

            <span>
              {order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              )}{" "}
              items
            </span>

            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div>
          <p className="text-xs text-gray-400">
            Total
          </p>

          <p className="text-lg font-bold text-[#1F2937]">
            ${order.total.toFixed(2)}
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-[#16A34A] hover:text-[#16A34A]"
          aria-label={`View ${order.orderNumber}`}
        >
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY_FOR_PICKUP: "Ready",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
      {labels[status]}
    </span>
  );
}