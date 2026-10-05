import { NextResponse } from "next/server";

import { getPrisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export async function GET() {
  let prisma:
    | ReturnType<
        typeof getPrisma
      >
    | null = null;

  try {
    prisma = getPrisma();

    const products =
      await prisma.product.findMany({
        where: {
          isActive: true,
        },

        orderBy: [
          {
            featured: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json(
      {
        success: true,
        products,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Fetch products error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown products API error.";

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to fetch products.",

        ...(process.env.NODE_ENV !==
        "production"
          ? {
              debug: message,
            }
          : {}),
      },
      {
        status: 500,
      }
    );
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch (error) {
        console.error(
          "Products Prisma disconnect error:",
          error
        );
      }
    }
  }
}