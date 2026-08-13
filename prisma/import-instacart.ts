import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

type ParsedProduct = {
  name: string;
  unit: string;
  category: string;
};

function cleanMarkdown(value: string) {
  return value
    .replace(/^\[|\]$/g, "")
    .replace(/\*\*/g, "")
    .replace(/\r/g, "")
    .trim();
}

function normalizeName(value: string) {
  return value
    .replace(/^\[|\]$/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectCategory(name: string): string {
  const value = name.toLowerCase();

  if (
    /diaper|baby wipe|baby bottle|infant formula|sippy|swim diaper|overnight diaper|baby &/.test(
      value
    )
  ) {
    return "Baby & Infant";
  }

  if (
    /lamb|beef|steak|ground beef|burger|meatball|bacon|sausage|hot dog|wiener|ham|spam|chili/.test(
      value
    )
  ) {
    return "Meat & Poultry";
  }

  if (
    /salmon|tuna|crab|lobster|caviar|clam|sardine|oyster|seafood|pollock|tilapia|fish/.test(
      value
    )
  ) {
    return "Seafood";
  }

  if (
    /bread|rolls|tortilla|taco shell|english muffin|bagel|bun|pastry/.test(
      value
    )
  ) {
    return "Bakery & Bread";
  }

  if (
    /snickers|reese|kit kat|twix|hershey|m&m|skittles|candy|mentos|gum|sour patch|lifesavers|nerds|whoppers|milky way|payday|chocolate|altoids/.test(
      value
    )
  ) {
    return "Snacks & Candy";
  }

  if (
    /pringles|cheetos|takis|chips ahoy|lays|lay's|ruffles|cheez-it|granola|pop-tarts|nutri-grain/.test(
      value
    )
  ) {
    return "Snacks & Candy";
  }

  if (
    /milk|egg|cheese|yogurt|butter|cream/.test(value)
  ) {
    return "Dairy & Eggs";
  }

  if (
    /pineapple|peach|pear|applesauce|fruit cocktail|yams|sweet potato|pumpkin/.test(
      value
    )
  ) {
    return "Canned & Pantry";
  }

  if (
    /tomato|bean|corn|pea|carrot|spinach|greens|chickpea|lentil|hominy|jalapeno|pepper|vegetable|tomato sauce|tomato paste/.test(
      value
    )
  ) {
    return "Canned & Pantry";
  }

  if (
    /soup|ravioli|spaghetti|mac & cheese|ramen|mashed potatoes|menudo|tamale|hash/.test(
      value
    )
  ) {
    return "Canned & Pantry";
  }

  if (
    /juice|water|drink|beverage/.test(value)
  ) {
    return "Drinks";
  }

  if (
    /detergent|baking soda|household/.test(value)
  ) {
    return "Household";
  }

  if (
    /apple|banana|orange|lettuce|tomato|potato|avocado|berry|grape/.test(
      value
    )
  ) {
    return "Fresh Produce";
  }

  return "Canned & Pantry";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCatalog(raw: string): ParsedProduct[] {
  const lines = raw
    .split("\n")
    .map((line) => normalizeName(line))
    .filter(Boolean);

  const results: ParsedProduct[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (
      !line ||
      line.startsWith("Skipped") ||
      line === "---"
    ) {
      continue;
    }

    const next = lines[i + 1];

    if (!next) {
      continue;
    }

    const isUnit =
      /^(?:\d+(?:\.\d+)?|\~\d+(?:\.\d+)?)\s?(?:oz|fl oz|lb|lbs|g|kg|ml|l|ct|each|pack|set|sticks|pieces|each)\b/i.test(
        next
      );

    if (!isUnit) {
      continue;
    }

    const isUrl = line.startsWith("http");
    const isMarkdown = line.startsWith("[") && line.includes("](");

    if (isUrl || isMarkdown) {
      continue;
    }

    if (
      line.length < 3 ||
      line.length > 180
    ) {
      continue;
    }

    results.push({
      name: line,
      unit: next,
      category: detectCategory(line),
    });

    i++;
  }

  return results;
}

async function main() {
  const sourcePath = path.join(
    process.cwd(),
    "prisma",
    "catalog",
    "raw-instacart.txt"
  );

  const raw = await fs.readFile(sourcePath, "utf8");

  const parsed = parseCatalog(raw);

  if (parsed.length === 0) {
    throw new Error(
      "No products were detected in raw-instacart.txt."
    );
  }

  console.log(
    `Detected ${parsed.length} catalog products.`
  );

  const seen = new Set<string>();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of parsed) {
    const key =
      `${product.name}|${product.unit}`.toLowerCase();

    if (seen.has(key)) {
      skipped++;
      continue;
    }

    seen.add(key);

    const baseSlug = slugify(
      `${product.name}-${product.unit}`
    );

    const existing =
      await prisma.product.findUnique({
        where: {
          slug: baseSlug,
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
          isActive: true,
        },
      });

      updated++;
      continue;
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: baseSlug,
        category: product.category,
        unit: product.unit,
        price: 0,
        description: `${product.name} - ${product.unit}.`,
        image: null,
        badge: null,
        stock: 100,
        featured: false,
        isActive: true,
      },
    });

    created++;

    console.log(
      `[${created + updated}/${parsed.length}] ${product.name}`
    );
  }

  console.log("");
  console.log("Instacart catalog import complete.");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Duplicates skipped: ${skipped}`);
  console.log(`Detected: ${parsed.length}`);
}

main()
  .catch((error) => {
    console.error("Catalog import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });