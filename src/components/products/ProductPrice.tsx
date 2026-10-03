"use client";

import { useCountry } from "@/context/CountryContext";
import { formatMoney } from "@/lib/currency";

export default function ProductPrice({
  amount,
}: {
  amount: number;
}) {
  const { config } =
    useCountry();

  return (
    <span className="text-4xl font-bold tracking-tight text-[#111827]">
      {formatMoney(
        amount,
        config.currency,
        config.locale
      )}
    </span>
  );
}