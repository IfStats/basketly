import { NextResponse } from "next/server";
import type { CountryCode } from "@/config/countries";
import {
  countries,
  defaultCountry,
} from "@/config/countries";

const headerToCountry = (value: string | null): CountryCode => {
  const code = value?.trim().toUpperCase();

  if (
    code &&
    Object.prototype.hasOwnProperty.call(
      countries,
      code
    )
  ) {
    return code as CountryCode;
  }

  return defaultCountry;
};

export async function GET(request: Request) {
  try {
    const headers = request.headers;

    const detectedCountry =
      headerToCountry(
        headers.get("cf-ipcountry") ??
          headers.get("x-vercel-ip-country")
      );

    const country =
      countries[detectedCountry];

    return NextResponse.json({
      success: true,
      country: {
        code: country.code,
        name: country.name,
        flag: country.flag,
        currency: country.currency,
        locale: country.locale,
        callingCode:
          country.callingCode,
      },
    });
  } catch (error) {
    console.error(
      "Location detection error:",
      error
    );

    const country =
      countries[defaultCountry];

    return NextResponse.json({
      success: true,
      country,
    });
  }
}