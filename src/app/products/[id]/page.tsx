import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AddToBasket from "@/components/products/AddToBasket";

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

  return (
    <main className="min-h-screen bg-[#FFFBEB]">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#16A34A]"
          >
            <ArrowLeft size={16} />
            Back to shop
          </Link>
        </div>
      </div>

      {/* Product */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Product Visual */}
          <div className="relative">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] bg-white shadow-sm">
              {product.featured && (
                <span className="absolute left-5 top-5 z-10 rounded-full bg-[#F97316] px-4 py-2 text-sm font-bold text-white shadow-sm">
                  Featured
                </span>
              )}

              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-[10rem] sm:text-[12rem]">
                  {getProductEmoji(product.category)}
                </div>
              )}
            </div>

            {/* Delivery Card */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-green-100 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
                <Truck size={22} />
              </div>

              <div>
                <p className="font-bold text-[#1F2937]">
                  Fast delivery
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Choose your preferred delivery window at checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#F97316]">
              {product.category}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1F2937] sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-gray-500">
              {product.unit}
            </p>

            <div className="mt-6">
              <span className="text-3xl font-bold text-[#16A34A]">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="my-7 h-px bg-gray-200" />

            {/* Description */}
            <p className="text-base leading-7 text-gray-600">
              {product.description ||
                "Quality products carefully selected for your everyday needs."}
            </p>

            {/* Product Benefits */}
            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Check size={18} className="text-[#16A34A]" />
                Quality checked before dispatch
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Check size={18} className="text-[#16A34A]" />
                Carefully packed for delivery
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Check size={18} className="text-[#16A34A]" />
                Convenient delivery options
              </div>
            </div>

            {/* Add to Basket */}
            <AddToBasket
  product={{
    ...product,
    image: product.image ?? "",
    description: product.description ?? "",
  }}
/>

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="mt-4 flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-4 font-semibold text-[#1F2937] transition hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
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