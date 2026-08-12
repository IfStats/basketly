"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Package,
  RefreshCw,
  Search,
  Check,
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
  delivery?: {
    status: string;
  } | null;
};

const statusOptions: {
  label: string;
  value: "ALL" | OrderStatus;
}[] = [
  { label: "All orders", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready for pickup", value: "READY_FOR_PICKUP" },
  { label: "Out for delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<"ALL" | OrderStatus>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load orders.");
      }

      const data = await response.json();

      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName =
        `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase();

      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        customerName.includes(query) ||
        order.customer.email
          ?.toLowerCase()
          .includes(query) ||
        order.customer.phone
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "ALL" || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ) {
    const previousOrders = [...orders];

    setError("");

    // Optimistic UI update
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update order status."
        );
      }

      // Replace optimistic order with database response
      if (data.order) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === orderId ? data.order : order
          )
        );
      }
    } catch (err) {
      console.error("Update order status error:", err);

      // Restore previous state
      setOrders(previousOrders);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#16A34A]"
              >
                <ArrowLeft size={16} />
                Back to dashboard
              </Link>

              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-[#16A34A]">
                Basketly Admin
              </p>

              <h1 className="mt-1 text-3xl font-bold text-[#1F2937]">
                Orders
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer orders and delivery progress.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#16A34A] hover:text-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
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
            className="border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-900"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="border-b-2 border-[#16A34A] px-4 py-4 text-sm font-semibold text-[#16A34A]"
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

        {/* Filters */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order number, customer, email or phone..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "ALL"
                    | OrderStatus
                )
              }
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-[#16A34A]"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {orders.length}
            </span>{" "}
            orders
          </div>
        </div>

        {/* Orders */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-[#16A34A]"
              />

              <p className="mt-4 text-sm text-gray-500">
                Loading orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Package
                size={42}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 text-xl font-bold text-[#1F2937]">
                No orders found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function OrderRow({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (
    orderId: string,
    status: OrderStatus
  ) => Promise<void>;
}) {
  const customerName =
    `${order.customer.firstName} ${order.customer.lastName}`;

  const itemCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const date = new Date(
    order.createdAt
  ).toLocaleString();

  const isLocked =
    order.status === "DELIVERED" ||
    order.status === "CANCELLED";

  return (
    <div className="px-6 py-6 transition hover:bg-gray-50">
      <div className="flex flex-col gap-6">
        {/* Main Order Information */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
              <Package size={21} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-bold text-[#1F2937]">
                  {order.orderNumber}
                </h2>

                <StatusBadge status={order.status} />
              </div>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {customerName}
              </p>

              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                {order.customer.email && (
                  <span>{order.customer.email}</span>
                )}

                {order.customer.phone && (
                  <span>{order.customer.phone}</span>
                )}

                <span>{date}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="text-xs text-gray-400">
                Items
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {itemCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Total
              </p>

              <p className="mt-1 text-lg font-bold text-[#16A34A]">
                ${order.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
            Order items
          </p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-3"
              >
                <span className="truncate text-sm font-medium text-gray-700">
                  {item.name}
                </span>

                <span className="ml-3 shrink-0 text-xs font-bold text-gray-500">
                  × {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Management */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Order status
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {isLocked
                ? "This order can no longer be changed."
                : "Update the order status from the admin panel."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={order.status}
              disabled={isLocked}
              onChange={(event) =>
                onStatusChange(
                  order.id,
                  event.target.value as OrderStatus
                )
              }
              className="min-w-[210px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              {statusOptions
                .filter(
                  (option) => option.value !== "ALL"
                )
                .map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
            </select>

            {!isLocked && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#16A34A]">
                <Check size={18} />
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information */}
        {order.delivery && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Delivery status
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-700">
                  {formatDeliveryStatus(
                    order.delivery.status
                  )}
                </p>
              </div>

              <div className="rounded-full bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">
                Automatically synchronized
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles: Record<OrderStatus, string> = {
    PENDING:
      "bg-yellow-50 text-yellow-700 border-yellow-200",
    CONFIRMED:
      "bg-blue-50 text-blue-700 border-blue-200",
    PREPARING:
      "bg-orange-50 text-orange-700 border-orange-200",
    READY_FOR_PICKUP:
      "bg-purple-50 text-purple-700 border-purple-200",
    OUT_FOR_DELIVERY:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
    DELIVERED:
      "bg-green-50 text-green-700 border-green-200",
    CANCELLED:
      "bg-red-50 text-red-700 border-red-200",
  };

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
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function formatDeliveryStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}