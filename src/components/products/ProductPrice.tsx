"use client";

import { useCountry } from "@/context/CountryContext";
import { formatMoney } from "@/lib/currency";

type ProductPriceProps = {
  amount: number;
  className?: string;
};

export default function ProductPrice({
  amount,
  className = "text-4xl font-bold tracking-tight text-[#111827]",
}: ProductPriceProps) {
  const { config } = useCountry();

  return (
    <span className={className}>
      {formatMoney(
        amount,
        config.currency,
        config.locale
      )}
    </span>
  );
}