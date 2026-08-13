"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
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
    email?: string;
    phone?: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
};

const statusMeta: Record<
  OrderStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  PENDING: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    dotClassName: "bg-blue-500",
  },
  PREPARING: {
    label: "Preparing",
    className:
      "border-orange-200 bg-orange-50 text-orange-700",
    dotClassName: "bg-orange-500",
  },
  READY_FOR_PICKUP: {
    label: "Ready for pickup",
    className:
      "border-violet-200 bg-violet-50 text-violet-700",
    dotClassName: "bg-violet-500",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-700",
    dotClassName: "bg-indigo-500",
  },
  DELIVERED: {
    label: "Delivered",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "border-red-200 bg-red-50 text-red-700",
    dotClassName: "bg-red-500",
  },
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load dashboard data."
        );
      }

      const data = await response.json();

      setOrders(data.orders ?? []);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function logout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await fetch("/api/admin/logout", {
        method: "POST",
      });

      window.location.href = "/admin/login";
    } catch (err) {
      console.error("Logout error:", err);
      setLoggingOut(false);
    }
  }

  const metrics = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === "PENDING"
    ).length;

    const active = orders.filter((order) =>
      [
        "CONFIRMED",
        "PREPARING",
        "READY_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
      ].includes(order.status)
    ).length;

    const delivered = orders.filter(
      (order) => order.status === "DELIVERED"
    ).length;

    const cancelled = orders.filter(
      (order) => order.status === "CANCELLED"
    ).length;

    const revenue = orders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const customers = new Set(
      orders.map(
        (order) =>
          order.customer.email ||
          order.customer.phone ||
          `${order.customer.firstName}-${order.customer.lastName}`
      )
    ).size;

    const averageOrderValue =
      orders.length > 0
        ? revenue / orders.length
        : 0;

    return {
      pending,
      active,
      delivered,
      cancelled,
      revenue,
      customers,
      averageOrderValue,
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 8);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#111827]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-white shadow-sm">
                  <ShoppingBag size={20} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">
                    Basketly
                  </p>

                  <p className="text-sm font-semibold text-gray-500">
                    Administration
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
                  Overview
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Monitor your store performance and order activity.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                View store
                <ArrowUpRight size={16} />
              </Link>

              <button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#16A34A] hover:text-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {loggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-6">
          <AdminNavLink
            href="/admin"
            active
          >
            Overview
          </AdminNavLink>

          <AdminNavLink href="/admin/orders">
            Orders
          </AdminNavLink>

          <AdminNavLink href="/admin/products">
            Products
          </AdminNavLink>

          <Link
            href="/admin/products/import"
            className="ml-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
          >
            Import catalog
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total orders"
            value={orders.length}
            description="All recorded orders"
            icon={<ShoppingBag size={20} />}
          />

          <MetricCard
            title="Active orders"
            value={metrics.active}
            description="Currently being fulfilled"
            icon={<Truck size={20} />}
          />

          <MetricCard
            title="Revenue"
            value={`$${metrics.revenue.toFixed(2)}`}
            description={`Avg. order $${metrics.averageOrderValue.toFixed(2)}`}
            icon={<DollarSign size={20} />}
          />

          <MetricCard
            title="Customers"
            value={metrics.customers}
            description="Unique customers"
            icon={<Users size={20} />}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                  Operations
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Order pipeline
                </h2>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#16A34A] hover:text-[#15803D]"
              >
                Manage orders
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
              <PipelineCard
                label="Pending"
                value={metrics.pending}
                icon={<Clock3 size={18} />}
                tone="amber"
              />

              <PipelineCard
                label="In progress"
                value={metrics.active}
                icon={<Truck size={18} />}
                tone="blue"
              />

              <PipelineCard
                label="Delivered"
                value={metrics.delivered}
                icon={<CheckCircle2 size={18} />}
                tone="green"
              />

              <PipelineCard
                label="Cancelled"
                value={metrics.cancelled}
                icon={<Box size={18} />}
                tone="red"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                  Quick actions
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Store management
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <QuickAction
                href="/admin/products"
                title="Manage products"
                description="Update pricing, stock and visibility."
              />

              <QuickAction
                href="/admin/products/import"
                title="Import catalog"
                description="Load products into your database."
              />

              <QuickAction
                href="/admin/orders"
                title="Review orders"
                description="Manage fulfillment and delivery status."
              />
            </div>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                Recent activity
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Latest orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                The most recent customer transactions.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#16A34A] hover:text-[#15803D]"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-[#16A34A]"
              />

              <p className="mt-4 text-sm text-gray-500">
                Loading dashboard...
              </p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Package size={22} />
              </div>

              <h3 className="mt-4 font-bold">
                No orders yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Customer activity will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <RecentOrderRow
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function AdminNavLink({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`border-b-2 px-4 py-4 text-sm font-semibold transition ${
        active
          ? "border-[#16A34A] text-[#16A34A]"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
          {icon}
        </div>

        <ArrowUpRight
          size={17}
          className="text-gray-300"
        />
      </div>

      <p className="mt-6 text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-[#111827]">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

function PipelineCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "amber" | "blue" | "green" | "red";
}) {
  const toneClasses = {
    amber:
      "bg-amber-50 text-amber-700",
    blue:
      "bg-blue-50 text-blue-700",
    green:
      "bg-emerald-50 text-emerald-700",
    red:
      "bg-red-50 text-red-700",
  };

  return (
    <div className="p-6">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 transition hover:border-green-100 hover:bg-green-50"
    >
      <div>
        <p className="text-sm font-bold text-gray-800 group-hover:text-[#15803D]">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="text-gray-300 transition group-hover:text-[#16A34A]"
      />
    </Link>
  );
}

function RecentOrderRow({
  order,
}: {
  order: Order;
}) {
  const meta = statusMeta[order.status];

  const customerName =
    `${order.customer.firstName} ${order.customer.lastName}`;

  const itemCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="flex flex-col gap-4 px-6 py-5 transition hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
          <Package size={18} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-bold text-gray-900">
              {order.orderNumber}
            </p>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`}
              />

              {meta.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {customerName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8 lg:justify-end">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">
            Items
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-700">
            {itemCount}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">
            Total
          </p>

          <p className="mt-1 text-sm font-bold text-[#16A34A]">
            ${order.total.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">
            Date
          </p>

          <p className="mt-1 text-sm font-medium text-gray-700">
            {new Date(
              order.createdAt
            ).toLocaleDateString()}
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:border-[#16A34A] hover:text-[#16A34A]"
          aria-label={`View ${order.orderNumber}`}
        >
          <ChevronRight size={17} />
        </Link>
      </div>
    </div>
  );
}