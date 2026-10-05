const currencyLocales: Record<
  string,
  string
> = {
  GHS: "en-GH",
  NGN: "en-NG",
  GBP: "en-GB",
  USD: "en-US",
};

export function formatMoney(
  amount: number,
  currency: string,
  locale: string
) {
  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

export function formatCurrency(
  amount: number,
  currency = "GHS"
) {
  return formatMoney(
    amount,
    currency,
    currencyLocales[currency] ??
      "en-GH"
  );
}

export function formatGhanaMoney(
  amount: number
) {
  return formatMoney(
    amount,
    "GHS",
    "en-GH"
  );
}