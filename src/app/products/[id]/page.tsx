import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AddToBasket from "@/components/products/AddToBasket";
import { useCountry } from "@/context/CountryContext";
import ProductPrice from "@/components/products/ProductPrice";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const productForCart = product;

  const isOutOfStock = product.stock <= 0;
  const isLowStock =
    product.stock > 0 && product.stock <= 5;

  return (
    <main className="min-h-screen bg-[#F7F8F6]">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-4 sm:px-8 lg:px-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#16A34A]"
          >
            <ArrowLeft size={16} />
            Back to shop
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-16">
          {/* Product visual */}
          <div>
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
              <div className="aspect-square">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-8 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-400">
                        Product image unavailable
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        {product.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {product.featured && (
                  <span className="rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-sm">
                    Featured
                  </span>
                )}

                {product.badge && (
                  <span className="rounded-full bg-[#16A34A] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="absolute right-5 top-5">
                {isOutOfStock ? (
                  <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                    Out of stock
                  </span>
                ) : isLowStock ? (
                  <span className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                    Only {product.stock} left
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-green-100 bg-[#F0FDF4] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#16A34A] text-white">
                  <Truck size={21} />
                </div>

                <div>
                  <p className="font-bold text-[#111827]">
                    Fast local delivery
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Choose your preferred delivery window at checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product information */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">
              {product.category}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              {product.unit}
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-4xl font-bold tracking-tight text-[#111827]">
                <ProductPrice amount={product.price} />
              </span>

              {!isOutOfStock && (
                <span className="mb-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#15803D]">
                  In stock
                </span>
              )}
            </div>

            <div className="my-8 h-px bg-gray-200" />

            <div>
              <p className="text-sm font-bold text-gray-900">
                About this product
              </p>

              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                {product.description ??
                  "Quality products from Basketly."}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Benefit>
                Quality checked before dispatch
              </Benefit>

              <Benefit>
                Carefully packed for delivery
              </Benefit>

              <Benefit>
                Convenient delivery options
              </Benefit>
            </div>

            <AddToBasket product={productForCart} />

            <Link
              href="/shop"
              className="mt-4 flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-bold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Benefit({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-700">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#16A34A]">
        <Check size={15} />
      </div>

      <span>{children}</span>
    </div>
  );
}