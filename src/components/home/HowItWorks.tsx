import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  ShoppingBasket,
  Truck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ShoppingBasket,
    title: "Choose what you need",
    description:
      "Browse groceries and everyday essentials and add your favorites to your basket.",
  },
  {
    number: "02",
    icon: PackageCheck,
    title: "Place your order",
    description:
      "Review your basket, select your delivery address and choose a convenient time.",
  },
  {
    number: "03",
    icon: Truck,
    title: "We deliver",
    description:
      "Our delivery team prepares your order and gets it to your doorstep on time.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#FFFBEB] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700">
            <Truck size={14} />
            Simple & reliable
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
            Groceries delivered your way
          </h2>

          <p className="mt-4 text-gray-600">
            Getting your everyday essentials should be simple. Basketly takes
            care of the journey from your basket to your doorstep.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-3xl border border-gray-100 bg-white p-7 shadow-sm"
              >
                {/* Step number */}
                <div className="absolute right-6 top-6 text-5xl font-black text-gray-100">
                  {step.number}
                </div>

                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-[#16A34A]">
                    <Icon size={27} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#1F2937]">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {step.description}
                  </p>
                </div>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="text-[#FBBF24]" size={28} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Delivery promise */}
        <div className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#16A34A] p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FBBF24] opacity-90" />

          <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#F97316] opacity-80" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
                <Clock3 size={16} />
                Built around your schedule
              </div>

              <h3 className="mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">
                Need it today? We've got you covered.
              </h3>

              <p className="mt-4 max-w-2xl leading-7 text-green-50">
                Choose an available delivery window at checkout and let
                Basketly bring your essentials straight to your door.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  Convenient time slots
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  Order updates
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={17} />
                  Doorstep delivery
                </div>
              </div>

              <Link
                href="/shop"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#16A34A] transition hover:bg-gray-100"
              >
                Start shopping
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Delivery visual */}
            <div className="hidden lg:flex">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/15">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-[#16A34A] shadow-lg">
                  <MapPin size={52} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}