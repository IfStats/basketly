import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import PopularProducts from "@/components/home/PopularProducts";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const categoryDefinitions = [
  {
    name: "Fresh Produce",
    description: "Fruits, vegetables & more",
  },
  {
    name: "Dairy & Eggs",
    description: "Fresh milk, eggs & dairy",
  },
  {
    name: "Groceries & Pantry",
    description: "Everyday cooking essentials",
  },
  {
    name: "Drinks",
    description: "Juices & everyday drinks",
  },
  {
    name: "Snacks",
    description: "Treats for every moment",
  },
  {
    name: "Household",
    description: "Cleaning & home essentials",
  },
];

export default async function HomePage() {
  const prisma = getPrisma();

  try {
    const [products, categoryProducts] =
      await Promise.all([
        prisma.product.findMany({
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
          take: 8,
        }),

        prisma.product.findMany({
          where: {
            isActive: true,
            image: {
              not: null,
            },
            category: {
              in: categoryDefinitions.map(
                (category) => category.name
              ),
            },
          },
          orderBy: [
            {
              featured: "desc",
            },
            {
              createdAt: "desc",
            },
          ],
          select: {
            id: true,
            name: true,
            category: true,
            image: true,
          },
        }),
      ]);

    const categories = categoryDefinitions.map(
      (category) => {
        const representative =
          categoryProducts.find(
            (product) =>
              product.category ===
              category.name
          );

        return {
          ...category,
          href: `/shop?category=${encodeURIComponent(
            category.name
          )}`,
          image:
            representative?.image ?? null,
          productName:
            representative?.name ?? null,
        };
      }
    );

    return (
      <main className="min-h-screen bg-[#F7F8F6]">
        {/* Hero */}
        <section className="overflow-hidden bg-[#F0FDF4]">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12 lg:pb-24 lg:pt-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#15803D] shadow-sm">
                <Sparkles size={14} />
                Fresh groceries, delivered
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl lg:text-7xl lg:leading-[1.02]">
                Everyday essentials,
                <span className="block text-[#16A34A]">
                  made effortless.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                Shop fresh produce, pantry staples,
                drinks, snacks and household
                essentials without leaving home.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#16A34A] px-7 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-[#15803D]"
                >
                  Start shopping
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/shop?featured=true"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-sm font-bold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Explore best sellers
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-2">
                  <Truck
                    size={16}
                    className="text-[#16A34A]"
                  />
                  Fast local delivery
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock3
                    size={16}
                    className="text-[#16A34A]"
                  />
                  Convenient delivery windows
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-yellow-200/60 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-green-200/70 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-4 shadow-2xl shadow-green-900/10 sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      category: "Fresh Produce",
                    },
                    {
                      category: "Dairy & Eggs",
                    },
                    {
                      category:
                        "Groceries & Pantry",
                    },
                    {
                      category: "Snacks",
                    },
                  ].map((item) => {
                    const product =
                      categoryProducts.find(
                        (product) =>
                          product.category ===
                          item.category
                      );

                    return (
                      <HeroProductCard
                        key={item.category}
                        productName={
                          product?.name ??
                          item.category
                        }
                        image={
                          product?.image ??
                          null
                        }
                      />
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl bg-[#111827] p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-300">
                    Basketly promise
                  </p>

                  <p className="mt-2 text-lg font-bold">
                    The essentials you need,
                    without the grocery-store trip.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">
                Shop by category
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Everything for everyday life
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                Browse the things you buy most often,
                organized to make shopping faster.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] hover:text-[#15803D]"
            >
              Browse all products
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F3F4F1]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={
                        category.productName ??
                        category.name
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 px-5 text-center">
                      <span className="text-sm font-bold text-gray-500">
                        {category.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12">
                    <p className="text-sm font-bold text-white">
                      {category.name}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <p className="text-xs leading-5 text-gray-500">
                    {category.description}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#16A34A]">
                    Shop category
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Promo strip */}
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="overflow-hidden rounded-[2rem] bg-[#111827] px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-300">
                  Better value, fewer errands
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Free delivery on qualifying baskets.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                  Build your basket with the
                  essentials you already need and
                  let Basketly handle the rest.
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#111827] transition hover:bg-gray-100"
              >
                Shop now
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Popular products */}
        <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#16A34A]">
                Popular right now
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                Your basket, sorted.
              </h2>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                A quick look at products customers
                are shopping now.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#16A34A] hover:text-[#15803D]"
            >
              See everything
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8">
            <PopularProducts products={products} />
          </div>
        </section>

        {/* Trust section */}
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:px-8 md:grid-cols-3 lg:px-12 lg:py-16">
            <TrustCard
              icon={<Truck size={21} />}
              title="Delivery built around you"
              description="Choose a convenient delivery window and let Basketly handle the last mile."
            />

            <TrustCard
              icon={<Clock3 size={21} />}
              title="Simple, predictable shopping"
              description="Find your everyday essentials quickly with a cleaner, faster shopping experience."
            />

            <TrustCard
              icon={<ShieldCheck size={21} />}
              title="A dependable basket"
              description="Your order is checked against live product availability before it is confirmed."
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="rounded-[2rem] bg-[#DCFCE7] px-6 py-12 text-center sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#15803D]">
              Ready when you are
            </p>

            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              Build your next basket in minutes.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
              Shop your essentials, choose your
              delivery time, and get on with your day.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#16A34A] px-7 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-[#15803D]"
            >
              Start shopping
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    );
  } finally {
    await prisma.$disconnect();
  }
}

function HeroProductCard({
  productName,
  image,
}: {
  productName: string;
  image: string | null;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-gray-50">
      <div className="aspect-square overflow-hidden bg-[#F3F4F1]">
        {image ? (
          <img
            src={image}
            alt={productName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <span className="text-xs font-bold text-gray-400">
              {productName}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-xs font-bold text-gray-800">
          {productName}
        </p>
      </div>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}