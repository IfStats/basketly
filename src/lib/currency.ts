import type { CountryCode } from "@/config/countries";
import { countries } from "@/config/countries";

export function formatCurrency(
  amount: number,
  country: CountryCode
) {
  const config = countries[country];

  return new Intl.NumberFormat(
    config.locale,
    {
      style: "currency",
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}