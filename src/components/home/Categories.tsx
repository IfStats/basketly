import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";

export default function Categories() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#F97316]">
              Explore Basketly
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
              Shop by category
            </h2>

            <p className="mt-3 max-w-xl text-gray-600">
              Everything you need for your kitchen, home, and everyday life.
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 font-semibold text-[#16A34A] transition hover:text-[#15803D]"
          >
            View all
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${category.color} transition duration-300 group-hover:scale-110`}
              >
                {category.emoji}
              </div>

              <h3 className="font-bold text-[#1F2937]">
                {category.name}
              </h3>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                {category.description}
              </p>

              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#16A34A]">
                Shop now
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}