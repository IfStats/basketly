import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

type CatalogProduct = {
  name: string;
  category: string;
  unit: string;
  price: number;
  description?: string | null;
  image?: string | null;
  badge?: string | null;
  stock?: number;
  featured?: boolean;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not configured."
  );
}

const adapter = new PrismaNeon({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function buildBaseSlug(product: CatalogProduct) {
  const name = normalizeName(product.name);
  const unit = normalizeName(product.unit);

  return slugify(`${name}-${unit}`);
}

async function loadCatalog(): Promise<
  CatalogProduct[]
> {
  const filePath = path.join(
    process.cwd(),
    "prisma",
    "catalog",
    "products.json"
  );

  const raw = await fs.readFile(filePath, "utf8");

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "products.json must contain an array."
    );
  }

  return parsed;
}

function validateProduct(
  product: CatalogProduct,
  index: number
) {
  if (!product.name?.trim()) {
    throw new Error(
      `Catalog item ${index + 1}: name is required.`
    );
  }

  if (!product.category?.trim()) {
    throw new Error(
      `Catalog item ${index + 1}: category is required.`
    );
  }

  if (!product.unit?.trim()) {
    throw new Error(
      `Catalog item ${index + 1}: unit is required.`
    );
  }

  if (
    typeof product.price !== "number" ||
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    throw new Error(
      `Catalog item ${index + 1}: invalid price.`
    );
  }

  if (
    product.stock !== undefined &&
    (!Number.isInteger(product.stock) ||
      product.stock < 0)
  ) {
    throw new Error(
      `Catalog item ${index + 1}: invalid stock.`
    );
  }
}

async function main() {
  const products = await loadCatalog();

  console.log(
    `Importing ${products.length} catalog products...`
  );

  let created = 0;
  let updated = 0;

  const slugCounts = new Map<string, number>();

  for (let index = 0; index < products.length; index++) {
    const rawProduct = products[index];

    validateProduct(rawProduct, index);

    const product: CatalogProduct = {
      ...rawProduct,
      name: normalizeName(rawProduct.name),
      category: normalizeName(rawProduct.category),
      unit: normalizeName(rawProduct.unit),
      description:
        rawProduct.description?.trim() || null,
      image: rawProduct.image?.trim() || null,
      badge: rawProduct.badge?.trim() || null,
      stock:
        rawProduct.stock === undefined
          ? 100
          : rawProduct.stock,
      featured: rawProduct.featured ?? false,
    };

    const baseSlug = buildBaseSlug(product);

    const existingCount =
      (slugCounts.get(baseSlug) ?? 0) + 1;

    slugCounts.set(baseSlug, existingCount);

    const slug =
      existingCount === 1
        ? baseSlug
        : `${baseSlug}-${existingCount}`;

    const existing =
      await prisma.product.findUnique({
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
          name: product.name,
          category: product.category,
          unit: product.unit,
          price: product.price,
          description: product.description,
          image: product.image,
          badge: product.badge,
          stock: product.stock,
          featured: product.featured,
          isActive: true,
        },
      });

      updated++;
    } else {
      await prisma.product.create({
        data: {
          name: product.name,
          slug,
          category: product.category,
          unit: product.unit,
          price: product.price,
          description: product.description,
          image: product.image,
          badge: product.badge,
          stock: product.stock,
          featured: product.featured,
          isActive: true,
        },
      });

      created++;
    }

    console.log(
      `[${index + 1}/${products.length}] ${product.name}`
    );
  }

  console.log("");
  console.log("Catalog import complete.");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Total processed: ${products.length}`);
}

main()
  .catch((error) => {
    console.error("Catalog import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });