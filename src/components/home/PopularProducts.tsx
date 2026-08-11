import Link from "next/link";
import { ArrowRight, Plus, ShoppingCart } from "lucide-react";
import { products } from "@/data/products";

export default function PopularProducts() {
  return (
    <section className="bg-[#FFFBEB] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-700">
              <ShoppingCart size={14} />
              Customer favorites
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
              Popular products
            </h2>

            <p className="mt-3 max-w-xl text-gray-600">
              Everyday essentials our customers love to add to their basket.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-semibold text-[#16A34A] transition hover:text-[#15803D]"
          >
            Shop all products
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Product Image */}
              <Link
                href={`/products/${product.id}`}
                className="relative block aspect-square overflow-hidden bg-gray-100"
              >
                {product.badge && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-[#F97316] px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {product.badge}
                  </span>
                )}

                <div className="flex h-full w-full items-center justify-center text-7xl transition duration-500 group-hover:scale-110">
                  {getProductEmoji(product.category)}
                </div>
              </Link>

              {/* Product Details */}
              <div className="p-4 sm:p-5">
                <p className="text-xs font-medium text-gray-400">
                  {product.category}
                </p>

                <Link href={`/products/${product.id}`}>
                  <h3 className="mt-1 line-clamp-2 min-h-[48px] font-bold text-[#1F2937] transition hover:text-[#16A34A]">
                    {product.name}
                  </h3>
                </Link>

                <p className="mt-1 text-sm text-gray-500">
                  {product.unit}
                </p>

                {/* Price + Cart */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold text-[#16A34A]">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`Add ${product.name} to cart`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16A34A] text-white transition hover:bg-[#15803D] active:scale-95"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
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
      return "🥤";

    case "Snacks":
      return "🍿";

    case "Household":
      return "🧴";

    case "Meat & Seafood":
      return "🥩";

    default:
      return "🛒";
  }
}