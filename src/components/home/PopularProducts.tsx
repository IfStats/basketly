import Link from "next/link";
import type { Product } from "@/types/product";

type PopularProductsProps = {
  products: Product[];
};

export default function PopularProducts({
  products,
}: PopularProductsProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#16A34A]">
            Popular picks
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#1F2937]">
            Shop popular products
          </h2>

          <p className="mt-2 text-gray-500">
            Fresh essentials customers love.
          </p>
        </div>

        <Link
          href="/shop"
          className="text-sm font-bold text-[#16A34A] transition hover:text-[#15803D]"
        >
          View all
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No products available right now.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => {
            const isOutOfStock = product.stock <= 0;

            return (
              <Link
                key={product.id}
                href={"/products/" + product.id}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.badge && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-[#F97316] px-3 py-1 text-xs font-bold text-white">
                      {product.badge}
                    </span>
                  )}

                  {isOutOfStock && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                      Out of stock
                    </span>
                  )}

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl">
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

                  <p className="mt-3 text-lg font-bold text-[#16A34A]">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}