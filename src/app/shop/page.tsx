"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string | null;
  description: string | null;
  stock: number;
  featured: boolean;
};

const categories = [
  { label: "All Products", value: "" },
  { label: "Fresh Produce", value: "Fresh Produce" },
  { label: "Dairy & Eggs", value: "Dairy & Eggs" },
  { label: "Groceries & Pantry", value: "Groceries & Pantry" },
  { label: "Drinks", value: "Drinks" },
  { label: "Snacks", value: "Snacks" },
  { label: "Household", value: "Household" },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Failed to load products.");
        }

        const data = await response.json();

        setProducts(data.products || []);
      } catch (error) {
        console.error("Load products error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    if (category) {
      result = result.filter(
        (product) => product.category === category
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "newest") {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    if (sort === "featured") {
      result.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured)
      );
    }

    return result;
  }, [products, search, category, sort]);

  return (
    <main className="min-h-screen bg-[#FFFBEB]">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#F97316]">
            Basketly Shop
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#1F2937]">
            Shop everything
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Find groceries, drinks, snacks, household essentials,
            and everything else you need for your day.
          </p>

          {/* Search */}
          <div className="relative mt-7 max-w-2xl">
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
              placeholder="Search groceries and essentials..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>
      </section>

      {/* Shop */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-56">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />

                <h2 className="font-bold text-[#1F2937]">
                  Categories
                </h2>
              </div>

              <div className="mt-5 space-y-2">
                {categories.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                      category === item.value
                        ? "bg-green-50 text-[#16A34A]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
                <h2 className="text-xl font-bold text-[#1F2937]">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try another search or category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                  }}
                  className="mt-5 rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15803D]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;

                  const isLowStock =
                    product.stock > 0 &&
                    product.stock <= 5;

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        {product.featured && (
                          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#F97316] px-3 py-1 text-xs font-bold text-white">
                            Featured
                          </span>
                        )}

                        {isOutOfStock && (
                          <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                            Out of stock
                          </span>
                        )}

                        {!isOutOfStock && isLowStock && (
                          <span className="absolute right-3 top-3 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                            Low stock
                          </span>
                        )}

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-7xl">
                            🛍️
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-xs text-gray-400">
                          {product.category}
                        </p>

                        <h3 className="mt-1 font-bold text-[#1F2937]">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {product.unit}
                        </p>

                        <div className="mt-3 flex items-end justify-between gap-2">
                          <p className="text-lg font-bold text-[#16A34A]">
                            ${product.price.toFixed(2)}
                          </p>

                          <p
                            className={`text-xs font-semibold ${
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                  ? "text-orange-600"
                                  : "text-gray-400"
                            }`}
                          >
                            {isOutOfStock
                              ? "Unavailable"
                              : `${product.stock} available`}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}