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
  type CountryConfig,
} from "@/config/countries";

type CountryContextValue = {
  country: CountryCode;
  config: CountryConfig;
  setCountry: (country: CountryCode) => void;
  loading: boolean;
};

const CountryContext =
  createContext<CountryContextValue | null>(null);

const STORAGE_KEY = "basketly-country";

export function CountryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [country, setCountryState] =
    useState<CountryCode>(defaultCountry);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeCountry() {
      try {
        const savedCountry =
          window.localStorage.getItem(
            STORAGE_KEY
          );

        if (
          savedCountry &&
          Object.prototype.hasOwnProperty.call(
            countries,
            savedCountry
          )
        ) {
          setCountryState(
            savedCountry as CountryCode
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          "/api/location",
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data =
            await response.json();

          const detected =
            data?.country?.code;

          if (
            detected &&
            Object.prototype.hasOwnProperty.call(
              countries,
              detected
            )
          ) {
            setCountryState(
              detected as CountryCode
            );
          }
        }
      } catch (error) {
        console.error(
          "Country initialization error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    initializeCountry();
  }, []);

  function setCountry(
    nextCountry: CountryCode
  ) {
    setCountryState(nextCountry);

    window.localStorage.setItem(
      STORAGE_KEY,
      nextCountry
    );
  }

  const value = useMemo(
    () => ({
      country,
      config: countries[country],
      setCountry,
      loading,
    }),
    [country, loading]
  );

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context =
    useContext(CountryContext);

  if (!context) {
    throw new Error(
      "useCountry must be used inside CountryProvider"
    );
  }

  return context;
}