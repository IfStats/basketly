import Link from "next/link";
import { ArrowRight, Clock3, Truck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#FFFBEB]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        {/* Hero Content */}
        <div>
          {/* Delivery Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 shadow-sm">
            <Truck size={16} />
            Fast delivery to your doorstep
          </div>

          {/* Heading */}
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Everything you need,
            <span className="block text-[#16A34A]">
              delivered to your door.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Shop fresh groceries, household essentials, drinks, snacks, and
            everyday necessities—all in one convenient place.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#15803D]"
            >
              Shop Now
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/deals"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              View Deals
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-[#F97316]" />
              Reliable delivery
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-[#FBBF24]" />
              Convenient time slots
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] bg-[#16A34A] p-8 shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#FBBF24] opacity-90" />

            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-[#F97316] opacity-90" />

            {/* Main Content */}
            <div className="relative z-10 text-center text-white">
              <div className="mb-5 text-7xl">🛒</div>

              <h2 className="text-3xl font-bold sm:text-4xl">
                Your basket.
                <br />
                Your way.
              </h2>

              <p className="mx-auto mt-4 max-w-sm text-green-50">
                Fresh essentials, great prices, and reliable delivery whenever
                you need them.
              </p>

              {/* Mini Offer Card */}
              <div className="mx-auto mt-7 flex w-fit items-center gap-3 rounded-2xl bg-white px-5 py-3 text-left shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBBF24] text-xl">
                  ⚡
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Delivery
                  </p>
                  <p className="font-bold text-gray-900">
                    Fast & Reliable
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}