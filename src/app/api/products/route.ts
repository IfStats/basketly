import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();

  try {
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

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "Fetch products error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to fetch products.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}