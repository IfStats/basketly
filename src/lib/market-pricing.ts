export type MarketDeliveryRules = {
  deliveryEnabled: boolean;
  baseDeliveryFee: number;
  freeDeliveryThreshold:
    | number
    | null;
};

export function calculateMarketDeliveryFee(
  subtotal: number,
  market: MarketDeliveryRules
) {
  if (
    !Number.isFinite(subtotal) ||
    subtotal <= 0
  ) {
    return 0;
  }

  if (!market.deliveryEnabled) {
    return 0;
  }

  if (
    market.freeDeliveryThreshold !==
      null &&
    subtotal >=
      market.freeDeliveryThreshold
  ) {
    return 0;
  }

  return Number(
    Math.max(
      0,
      market.baseDeliveryFee
    ).toFixed(2)
  );
}