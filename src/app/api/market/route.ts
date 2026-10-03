import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function normalizeCode(
  value: string | null
) {
  return value
    ?.trim()
    .toUpperCase() || "";
}

export async function GET(
  request: Request
) {
  const prisma = getPrisma();

  try {
    const url = new URL(
      request.url
    );

    const requestedCode =
      normalizeCode(
        url.searchParams.get("code")
      );

    const detectedCode =
      normalizeCode(
        request.headers.get(
          "cf-ipcountry"
        ) ??
          request.headers.get(
            "x-vercel-ip-country"
          )
      );

    const candidateCode =
      requestedCode ||
      detectedCode;

    const markets =
      await prisma.market.findMany({
        where: {
          isActive: true,
        },
        orderBy: [
          {
            isDefault: "desc",
          },
          {
            name: "asc",
          },
        ],
      });

    if (markets.length === 0) {
      return NextResponse.json(
        {
          error:
            "No Basketly market is currently active.",
        },
        {
          status: 503,
        }
      );
    }

    const market =
      markets.find(
        (item) =>
          item.code ===
          candidateCode
      ) ??
      markets.find(
        (item) =>
          item.isDefault
      ) ??
      markets[0];

    return NextResponse.json({
      success: true,
      market,
      markets,
    });
  } catch (error) {
    console.error(
      "Market detection error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to determine Basketly market.",
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}