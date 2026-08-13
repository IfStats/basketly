"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";

type PromotionType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "FREE_DELIVERY";

type Promotion = {
  id: string;
  name: string;
  code: string;
  type: PromotionType;
  value: number;
  minimumOrder: number | null;
  maximumDiscount: number | null;
  startsAt: string;
  endsAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  targetSegment: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type PromotionStatus =
  | "ALL"
  | "ACTIVE"
  | "SCHEDULED"
  | "EXPIRED"
  | "INACTIVE";

type PromotionForm = {
  name: string;
  code: string;
  type: PromotionType;
  value: string;
  minimumOrder: string;
  maximumDiscount: string;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
  targetSegment: string;
  active: boolean;
};

const emptyForm: PromotionForm = {
  name: "",
  code: "",
  type: "PERCENTAGE",
  value: "",
  minimumOrder: "",
  maximumDiscount: "",
  startsAt: "",
  endsAt: "",
  usageLimit: "",
  targetSegment: "ALL",
  active: true,
};

const segmentOptions = [
  { value: "ALL", label: "All customers" },
  { value: "NEW", label: "New customers" },
  { value: "RETURNING", label: "Returning customers" },
  { value: "VIP", label: "VIP customers" },
  { value: "AT_RISK", label: "At-risk customers" },
  { value: "INACTIVE", label: "Inactive customers" },
];

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<PromotionStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);
  const [form, setForm] =
    useState<PromotionForm>(emptyForm);

  async function loadPromotions() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      params.set("status", status);

      const response = await fetch(
        `/api/admin/promotions?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load promotions."
        );
      }

      setPromotions(data.promotions ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load promotions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPromotions();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, status]);

  function updateForm<K extends keyof PromotionForm>(
    key: K,
    value: PromotionForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(promotion: Promotion) {
    setEditingId(promotion.id);

    setForm({
      name: promotion.name,
      code: promotion.code,
      type: promotion.type,
      value: String(promotion.value),
      minimumOrder:
        promotion.minimumOrder !== null
          ? String(promotion.minimumOrder)
          : "",
      maximumDiscount:
        promotion.maximumDiscount !== null
          ? String(promotion.maximumDiscount)
          : "",
      startsAt: toDateTimeLocal(
        promotion.startsAt
      ),
      endsAt: promotion.endsAt
        ? toDateTimeLocal(promotion.endsAt)
        : "",
      usageLimit:
        promotion.usageLimit !== null
          ? String(promotion.usageLimit)
          : "",
      targetSegment:
        promotion.targetSegment || "ALL",
      active: promotion.active,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function savePromotion(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minimumOrder:
          form.minimumOrder.trim()
            ? Number(form.minimumOrder)
            : null,
        maximumDiscount:
          form.maximumDiscount.trim()
            ? Number(form.maximumDiscount)
            : null,
        startsAt: form.startsAt,
        endsAt: form.endsAt || null,
        usageLimit:
          form.usageLimit.trim()
            ? Number(form.usageLimit)
            : null,
        targetSegment:
          form.targetSegment === "ALL"
            ? null
            : form.targetSegment,
        active: form.active,
      };

      const response = await fetch(
        "/api/admin/promotions",
        {
          method: editingId
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save promotion."
        );
      }

      if (editingId) {
        setPromotions((current) =>
          current.map((promotion) =>
            promotion.id === editingId
              ? data.promotion
              : promotion
          )
        );

        setSuccess(
          "Promotion updated successfully."
        );
      } else {
        setPromotions((current) => [
          data.promotion,
          ...current,
        ]);

        setSuccess(
          "Promotion created successfully."
        );
      }

      closeForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save promotion."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePromotion(
    promotion: Promotion
  ) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/promotions",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: promotion.id,
            active: !promotion.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update promotion."
        );
      }

      setPromotions((current) =>
        current.map((item) =>
          item.id === promotion.id
            ? data.promotion
            : item
        )
      );

      setSuccess(
        promotion.active
          ? "Promotion deactivated."
          : "Promotion activated."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update promotion."
      );
    }
  }

  async function deletePromotion(
    promotion: Promotion
  ) {
    const confirmed =
      window.confirm(
        `Delete promotion ${promotion.code}?`
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/promotions",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: promotion.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete promotion."
        );
      }

      setPromotions((current) =>
        current.filter(
          (item) =>
            item.id !== promotion.id
        )
      );

      setSuccess(
        "Promotion deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete promotion."
      );
    }
  }

  const summary = useMemo(() => {
    const now = Date.now();

    const active = promotions.filter(
      (promotion) =>
        promotion.active &&
        new Date(
          promotion.startsAt
        ).getTime() <= now &&
        (!promotion.endsAt ||
          new Date(
            promotion.endsAt
          ).getTime() >= now) &&
        (!promotion.usageLimit ||
          promotion.usageCount <
            promotion.usageLimit)
    ).length;

    const scheduled = promotions.filter(
      (promotion) =>
        promotion.active &&
        new Date(
          promotion.startsAt
        ).getTime() > now
    ).length;

    const expired = promotions.filter(
      (promotion) =>
        Boolean(
          promotion.endsAt &&
            new Date(
              promotion.endsAt
            ).getTime() < now
        ) ||
        Boolean(
          promotion.usageLimit &&
            promotion.usageCount >=
              promotion.usageLimit
        )
    ).length;

    return {
      total: promotions.length,
      active,
      scheduled,
      expired,
    };
  }, [promotions]);

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#16A34A]"
              >
                ← Back to dashboard
              </Link>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-[#16A34A]">
                Basketly Growth
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Promotions
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create targeted offers and manage your discount strategy.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadPromotions}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-[#16A34A] hover:text-[#16A34A] disabled:opacity-50"
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
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-bold text-white hover:bg-[#15803D]"
              >
                <Plus size={17} />
                Create promotion
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-6">
          <Link
            href="/admin"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Overview
          </Link>

          <Link
            href="/admin/orders"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Orders
          </Link>

          <Link
            href="/admin/products"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Products
          </Link>

          <Link
            href="/admin/inventory"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Inventory
          </Link>

          <Link
            href="/admin/customers"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Customers
          </Link>

          <Link
            href="/admin/promotions"
            className="border-b-2 border-[#16A34A] px-4 py-4 text-sm font-semibold text-[#16A34A]"
          >
            Promotions
          </Link>

          <Link
            href="/admin/products/import"
            className="ml-2 px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Import catalog
          </Link>

          <Link
            href="/shop"
            className="ml-auto px-4 py-4 text-sm font-semibold text-gray-500 hover:text-[#16A34A]"
          >
            View store
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            <Check size={17} />
            {success}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="All promotions"
            value={summary.total}
            icon={<Tag size={19} />}
          />

          <SummaryCard
            label="Active"
            value={summary.active}
            icon={<Check size={19} />}
          />

          <SummaryCard
            label="Scheduled"
            value={summary.scheduled}
            icon={
              <CalendarClock size={19} />
            }
          />

          <SummaryCard
            label="Expired"
            value={summary.expired}
            icon={<X size={19} />}
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
                placeholder="Search promotion name or code..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as PromotionStatus
                )
              }
              className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm font-semibold outline-none focus:border-[#16A34A]"
            >
              <option value="ALL">
                All promotions
              </option>
              <option value="ACTIVE">
                Active
              </option>
              <option value="SCHEDULED">
                Scheduled
              </option>
              <option value="EXPIRED">
                Expired
              </option>
              <option value="INACTIVE">
                Inactive
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-[#16A34A]"
              />

              <p className="mt-4 text-sm text-gray-500">
                Loading promotions...
              </p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Tag
                size={42}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 text-xl font-bold">
                No promotions found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your first promotion to start driving sales.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {promotions.map((promotion) => (
                <PromotionRow
                  key={promotion.id}
                  promotion={promotion}
                  onEdit={openEdit}
                  onToggle={togglePromotion}
                  onDelete={deletePromotion}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-8 max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                  Basketly Growth
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {editingId
                    ? "Edit promotion"
                    : "Create promotion"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={savePromotion}
              className="space-y-6 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Promotion name"
                  value={form.name}
                  onChange={(value) =>
                    updateForm("name", value)
                  }
                  placeholder="Summer savings"
                  required
                />

                <Field
                  label="Promotion code"
                  value={form.code}
                  onChange={(value) =>
                    updateForm(
                      "code",
                      value.toUpperCase()
                    )
                  }
                  placeholder="SUMMER20"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Promotion type"
                  value={form.type}
                  onChange={(value) =>
                    updateForm(
                      "type",
                      value as PromotionType
                    )
                  }
                  options={[
                    {
                      value: "PERCENTAGE",
                      label: "Percentage discount",
                    },
                    {
                      value: "FIXED_AMOUNT",
                      label: "Fixed amount",
                    },
                    {
                      value: "FREE_DELIVERY",
                      label: "Free delivery",
                    },
                  ]}
                />

                <Field
                  label={
                    form.type === "PERCENTAGE"
                      ? "Discount percentage"
                      : "Discount value"
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.type === "FREE_DELIVERY"
                      ? "0"
                      : form.value
                  }
                  disabled={
                    form.type === "FREE_DELIVERY"
                  }
                  onChange={(value) =>
                    updateForm(
                      "value",
                      value
                    )
                  }
                  placeholder="20"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Minimum order"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minimumOrder}
                  onChange={(value) =>
                    updateForm(
                      "minimumOrder",
                      value
                    )
                  }
                  placeholder="30.00"
                />

                <Field
                  label="Maximum discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.maximumDiscount
                  }
                  onChange={(value) =>
                    updateForm(
                      "maximumDiscount",
                      value
                    )
                  }
                  placeholder="50.00"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Starts"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(value) =>
                    updateForm(
                      "startsAt",
                      value
                    )
                  }
                  required
                />

                <Field
                  label="Ends"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(value) =>
                    updateForm(
                      "endsAt",
                      value
                    )
                  }
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Usage limit"
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={(value) =>
                    updateForm(
                      "usageLimit",
                      value
                    )
                  }
                  placeholder="500"
                />

                <SelectField
                  label="Customer segment"
                  value={
                    form.targetSegment
                  }
                  onChange={(value) =>
                    updateForm(
                      "targetSegment",
                      value
                    )
                  }
                  options={segmentOptions}
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    updateForm(
                      "active",
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#16A34A]"
                />

                <span>
                  <span className="block text-sm font-bold">
                    Active promotion
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Customers can use this promotion when it is within its valid date window.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#16A34A] px-7 py-3 text-sm font-bold text-white hover:bg-[#15803D] disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create promotion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
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

function PromotionRow({
  promotion,
  onEdit,
  onToggle,
  onDelete,
}: {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onToggle: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}) {
  const now = Date.now();

  const isScheduled =
    promotion.active &&
    new Date(
      promotion.startsAt
    ).getTime() > now;

  const isExpired =
    Boolean(
      promotion.endsAt &&
        new Date(
          promotion.endsAt
        ).getTime() < now
    ) ||
    Boolean(
      promotion.usageLimit &&
        promotion.usageCount >=
          promotion.usageLimit
    );

  const isCurrentlyActive =
    promotion.active &&
    !isScheduled &&
    !isExpired;

  return (
    <div className="px-6 py-6 hover:bg-gray-50">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
            <Tag size={21} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-bold text-gray-900">
                {promotion.name}
              </h2>

              <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold tracking-wider text-gray-700">
                {promotion.code}
              </span>

              {isCurrentlyActive && (
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  Active
                </span>
              )}

              {isScheduled && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Scheduled
                </span>
              )}

              {isExpired && (
                <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  Expired
                </span>
              )}

              {!promotion.active &&
                !isExpired && (
                  <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                    Inactive
                  </span>
                )}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
              <span>
                {formatPromotionValue(
                  promotion
                )}
              </span>

              {promotion.minimumOrder !==
                null && (
                <span>
                  Minimum $
                  {promotion.minimumOrder.toFixed(
                    2
                  )}
                </span>
              )}

              <span>
                {formatSegment(
                  promotion.targetSegment
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Usage
            </p>

            <p className="mt-1 text-sm font-bold text-gray-800">
              {promotion.usageCount}
              {promotion.usageLimit
                ? ` / ${promotion.usageLimit}`
                : ""}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Ends
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-700">
              {promotion.endsAt
                ? new Date(
                    promotion.endsAt
                  ).toLocaleDateString()
                : "No end date"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onEdit(promotion)}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:border-[#16A34A] hover:text-[#16A34A]"
            title="Edit promotion"
          >
            <Edit3 size={17} />
          </button>

          <button
            type="button"
            onClick={() =>
              onToggle(promotion)
            }
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
              promotion.active
                ? "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:text-red-600"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {promotion.active
              ? "Deactivate"
              : "Activate"}
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(promotion)
            }
            className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
            title="Delete promotion"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  step?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        min={min}
        step={step}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatPromotionValue(
  promotion: Promotion
) {
  if (
    promotion.type ===
    "FREE_DELIVERY"
  ) {
    return "Free delivery";
  }

  if (
    promotion.type ===
    "PERCENTAGE"
  ) {
    return `${promotion.value}% off`;
  }

  return `$${promotion.value.toFixed(
    2
  )} off`;
}

function formatSegment(
  segment: string | null
) {
  if (!segment) {
    return "All customers";
  }

  return segment
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function toDateTimeLocal(
  value: string
) {
  const date = new Date(value);

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}