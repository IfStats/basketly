import Link from "next/link";
import { ArrowRight, Clock3, Percent } from "lucide-react";

const deals = [
  {
    title: "Fresh Picks",
    description: "Save on selected fresh fruits and vegetables.",
    discount: "UP TO 25% OFF",
    emoji: "🥬",
    background: "bg-[#DCFCE7]",
    accent: "text-[#16A34A]",
    button: "bg-[#16A34A] hover:bg-[#15803D]",
  },
  {
    title: "Pantry Savings",
    description: "Stock up on everyday grocery essentials.",
    discount: "UP TO 20% OFF",
    emoji: "🛒",
    background: "bg-[#FEF3C7]",
    accent: "text-[#D97706]",
    button: "bg-[#FBBF24] hover:bg-[#F59E0B]",
  },
  {
    title: "Weekend Treats",
    description: "Snacks and drinks for your weekend.",
    discount: "UP TO 30% OFF",
    emoji: "🍿",
    background: "bg-[#FFEDD5]",
    accent: "text-[#F97316]",
    button: "bg-[#F97316] hover:bg-[#EA580C]",
  },
];

export default function Deals() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
              <Percent size={14} />
              Save more
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
              Today's deals
            </h2>

            <p className="mt-3 max-w-xl text-gray-600">
              Great prices on the products you already love.
            </p>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-2 font-semibold text-[#16A34A] transition hover:text-[#15803D]"
          >
            View all deals
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Deals */}
        <div className="grid gap-5 md:grid-cols-3">
          {deals.map((deal) => (
            <div
              key={deal.title}
              className={`relative overflow-hidden rounded-[2rem] ${deal.background} p-6 sm:p-7`}
            >
              {/* Decorative circle */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/40" />

              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-bold ${deal.accent}`}
                    >
                      {deal.discount}
                    </span>

                    <h3 className="mt-5 text-2xl font-bold text-[#1F2937]">
                      {deal.title}
                    </h3>
                  </div>

                  <div className="text-5xl">{deal.emoji}</div>
                </div>

                <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600">
                  {deal.description}
                </p>

                <Link
                  href="/deals"
                  className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${deal.button}`}
                >
                  Shop deal
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Limited Time Banner */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl bg-[#1F2937] px-6 py-5 text-center text-white sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBBF24] text-[#1F2937]">
              <Clock3 size={21} />
            </div>

            <div>
              <p className="font-bold">Limited-time offers</p>
              <p className="text-sm text-gray-300">
                Deals can change quickly. Don't miss out.
              </p>
            </div>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-2 font-semibold text-[#FBBF24] hover:text-yellow-300"
          >
            Explore deals
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}