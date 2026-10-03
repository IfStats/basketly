"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  countries,
  defaultCountry,
  type CountryCode,
} from "@/config/countries";

export type MarketConfig = {
  id?: string;
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  locale: string;
  callingCode: string;

  isActive: boolean;
  isDefault: boolean;

  deliveryEnabled: boolean;
  baseDeliveryFee: number;
  freeDeliveryThreshold:
    | number
    | null;
};

type CountryContextValue = {
  country: CountryCode;
  config: MarketConfig;
  markets: MarketConfig[];

  setCountry: (
    country: CountryCode
  ) => void;

  loading: boolean;
};

const CountryContext =
  createContext<
    CountryContextValue | null
  >(null);

const STORAGE_KEY =
  "basketly-country";

const fallbackCountry =
  countries[defaultCountry];

const fallbackMarket: MarketConfig =
  {
    code: fallbackCountry.code,
    name: fallbackCountry.name,
    flag: fallbackCountry.flag,
    currency:
      fallbackCountry.currency,
    locale:
      fallbackCountry.locale,
    callingCode:
      fallbackCountry.callingCode,

    isActive: true,
    isDefault: true,

    deliveryEnabled: false,
    baseDeliveryFee: 0,
    freeDeliveryThreshold:
      null,
  };

function isCountryCode(
  value: unknown
): value is CountryCode {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(
      countries,
      value
    )
  );
}

function normalizeMarket(
  value: Record<
    string,
    unknown
  >
): MarketConfig | null {
  if (
    !isCountryCode(
      value.code
    )
  ) {
    return null;
  }

  const staticConfig =
    countries[value.code];

  return {
    id:
      typeof value.id ===
      "string"
        ? value.id
        : undefined,

    code:
      value.code,

    name:
      typeof value.name ===
      "string"
        ? value.name
        : staticConfig.name,

    flag:
      typeof value.flag ===
        "string" &&
      value.flag
        ? value.flag
        : staticConfig.flag,

    currency:
      typeof value.currency ===
        "string" &&
      value.currency
        ? value.currency
        : staticConfig.currency,

    locale:
      typeof value.locale ===
        "string" &&
      value.locale
        ? value.locale
        : staticConfig.locale,

    callingCode:
      typeof value.callingCode ===
        "string" &&
      value.callingCode
        ? value.callingCode
        : staticConfig.callingCode,

    isActive:
      Boolean(
        value.isActive
      ),

    isDefault:
      Boolean(
        value.isDefault
      ),

    deliveryEnabled:
      Boolean(
        value.deliveryEnabled
      ),

    baseDeliveryFee:
      Number(
        value.baseDeliveryFee ??
          0
      ),

    freeDeliveryThreshold:
      value.freeDeliveryThreshold ===
      null
        ? null
        : Number(
            value.freeDeliveryThreshold
          ),
  };
}

export function CountryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    country,
    setCountryState,
  ] =
    useState<CountryCode>(
      defaultCountry
    );

  const [
    config,
    setConfig,
  ] =
    useState<MarketConfig>(
      fallbackMarket
    );

  const [
    markets,
    setMarkets,
  ] = useState<
    MarketConfig[]
  >([fallbackMarket]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  async function fetchMarket(
    requestedCountry?: CountryCode
  ) {
    const query =
      requestedCountry
        ? `?code=${encodeURIComponent(
            requestedCountry
          )}`
        : "";

    const response =
      await fetch(
        `/api/market${query}`,
        {
          cache: "no-store",
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to load market."
      );
    }

    const market =
      normalizeMarket(
        data.market ?? {}
      );

    if (!market) {
      throw new Error(
        "Basketly returned an invalid market."
      );
    }

    const activeMarkets =
      Array.isArray(
        data.markets
      )
        ? data.markets
            .map(
              (
                item: Record<
                  string,
                  unknown
                >
              ) =>
                normalizeMarket(
                  item
                )
            )
            .filter(
              (
                item:
                  | MarketConfig
                  | null
              ): item is MarketConfig =>
                Boolean(
                  item &&
                    item.isActive
                )
            )
        : [market];

    setCountryState(
      market.code
    );

    setConfig(market);

    setMarkets(
      activeMarkets.length
        ? activeMarkets
        : [market]
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      market.code
    );
  }

  useEffect(() => {
    async function initialize() {
      try {
        const saved =
          window.localStorage.getItem(
            STORAGE_KEY
          );

        await fetchMarket(
          isCountryCode(saved)
            ? saved
            : undefined
        );
      } catch (error) {
        console.error(
          "Market initialization error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    void initialize();
  }, []);

  function setCountry(
    nextCountry: CountryCode
  ) {
    void (async () => {
      try {
        setLoading(true);

        await fetchMarket(
          nextCountry
        );
      } catch (error) {
        console.error(
          "Market selection error:",
          error
        );
      } finally {
        setLoading(false);
      }
    })();
  }

  const value =
    useMemo(
      () => ({
        country,
        config,
        markets,
        setCountry,
        loading,
      }),
      [
        country,
        config,
        markets,
        loading,
      ]
    );

  return (
    <CountryContext.Provider
      value={value}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context =
    useContext(
      CountryContext
    );

  if (!context) {
    throw new Error(
      "useCountry must be used inside CountryProvider"
    );
  }

  return context;
}