"use client";

import Link from "next/link";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { useCountry } from "@/context/CountryContext";
import { formatCurrency } from "@/lib/currency";
import type { CountryCode } from "@/config/countries";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
};

export default function ShopPage({
  initialCategory = "",
}: {
  initialCategory?: string;
   
  
}) {

  const { country } = useCountry();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
 const [category, setCategory] =
  useState(initialCategory);

  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] =
    useState(false);

  useEffect(() => {
    async function loadShopData() {
      try {
        setLoading(true);

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch("/api/products", {
            cache: "no-store",
          }),
          fetch("/api/categories", {
            cache: "no-store",
          }),
        ]);

        if (!productsResponse.ok) {
          throw new Error(
            "Failed to load products."
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            "Failed to load categories."
          );
        }

        const productsData =
          await productsResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        setProducts(
          productsData.products ?? []
        );

        setCategories(
          categoriesData.categories ?? []
        );
      } catch (error) {
        console.error(
          "Load shop data error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadShopData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query =
      search.trim().toLowerCase();

    if (query) {
      result = result.filter((product) =>
        [
          product.name,
          product.category,
          product.description ?? "",
          product.badge ?? "",
        ].some((value) =>
          value
            .toLowerCase()
            .includes(query)
        )
      );
    }

    if (category) {
      result = result.filter(
        (product) =>
          product.category === category
      );
    }

    switch (sort) {
      case "price-low":
        result.sort(
          (a, b) => a.price - b.price
        );
        break;

      case "price-high":
        result.sort(
          (a, b) => b.price - a.price
        );
        break;

      case "newest":
        result.sort((a, b) =>
          b.id.localeCompare(a.id)
        );
        break;

      default:
        result.sort(
          (a, b) =>
            Number(b.featured) -
            Number(a.featured)
        );
    }

    return result;
  }, [
    products,
    search,
    category,
    sort,
  ]);

  return (
    <main className="min-h-screen bg-[#F7F8F6]">
      {/* Shop Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-10 sm:px-8 lg:px-12 lg:pb-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">
                Basketly Shop
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
                Shop the essentials,
                <span className="text-[#16A34A]">
                  {" "}
                  your way.
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Browse the essentials you need,
                discover new favorites, and build
                your basket without the grocery-store
                trip.
              </p>
            </div>

            <Link
              href="/cart"
              className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 sm:inline-flex"
            >
              View basket
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Search */}
          <div className="mt-8 rounded-[1.5rem] border border-gray-200 bg-[#F7F8F6] p-2 sm:p-3">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search groceries, drinks, household essentials..."
                className="h-12 w-full rounded-[1rem] border border-transparent bg-white pl-12 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-200 focus:ring-4 focus:ring-green-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Desktop category chips */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                category === ""
                  ? "border-[#16A34A] bg-[#16A34A] text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              All
            </button>

            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setCategory(item.name)
                }
                className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  category === item.name
                    ? "border-[#16A34A] bg-[#16A34A] text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product workspace */}
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">
                {filteredProducts.length}
              </span>{" "}
              products
              {category
                ? ` in ${category}`
                : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setMobileFilters(
                  (value) => !value
                )
              }
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 lg:hidden"
            >
              <SlidersHorizontal
                size={16}
              />
              Filters
            </button>

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
              className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="newest">
                Newest
              </option>
            </select>
          </div>
        </div>

        {/* Mobile filters */}
        {mobileFilters && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 lg:hidden">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
              Categories
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setCategory("");
                  setMobileFilters(
                    false
                  );
                }}
                className={`rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                  category === ""
                    ? "bg-green-50 text-[#16A34A]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                All
              </button>

              {categories.map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCategory(
                        item.name
                      );
                      setMobileFilters(
                        false
                      );
                    }}
                    className={`rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                      category ===
                      item.name
                        ? "bg-green-50 text-[#16A34A]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="mt-8">
          {loading ? (
            <ProductSkeletonGrid />
          ) : filteredProducts.length ===
            0 ? (
            <div className="rounded-[2rem] border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Search size={22} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#111827]">
                Nothing matched your
                search
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Try another search term,
                or browse a different
                category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
                className="mt-6 inline-flex items-center rounded-full bg-[#16A34A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#15803D]"
              >
                Reset shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map(
                (product) => (
                  <ProductCard
  key={product.id}
  product={product}
  country={country}
/>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProductCard({
  product,
  country,
}: {
  product: Product;
  country: import("@/config/countries").CountryCode;
}) {

  const isOutOfStock =
    product.stock <= 0;

  const isLowStock =
    product.stock > 0 &&
    product.stock <= 5;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-[#F3F4F1]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-5 text-center">
            <span className="text-sm font-semibold text-gray-400">
              {product.name}
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.featured && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-gray-900 shadow-sm">
              Featured
            </span>
          )}

          {product.badge && (
            <span className="rounded-full bg-[#16A34A] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        {isOutOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            Out of stock
          </span>
        )}

        {!isOutOfStock &&
          isLowStock && (
            <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              Low stock
            </span>
          )}
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
          {product.category}
        </p>

        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-gray-900 sm:text-base">
          {product.name}
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          {product.unit}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-[#111827] sm:text-xl">
              {formatCurrency(product.price, country)}
            </p>

            <p className="mt-0.5 text-[11px] text-gray-400">
              {isOutOfStock
                ? "Unavailable"
                : isLowStock
                  ? `${product.stock} left`
                  : "In stock"}
            </p>
          </div>

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16A34A] text-lg font-bold text-white transition group-hover:bg-[#15803D]">
            +
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map(
        (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white"
          >
            <div className="aspect-square animate-pulse bg-gray-100" />

            <div className="space-y-3 p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />

              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}