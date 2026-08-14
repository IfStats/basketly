import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const prisma = getPrisma();

  try {
    const authenticated = await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }


    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() ?? "";

    const status =
      searchParams.get("status") ?? "ALL";

    const category =
      searchParams.get("category") ?? "ALL";

    const where: {
      isActive: boolean;
      category?: string;
      OR?: Array<{
        name: {
          contains: string;
          mode: "insensitive";
        };
        slug?: never;
      } | {
        slug: {
          contains: string;
          mode: "insensitive";
        };
        name?: never;
      }>;
    } = {
      isActive: true,
    };

    if (category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        unit: true,
        price: true,
        stock: true,
        image: true,
        badge: true,
        featured: true,
        isActive: true,
        updatedAt: true,
      },
    });

    const filteredProducts = products.filter(
      (product) => {
        if (status === "OUT_OF_STOCK") {
          return product.stock <= 0;
        }

        if (status === "LOW_STOCK") {
          return (
            product.stock > 0 &&
            product.stock <= 5
          );
        }

        if (status === "HEALTHY") {
          return product.stock > 5;
        }

        return true;
      }
    );

    return NextResponse.json({
      success: true,
      products: filteredProducts,
    });
   } catch (error) {
    console.error(
      "Admin inventory GET error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to load inventory." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: Request) {
  const prisma = getPrisma();

  try {
    const authenticated = await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      typeof body.productId === "string"
        ? body.productId.trim()
        : "";

    const mode =
      body.mode === "SET"
        ? "SET"
        : "ADJUST";

    const value = Number(body.value);

    if (!productId) {
      return NextResponse.json(
        {
          error: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(value)) {
      return NextResponse.json(
        {
          error:
            "Inventory quantity must be a whole number.",
        },
        { status: 400 }
      );
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        { status: 404 }
      );
    }

    const nextStock =
      mode === "SET"
        ? value
        : existingProduct.stock + value;

    if (nextStock < 0) {
      return NextResponse.json(
        {
          error:
            "Stock cannot be negative.",
        },
        { status: 400 }
      );
    }

    const product =
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          stock: nextStock,
        },
        select: {
          id: true,
          name: true,
          stock: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      product,
      previousStock:
        existingProduct.stock,
    });
  } catch (error) {
    console.error(
      "Admin inventory PATCH error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to update inventory." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}