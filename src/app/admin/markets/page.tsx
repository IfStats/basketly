"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Globe2,
  RefreshCw,
  Truck,
  X,
} from "lucide-react";

type Market = {
  id: string;
  code: string;
  name: string;
  currency: string;
  locale: string;
  callingCode: string | null;
  flag: string | null;
  isActive: boolean;
  isDefault: boolean;
  deliveryEnabled: boolean;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number | null;
  createdAt: string;
  updatedAt: string;
};

type MarketForm = {
  name: string;
  currency: string;
  locale: string;
  callingCode: string;
  flag: string;
  isActive: boolean;
  isDefault: boolean;
  deliveryEnabled: boolean;
  baseDeliveryFee: string;
  freeDeliveryThreshold: string;
};

export default function AdminMarketsPage() {
  const router = useRouter();

  const [markets, setMarkets] =
    useState<Market[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editing, setEditing] =
    useState<Market | null>(null);

  const [form, setForm] =
    useState<MarketForm | null>(null);

  async function loadMarkets(
    showLoading = true
  ) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/admin/markets",
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load markets."
        );
      }

      setMarkets(data.markets ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load markets."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const response = await fetch(
          "/api/admin/markets",
          {
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          router.replace(
            "/admin/login"
          );
          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load markets."
          );
        }

        if (!cancelled) {
          setMarkets(
            data.markets ?? []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load markets."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function openEdit(
    market: Market
  ) {
    setEditing(market);

    setForm({
      name: market.name,
      currency: market.currency,
      locale: market.locale,
      callingCode:
        market.callingCode ?? "",
      flag: market.flag ?? "",
      isActive: market.isActive,
      isDefault:
        market.isDefault,
      deliveryEnabled:
        market.deliveryEnabled,
      baseDeliveryFee: String(
        market.baseDeliveryFee
      ),
      freeDeliveryThreshold:
        market.freeDeliveryThreshold ===
        null
          ? ""
          : String(
              market.freeDeliveryThreshold
            ),
    });

    setError("");
    setSuccess("");
  }

  function closeEdit() {
    if (saving) {
      return;
    }

    setEditing(null);
    setForm(null);
  }

  function updateForm<
    K extends keyof MarketForm,
  >(
    key: K,
    value: MarketForm[K]
  ) {
    setForm((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current
    );
  }

  async function saveMarket(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !editing ||
      !form ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const baseDeliveryFee =
        Number(
          form.baseDeliveryFee
        );

      const threshold =
        form.freeDeliveryThreshold.trim()
          ? Number(
              form.freeDeliveryThreshold
            )
          : null;

      const response = await fetch(
        "/api/admin/markets",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: editing.id,
            name: form.name.trim(),
            currency:
              form.currency
                .trim()
                .toUpperCase(),
            locale:
              form.locale.trim(),
            callingCode:
              form.callingCode.trim() ||
              null,
            flag:
              form.flag.trim() ||
              null,
            isActive:
              form.isActive,
            isDefault:
              form.isDefault,
            deliveryEnabled:
              form.deliveryEnabled,
            baseDeliveryFee,
            freeDeliveryThreshold:
              threshold,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        router.replace(
          "/admin/login"
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update market."
        );
      }

      await loadMarkets(false);

      setSuccess(
        `${data.market.name} market updated.`
      );

      closeEdit();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update market."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#16A34A]">
                Basketly Commerce
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Markets & Pricing
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Control countries,
                currencies and delivery
                rules available to Basketly
                customers.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadMarkets()
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-[#16A34A] hover:text-[#16A34A] disabled:opacity-50"
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
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Globe2 size={21} />}
            label="Markets"
            value={markets.length}
          />

          <MetricCard
            icon={
              <CheckCircle2
                size={21}
              />
            }
            label="Active markets"
            value={
              markets.filter(
                (market) =>
                  market.isActive
              ).length
            }
          />

          <MetricCard
            icon={
              <CircleDollarSign
                size={21}
              />
            }
            label="Currencies"
            value={
              new Set(
                markets.map(
                  (market) =>
                    market.currency
                )
              ).size
            }
          />

          <MetricCard
            icon={<Truck size={21} />}
            label="Delivery enabled"
            value={
              markets.filter(
                (market) =>
                  market
                    .deliveryEnabled
              ).length
            }
          />
        </div>

        <div className="mt-7 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">
              Basketly markets
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Only active markets can
              eventually accept customer
              orders.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-[#16A34A]"
              />

              <p className="mt-4 text-sm text-gray-500">
                Loading markets...
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {markets.map(
                (market) => (
                  <div
                    key={market.id}
                    className="flex flex-col gap-6 px-6 py-6 xl:flex-row xl:items-center xl:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-3xl">
                        {market.flag ||
                          "🌍"}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {
                              market.name
                            }
                          </h3>

                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                            {
                              market.code
                            }
                          </span>

                          {market.isDefault && (
                            <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              Default
                            </span>
                          )}

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${
                              market.isActive
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-100 text-gray-500"
                            }`}
                          >
                            {market.isActive
                              ? "Active"
                              : "Disabled"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                          <span>
                            Currency:{" "}
                            <strong className="text-gray-700">
                              {
                                market.currency
                              }
                            </strong>
                          </span>

                          <span>
                            Locale:{" "}
                            {
                              market.locale
                            }
                          </span>

                          {market.callingCode && (
                            <span>
                              Phone:{" "}
                              {
                                market.callingCode
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-gray-50 px-4 py-3">
                          <p className="text-xs text-gray-400">
                            Delivery
                          </p>

                          <p className="mt-1 font-bold text-gray-900">
                            {market.deliveryEnabled
                              ? `${market.currency} ${market.baseDeliveryFee.toFixed(
                                  2
                                )}`
                              : "Disabled"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 px-4 py-3">
                          <p className="text-xs text-gray-400">
                            Free from
                          </p>

                          <p className="mt-1 font-bold text-gray-900">
                            {market.freeDeliveryThreshold ===
                            null
                              ? "—"
                              : `${market.currency} ${market.freeDeliveryThreshold.toFixed(
                                  2
                                )}`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            market
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-[#16A34A] hover:text-[#16A34A]"
                      >
                        <Edit3
                          size={16}
                        />
                        Edit
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {editing && form && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-8 max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                  {
                    editing.code
                  }{" "}
                  Market
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Edit{" "}
                  {
                    editing.name
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeEdit
                }
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                saveMarket
              }
              className="space-y-6 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Market name"
                  value={
                    form.name
                  }
                  onChange={(
                    value
                  ) =>
                    updateForm(
                      "name",
                      value
                    )
                  }
                />

                <Field
  label="Currency"
  value={form.currency}
  onChange={(value) =>
    updateForm(
      "currency",
      value.toUpperCase()
    )
  }
  maxLength={3}
  disabled={
    editing.code === "GH"
  }
  helperText={
    editing.code === "GH"
      ? "GHS is locked while Basketly uses a single Ghana product-price field."
      : "This market remains unavailable for customer orders until market-specific product pricing is implemented."
  }
/>

                <Field
                  label="Locale"
                  value={
                    form.locale
                  }
                  onChange={(
                    value
                  ) =>
                    updateForm(
                      "locale",
                      value
                    )
                  }
                />

                <Field
                  label="Calling code"
                  value={
                    form.callingCode
                  }
                  onChange={(
                    value
                  ) =>
                    updateForm(
                      "callingCode",
                      value
                    )
                  }
                />

                <Field
                  label="Flag"
                  value={
                    form.flag
                  }
                  onChange={(
                    value
                  ) =>
                    updateForm(
                      "flag",
                      value
                    )
                  }
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-900">
                  Delivery settings
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Base delivery fee"
                    value={
                      form.baseDeliveryFee
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "baseDeliveryFee",
                        value
                      )
                    }
                    type="number"
                    min="0"
                    step="0.01"
                  />

                  <Field
                    label="Free delivery threshold"
                    value={
                      form.freeDeliveryThreshold
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "freeDeliveryThreshold",
                        value
                      )
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Leave blank to disable"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Toggle
                  label="Market active"
                  checked={
                    form.isActive
                  }
                  onChange={(
                    checked
                  ) =>
                    updateForm(
                      "isActive",
                      checked
                    )
                  }
                  disabled={
                    form.isDefault
                  }
                />

                <Toggle
                  label="Default market"
                  checked={
                    form.isDefault
                  }
                  onChange={(
                    checked
                  ) =>
                    updateForm(
                      "isDefault",
                      checked
                    )
                  }
                />

                <Toggle
                  label="Delivery enabled"
                  checked={
                    form.deliveryEnabled
                  }
                  onChange={(
                    checked
                  ) =>
                    updateForm(
                      "deliveryEnabled",
                      checked
                    )
                  }
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeEdit
                  }
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
                    : "Save market"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#16A34A]">
        {icon}
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  step,
  maxLength,
  placeholder,
  disabled = false,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  min?: string;
  step?: string;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
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
  maxLength={maxLength}
  placeholder={placeholder}
  disabled={disabled}
  onChange={(event) =>
    onChange(
      event.target.value
    )
  }
  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
/>

{helperText && (
  <p className="mt-2 text-xs leading-5 text-gray-400">
    {helperText}
  </p>
)}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4 ${
        disabled
          ? "cursor-not-allowed bg-gray-50 opacity-60"
          : "cursor-pointer bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }
        className="h-4 w-4 accent-[#16A34A]"
      />

      <span className="text-sm font-semibold text-gray-700">
        {label}
      </span>
    </label>
  );
}