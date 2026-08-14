import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

type ImportProduct = {
  name: string;
  category: string;
  unit: string;
  price: number | null;
  stock: number;
  description?: string | null;
  image?: string | null;
  badge?: string | null;
  featured?: boolean;
  isActive?: boolean;
};

type ImportRequestBody = {
  products?: ImportProduct[];
};

function cleanText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function cleanNullableText(value: unknown): string | null {
  const text = cleanText(value);
  return text || null;
}

function cleanPrice(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(
    String(value)
      .replace(/[$€£,\s]/g, "")
      .trim()
  );

  return Number.isFinite(parsed) ? parsed : null;
}

function cleanStock(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsed));
}

function cleanBoolean(
  value: unknown,
  defaultValue: boolean
): boolean {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  if (
    ["true", "1", "yes", "y", "on"].includes(
      normalized
    )
  ) {
    return true;
  }

  if (
    ["false", "0", "no", "n", "off"].includes(
      normalized
    )
  ) {
    return false;
  }

  return defaultValue;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function getUniqueSlug(
  prisma: ReturnType<typeof getPrisma>,
  name: string
): Promise<string> {
  const baseSlug = createSlug(name);

  if (!baseSlug) {
    throw new Error(
      "Unable to generate a valid product slug."
    );
  }

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing =
      await prisma.product.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;

    if (counter > 10000) {
      throw new Error(
        "Unable to generate a unique product slug."
      );
    }
  }
}

export async function POST(
  request: Request
) {
  try {
    const authenticated =
      await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    let body: ImportRequestBody;

    try {
      body =
        (await request.json()) as ImportRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.products)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The request must contain a products array.",
        },
        { status: 400 }
      );
    }

    if (body.products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "There are no products available for import.",
        },
        { status: 400 }
      );
    }

    if (body.products.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Maximum import size is 5,000 products per request.",
        },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    const errors: Array<{
      index: number;
      name?: string;
      error: string;
    }> = [];

    /*
     * Process products one at a time deliberately.
     *
     * This keeps individual failures isolated so one bad
     * catalog row does not destroy the entire import.
     */
    for (
      let index = 0;
      index < body.products.length;
      index += 1
    ) {
      const rawProduct =
        body.products[index];

      try {
        if (!rawProduct) {
          skipped += 1;

          errors.push({
            index,
            error: "Empty product row.",
          });

          continue;
        }

        const name = cleanText(
          rawProduct.name
        );

        const category = cleanText(
          rawProduct.category
        );

        const unit = cleanText(
          rawProduct.unit
        );

        const price = cleanPrice(
          rawProduct.price
        );

        const stock = cleanStock(
          rawProduct.stock
        );

        const description =
          cleanNullableText(
            rawProduct.description
          );

        const image =
          cleanNullableText(
            rawProduct.image
          );

        const badge =
          cleanNullableText(
            rawProduct.badge
          );

        const featured = cleanBoolean(
          rawProduct.featured,
          false
        );

        const isActive = cleanBoolean(
          rawProduct.isActive,
          true
        );

        if (!name) {
          skipped += 1;

          errors.push({
            index,
            error:
              "Product name is missing.",
          });

          continue;
        }

        if (!category) {
          skipped += 1;

          errors.push({
            index,
            name,
            error:
              "Product category is missing.",
          });

          continue;
        }

        if (!unit) {
          skipped += 1;

          errors.push({
            index,
            name,
            error:
              "Product unit / size is missing.",
          });

          continue;
        }

        if (
          price === null ||
          price < 0
        ) {
          skipped += 1;

          errors.push({
            index,
            name,
            error:
              "Product price is missing or invalid.",
          });

          continue;
        }

        const baseSlug =
          createSlug(name);

        if (!baseSlug) {
          skipped += 1;

          errors.push({
            index,
            name,
            error:
              "Unable to generate a valid product slug.",
          });

          continue;
        }

        /*
         * Existing products are identified by their base slug.
         */
        const existing =
          await prisma.product.findUnique({
            where: {
              slug: baseSlug,
            },
            select: {
              id: true,
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
              stock,
              description,
              image,
              badge,
              featured,
              isActive,
            },
          });

          updated += 1;
          continue;
        }

        /*
         * New product.
         */
        const slug =
          await getUniqueSlug(
            prisma,
            name
          );

        await prisma.product.create({
          data: {
            name,
            slug,
            category,
            unit,
            price,
            stock,
            description,
            image,
            badge,
            featured,
            isActive,
          },
        });

        imported += 1;
      } catch (error) {
        console.error(
          `Product import failed at index ${index}:`,
          error
        );

        skipped += 1;

        errors.push({
          index,
          name:
            cleanText(
              rawProduct?.name
            ) || undefined,
          error:
            error instanceof Error
              ? error.message
              : "Unknown database error.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Catalog import completed.",
      imported,
      updated,
      skipped,
      total:
        body.products.length,
      errors,
    });
  } catch (error) {
    console.error(
      "Product import fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to import the product catalog.",
      },
      { status: 500 }
    );
  }
}