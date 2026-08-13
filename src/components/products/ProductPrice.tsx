"use client";

import { useCountry } from "@/context/CountryContext";
import { formatCurrency } from "@/lib/currency";

export default function ProductPrice({
  amount,
}: {
  amount: number;
}) {
  const { country } = useCountry();

  return (
    <span className="text-4xl font-bold tracking-tight text-[#111827]">
      {formatCurrency(amount, country)}
    </span>
  );
}