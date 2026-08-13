"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  lifetimeSpend: number;
  averageOrderValue: number;
  lastOrderAt: string | null;
  lastOrderNumber: string | null;
  orders: OrderSummary[];
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/admin/customers?${params.toString()}`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load customers.");

      setCustomers(data.customers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadCustomers, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const metrics = useMemo(() => {
    const returning = customers.filter((customer) => customer.totalOrders > 1).length;
    const revenue = customers.reduce((sum, customer) => sum + customer.lifetimeSpend, 0);
    const averageCustomerValue = customers.length ? revenue / customers.length : 0;

    return {
      total: customers.length,
      returning,
      revenue,
      averageCustomerValue,
    };
  }, [customers]);

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-7">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#16A34A]">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#16A34A]">Basketly CRM</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">Customers</h1>
              <p className="mt-1 text-sm text-gray-500">Understand customer value, order history and buying activity.</p>
            </div>

            <button type="button" onClick={loadCustomers} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-[#16A34A] hover:text-[#16A34A] disabled:opacity-50">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-6">
          <Link href="/admin" className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Overview</Link>
          <Link href="/admin/orders" className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Orders</Link>
          <Link href="/admin/products" className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Products</Link>
          <Link href="/admin/inventory" className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Inventory</Link>
          <Link href="/admin/customers" className="border-b-2 border-[#16A34A] px-4 py-4 text-sm font-semibold text-[#16A34A]">Customers</Link>
          <Link href="/admin/products/import" className="ml-2 px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Import catalog</Link>
          <Link href="/shop" className="ml-auto px-4 py-4 text-sm font-semibold text-gray-500 hover:text-[#16A34A]">View store</Link>
        </div>
      </nav>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Customers" value={metrics.total} icon={<Users size={19} />} />
          <MetricCard label="Returning customers" value={metrics.returning} icon={<RefreshCw size={19} />} />
          <MetricCard label="Customer revenue" value={`$${metrics.revenue.toFixed(2)}`} icon={<ShoppingBag size={19} />} />
          <MetricCard label="Avg. customer value" value={`$${metrics.averageCustomerValue.toFixed(2)}`} icon={<Users size={19} />} />
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email or phone..." className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100" />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold">Customer directory</h2>
            <p className="mt-1 text-sm text-gray-500">Click a customer to view their complete order history.</p>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw size={30} className="mx-auto animate-spin text-[#16A34A]" />
              <p className="mt-4 text-sm text-gray-500">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Users size={42} className="mx-auto text-gray-300" />
              <h2 className="mt-4 text-xl font-bold">No customers found</h2>
              <p className="mt-2 text-sm text-gray-500">Try another search term.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <button key={customer.id} type="button" onClick={() => setSelectedCustomer(customer)} className="flex w-full flex-col gap-4 px-6 py-5 text-left transition hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 font-bold text-[#16A34A]">
                      {customer.firstName.charAt(0).toUpperCase()}{customer.lastName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">{customer.firstName} {customer.lastName}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span>{customer.email}</span>
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8 lg:justify-end">
                    <CustomerStat label="Orders" value={String(customer.totalOrders)} />
                    <CustomerStat label="Lifetime spend" value={`$${customer.lifetimeSpend.toFixed(2)}`} />
                    <CustomerStat label="Last order" value={customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString() : "Never"} />
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close customer details" onClick={() => setSelectedCustomer(null)} className="absolute inset-0 bg-black/40" />

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Customer profile</p>
                <h2 className="mt-1 text-2xl font-bold">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-3xl bg-gray-50 p-5">
                <div className="flex items-center gap-3"><Mail size={18} className="text-[#16A34A]" /><span className="text-sm text-gray-700">{selectedCustomer.email}</span></div>
                <div className="mt-3 flex items-center gap-3"><Phone size={18} className="text-[#16A34A]" /><span className="text-sm text-gray-700">{selectedCustomer.phone}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailCard label="Orders" value={selectedCustomer.totalOrders} />
                <DetailCard label="Lifetime spend" value={`$${selectedCustomer.lifetimeSpend.toFixed(2)}`} />
                <DetailCard label="Average order" value={`$${selectedCustomer.averageOrderValue.toFixed(2)}`} />
                <DetailCard label="Last order" value={selectedCustomer.lastOrderAt ? new Date(selectedCustomer.lastOrderAt).toLocaleDateString() : "Never"} />
              </div>

              <div>
                <h3 className="text-lg font-bold">Order history</h3>
                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
                  {selectedCustomer.orders.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">No orders yet.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {selectedCustomer.orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between gap-4 px-4 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                            <p className="mt-1 text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#16A34A]">${order.total.toFixed(2)}</p>
                            <p className="mt-1 text-xs font-semibold text-gray-500">{order.status.replaceAll("_", " ")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#16A34A]">{icon}</div>
      <p className="mt-5 text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function CustomerStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
