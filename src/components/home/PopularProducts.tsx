import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";

type PopularProductsProps = {
  products: Product[];
};

export default function PopularProducts({
  products,
}: PopularProductsProps) {
  return (
    <section>
      {products.length === 0 ? (
        <div className="rounded-[2rem] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No products available right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => {
            const isOutOfStock =
              product.stock <= 0;

            const isLowStock =
              product.stock > 0 &&
              product.stock <= 5;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-xl"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F3F4F1]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-5 text-center">
                      <span className="text-sm font-semibold text-gray-400">
                        {product.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {product.badge && (
                      <span className="rounded-full bg-[#16A34A] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        {product.badge}
                      </span>
                    )}

                    {product.featured && (
                      <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-gray-900 shadow-sm">
                        Featured
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
                        ${product.price.toFixed(2)}
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
                      <ArrowRight size={17} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}