import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        featured: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

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
            Find groceries, drinks, snacks, household essentials, and
            everything else you need for your day.
          </p>

          {/* Search */}
          <div className="relative mt-7 max-w-2xl">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
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
                <Link
                  href="/shop"
                  className="block rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-[#16A34A]"
                >
                  All Products
                </Link>

                <Link
                  href="/shop?category=fresh-produce"
                  className="block rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Fresh Produce
                </Link>

                <Link
                  href="/shop?category=dairy-eggs"
                  className="block rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Dairy & Eggs
                </Link>

                <Link
                  href="/shop?category=pantry"
                  className="block rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Groceries & Pantry
                </Link>

                <Link
                  href="/shop?category=drinks"
                  className="block rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Drinks
                </Link>

                <Link
                  href="/shop?category=snacks"
                  className="block rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Snacks
                </Link>

                <Link
                  href="/shop?category=household"
                  className="block rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Household
                </Link>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {products.length}
                </span>{" "}
                products
              </p>

              <select className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
                <h2 className="text-xl font-bold text-[#1F2937]">
                  No products available
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Check back soon for new products.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-100 text-7xl">
                      {product.featured && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#F97316] px-3 py-1 text-xs font-bold text-white">
                          Featured
                        </span>
                      )}

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        getProductEmoji(product.category)
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

                      <p className="mt-3 text-lg font-bold text-[#16A34A]">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function getProductEmoji(category: string) {
  switch (category) {
    case "Fresh Produce":
      return "🥬";
    case "Dairy & Eggs":
      return "🥛";
    case "Groceries & Pantry":
      return "🍚";
    case "Drinks":
      return "🧃";
    case "Snacks":
      return "🍿";
    case "Household":
      return "🧹";
    case "Meat & Seafood":
      return "🥩";
    default:
      return "🛒";
  }
}