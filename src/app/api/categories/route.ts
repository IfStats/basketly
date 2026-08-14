import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const prisma = getPrisma();

  try {
    const categories =
      await prisma.category.findMany({
        where: {
          isActive: true,
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          sortOrder: true,
        },
      });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "Public categories GET error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load categories.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}