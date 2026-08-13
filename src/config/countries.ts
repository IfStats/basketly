export type CountryCode = "GH" | "NG" | "US" | "GB";

export type CountryConfig = {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  locale: string;
  callingCode: string;
};

export const countries: Record<
  CountryCode,
  CountryConfig
> = {
  GH: {
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    currency: "GHS",
    locale: "en-GH",
    callingCode: "+233",
  },

  NG: {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    locale: "en-NG",
    callingCode: "+234",
  },

  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    locale: "en-US",
    callingCode: "+1",
  },

  GB: {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    locale: "en-GB",
    callingCode: "+44",
  },
};

export const defaultCountry: CountryCode = "GH";