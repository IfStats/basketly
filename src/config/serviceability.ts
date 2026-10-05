export type MarketServiceability = {
  countryCode: string;
  countryName: string;
  cities: readonly string[];
};

const SERVICEABILITY: Record<
  string,
  MarketServiceability
> = {
  GH: {
    countryCode: "GH",
    countryName: "Ghana",
    cities: ["Accra"],
  },
};

function normalize(
  value: string
) {
  return value
    .trim()
    .toUpperCase();
}

export function getServiceability(
  marketCode: string
) {
  return (
    SERVICEABILITY[
      normalize(marketCode)
    ] ?? null
  );
}

export function isDeliveryServiceable({
  marketCode,
  countryCode,
  city,
}: {
  marketCode: string;
  countryCode: string;
  city: string;
}) {
  const rule =
    getServiceability(
      marketCode
    );

  if (!rule) {
    return false;
  }

  if (
    normalize(countryCode) !==
    normalize(
      rule.countryCode
    )
  ) {
    return false;
  }

  const normalizedCity =
    city
      .trim()
      .toLowerCase();

  return rule.cities.some(
    (supportedCity) =>
      supportedCity
        .toLowerCase() ===
      normalizedCity
  );
}