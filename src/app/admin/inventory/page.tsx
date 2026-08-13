"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

type InventoryProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  image: string | null;
  badge: string | null;
  featured: boolean;
  isActive: boolean;
  updatedAt: string;
};

type InventoryStatus =
  | "ALL"
  | "HEALTHY"
  | "LOW_STOCK"
  | "OUT_OF_STOCK";

const statusOptions: {
  value: InventoryStatus;
  label: string;
}[] = [
  { value: "ALL", label: "All inventory" },
  { value: "HEALTHY", label: "Healthy stock" },
  { value: "LOW_STOCK", label: "Low stock" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
];

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<InventoryStatus>("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadInventory() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      params.set("status", status);

      const response = await fetch(
        `/api/admin/inventory?${params.toString()}`,
        { cache: "no-store" }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load inventory."
        );
      }

      setProducts(data.products ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadInventory();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, status]);

  const metrics = useMemo(() => {
    const healthy = products.filter(
      (product) => product.stock > 5
    ).length;

    const low = products.filter(
      (product) =>
        product.stock > 0 && product.stock <= 5
    ).length;

    const out = products.filter(
      (product) => product.stock <= 0
    ).length;

    const totalUnits = products.reduce(
      (sum, product) => sum + product.stock,
      0
    );

    return { healthy, low, out, totalUnits };
  }, [products]);

  async function updateStock(
    productId: string,
    mode: "SET" | "ADJUST",
    value: number
  ) {
    try {
      setSavingId(productId);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/inventory",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            mode,
            value,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update stock."
        );
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                stock: data.product.stock,
                updatedAt: data.product.updatedAt,
              }
            : product
        )
      );

      setSuccess(
        `${data.product.name} inventory updated.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update stock."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-7">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#16A34A]"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#16A34A]">
                Basketly Operations
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">
                Inventory
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Monitor stock levels and make fast inventory adjustments without leaving the catalog workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={loadInventory}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#16A34A] hover:text-[#16A34A] disabled:opacity-50"
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

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-6">
          <Link
            href="/admin"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Overview
          </Link>

          <Link
            href="/admin/orders"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Orders
          </Link>

          <Link
            href="/admin/products"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Products
          </Link>

          <Link
            href="/admin/inventory"
            className="whitespace-nowrap border-b-2 border-[#16A34A] px-4 py-4 text-sm font-semibold text-[#16A34A]"
          >
            Inventory
          </Link>

          <Link
            href="/admin/products/import"
            className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Import catalog
          </Link>

          <Link
            href="/shop"
            className="ml-auto whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-500 hover:text-[#16A34A]"
          >
            View store
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
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

        {success && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            <span className="flex items-center gap-2">
              <Check size={17} />
              {success}
            </span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded-lg p-1 hover:bg-green-100"
              aria-label="Dismiss success message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Visible products"
            value={products.length}
            icon={<Package size={19} />}
          />

          <MetricCard
            label="Healthy stock"
            value={metrics.healthy}
            icon={<Check size={19} />}
          />

          <MetricCard
            label="Low stock"
            value={metrics.low}
            icon={<AlertTriangle size={19} />}
          />

          <MetricCard
            label="Units on hand"
            value={metrics.totalUnits}
            icon={<Package size={19} />}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
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
                placeholder="Search products or SKU..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as InventoryStatus
                )
              }
              className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#16A34A]"
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
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Inventory workspace
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Adjust stock directly from the table.
                </p>
              </div>

              <p className="text-sm font-semibold text-red-600">
                {metrics.out} out of stock
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-[#16A34A]"
              />
              <p className="mt-4 text-sm text-gray-500">
                Loading inventory...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Package
                size={42}
                className="mx-auto text-gray-300"
              />
              <h2 className="mt-4 text-xl font-bold">
                No inventory found
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Try another search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <InventoryRow
                      key={product.id}
                      product={product}
                      saving={savingId === product.id}
                      onAdjust={(amount) =>
                        updateStock(
                          product.id,
                          "ADJUST",
                          amount
                        )
                      }
                      onSet={(value) =>
                        updateStock(
                          product.id,
                          "SET",
                          value
                        )
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#16A34A]">
        {icon}
      </div>
      <p className="mt-5 text-sm font-medium text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function InventoryRow({
  product,
  saving,
  onAdjust,
  onSet,
}: {
  product: InventoryProduct;
  saving: boolean;
  onAdjust: (amount: number) => void;
  onSet: (value: number) => void;
}) {
  const [draft, setDraft] = useState(
    String(product.stock)
  );

  useEffect(() => {
    setDraft(String(product.stock));
  }, [product.stock]);

  const stockState =
    product.stock <= 0
      ? {
          label: "Out of stock",
          className:
            "border-red-200 bg-red-50 text-red-700",
        }
      : product.stock <= 5
        ? {
            label: "Low stock",
            className:
              "border-amber-200 bg-amber-50 text-amber-700",
          }
        : {
            label: "Healthy",
            className:
              "border-emerald-200 bg-emerald-50 text-emerald-700",
          };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl">
                🛍️
              </div>
            )}
          </div>

          <div className="min-w-[220px]">
            <p className="font-semibold text-gray-900">
              {product.name}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {product.unit} · ${product.price.toFixed(2)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-gray-500">
        {product.category}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdjust(-1)}
            disabled={saving || product.stock <= 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Decrease ${product.name} stock`}
          >
            <ArrowDown size={16} />
          </button>

          <input
            type="number"
            min="0"
            step="1"
            value={draft}
            disabled={saving}
            onChange={(event) =>
              setDraft(event.target.value)
            }
            onBlur={() => {
              const next = Number(draft);

              if (
                Number.isInteger(next) &&
                next >= 0 &&
                next !== product.stock
              ) {
                onSet(next);
              }
            }}
            className="w-20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
            aria-label={`${product.name} stock`}
          />

          <button
            type="button"
            onClick={() => onAdjust(1)}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#16A34A] hover:text-[#16A34A] disabled:opacity-40"
            aria-label={`Increase ${product.name} stock`}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${stockState.className}`}
        >
          {stockState.label}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#16A34A] hover:text-[#16A34A]"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
