import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ImportProduct = {
  name: string;
  category: string;
  unit: string;
  price?: number;
  description?: string | null;
  image?: string | null;
  badge?: string | null;
  stock?: number;
  featured?: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.products)) {
      return NextResponse.json(
        {
          error: "products must be an array.",
        },
        { status: 400 }
      );
    }

    const products = body.products as ImportProduct[];

    if (products.length === 0) {
      return NextResponse.json(
        {
          error: "No products were supplied.",
        },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of products) {
      if (
        !item.name?.trim() ||
        !item.category?.trim() ||
        !item.unit?.trim()
      ) {
        skipped++;
        continue;
      }

      const name = item.name.trim();
      const category = item.category.trim();
      const unit = item.unit.trim();

      const price =
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price >= 0
          ? item.price
          : 0;

      const stock =
        typeof item.stock === "number" &&
        Number.isInteger(item.stock) &&
        item.stock >= 0
          ? item.stock
          : 100;

      const slug = slugify(`${name}-${unit}`);

      const existing = await prisma.product.findUnique({
        where: {
          slug,
        },
      });

      if (existing) {
        await prisma.product.update({
          where: {
            id: existing.id,
          },
          data: {
            name,
            category,
            unit,
            price,
            description: item.description?.trim() || null,
            image: item.image?.trim() || null,
            badge: item.badge?.trim() || null,
            stock,
            featured: item.featured ?? false,
            isActive: true,
          },
        });

        updated++;
      } else {
        await prisma.product.create({
          data: {
            name,
            slug,
            category,
            unit,
            price,
            description:
              item.description?.trim() ||
              `${name} - ${unit}.`,
            image: item.image?.trim() || null,
            badge: item.badge?.trim() || null,
            stock,
            featured: item.featured ?? false,
            isActive: true,
          },
        });

        created++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        received: products.length,
        created,
        updated,
        skipped,
      },
    });
  } catch (error) {
    console.error("Catalog import error:", error);

    return NextResponse.json(
      {
        error: "Unable to import catalog.",
      },
      { status: 500 }
    );
  }
}