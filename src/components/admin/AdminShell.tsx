"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FolderTree,
  Gauge,
  Gift,
  Import,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

type AdminShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: <Gauge size={18} />,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: <ShoppingBag size={18} />,
      },
      {
        label: "Promotions",
        href: "/admin/promotions",
        icon: <Gift size={18} />,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: <Package size={18} />,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: <FolderTree size={18} />,
      },
      {
        label: "Inventory",
        href: "/admin/inventory",
        icon: <Boxes size={18} />,
      },
      {
        label: "Import catalog",
        href: "/admin/products/import",
        icon: <Import size={18} />,
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        label: "Customers",
        href: "/admin/customers",
        icon: <Users size={18} />,
      },
    ],
  },

  {
  label: "Markets",
  items: [
    {
      label: "Markets & pricing",
      href: "/admin/markets",
      icon: (
        <CircleDollarSign
          size={18}
        />
      ),
    },
  ],
},
];

function isActivePath(
  pathname: string,
  href: string
) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  if (
    href === "/admin/products"
  ) {
    return (
      pathname === "/admin/products" ||
      pathname.startsWith(
        "/admin/products/"
      )
    );
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function AdminShell({
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  if (pathname === "/admin/login") {
    return children;
  }

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await fetch("/api/admin/logout", {
        method: "POST",
      });

      window.location.href =
        "/admin/login";
    } catch (error) {
      console.error(
        "Admin logout failed:",
        error
      );

      setLoggingOut(false);
    }
  }

  const sidebarWidth = collapsed
    ? "lg:w-[88px]"
    : "lg:w-[270px]";

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <Link
          href="/admin"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-white">
            <ShoppingBag size={20} />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900">
              Basketly
            </p>

            <p className="text-xs text-gray-500">
              Administration
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600"
          aria-label="Open admin navigation"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col border-r border-gray-200
          bg-white transition-all duration-200
          ${sidebarWidth}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-5">
          <Link
            href="/admin"
            onClick={() =>
              setMobileOpen(false)
            }
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#16A34A] text-white shadow-sm">
              <ShoppingBag size={21} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900">
                  Basketly
                </p>

                <p className="truncate text-xs text-gray-500">
                  Administration
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div
              key={group.label}
              className="mb-6"
            >
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                  {group.label}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map(
                  (item) => {
                    const active =
                      isActivePath(
                        pathname,
                        item.href
                      );

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={
                          collapsed
                            ? item.label
                            : undefined
                        }
                        onClick={() =>
                          setMobileOpen(
                            false
                          )
                        }
                        className={`
                          flex items-center gap-3
                          rounded-xl px-3 py-3
                          text-sm font-semibold
                          transition
                          ${
                            active
                              ? "bg-green-50 text-[#15803D]"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        <span
                          className={
                            active
                              ? "text-[#16A34A]"
                              : "text-gray-400"
                          }
                        >
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <span className="truncate">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  }
                )}
              </div>
            </div>
          ))}

          <div className="mb-6">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                Coming next
              </p>
            )}

            <div className="space-y-1">

              <DisabledItem
                collapsed={collapsed}
                icon={
                  <Settings size={18} />
                }
                label="Settings"
              />
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-100 p-3">
          <Link
            href="/shop"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-[#16A34A]"
          >
            <Store
              size={18}
              className="text-gray-400"
            />

            {!collapsed && (
              <span>View store</span>
            )}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut
              size={18}
              className="text-gray-400"
            />

            {!collapsed && (
              <span>
                {loggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (current) => !current
            )
          }
          className="absolute -right-4 top-28 hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:text-[#16A34A] lg:flex"
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </aside>

      {/* Content */}
      <div
        className={`
          min-h-screen transition-all duration-200
          ${
            collapsed
              ? "lg:pl-[88px]"
              : "lg:pl-[270px]"
          }
        `}
      >
        {children}
      </div>
    </div>
  );
}

function DisabledItem({
  icon,
  label,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  return (
    <div
      title={
        collapsed ? label : undefined
      }
      className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-300"
    >
      <span>{icon}</span>

      {!collapsed && (
        <span>{label}</span>
      )}
    </div>
  );
}