import "dotenv/config";
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

const products = [
  {
    slug: "fresh-tomatoes",
    name: "Fresh Tomatoes",
    category: "Fresh Produce",
    price: 12.99,
    unit: "1 kg",
    image: "/products/tomatoes.jpg",
    featured: true,
    description:
      "Fresh, ripe tomatoes perfect for everyday cooking.",
  },
  {
    slug: "bananas",
    name: "Fresh Bananas",
    category: "Fresh Produce",
    price: 8.99,
    unit: "1 bunch",
    image: "/products/bananas.jpg",
    featured: true,
    description:
      "Naturally sweet bananas, perfect for breakfast and snacks.",
  },
  {
    slug: "whole-milk",
    name: "Whole Milk",
    category: "Dairy & Eggs",
    price: 15.5,
    unit: "1 litre",
    image: "/products/milk.jpg",
    featured: true,
    description:
      "Rich and creamy whole milk for your everyday needs.",
  },
  {
    slug: "farm-eggs",
    name: "Farm Fresh Eggs",
    category: "Dairy & Eggs",
    price: 18.99,
    unit: "12 pieces",
    image: "/products/eggs.jpg",
    featured: true,
    description:
      "Quality farm-fresh eggs for breakfast and baking.",
  },
  {
    slug: "rice",
    name: "Premium Long Grain Rice",
    category: "Groceries & Pantry",
    price: 49.99,
    unit: "5 kg",
    image: "/products/rice.jpg",
    featured: true,
    description:
      "Quality long-grain rice for delicious everyday meals.",
  },
  {
    slug: "orange-juice",
    name: "Orange Juice",
    category: "Drinks",
    price: 14.99,
    unit: "1 litre",
    image: "/products/orange-juice.jpg",
    featured: false,
    description:
      "Refreshing orange juice made for the whole family.",
  },
  {
    slug: "potato-chips",
    name: "Classic Potato Chips",
    category: "Snacks",
    price: 6.99,
    unit: "150 g",
    image: "/products/chips.jpg",
    featured: false,
    description:
      "Crispy and delicious potato chips for every occasion.",
  },
  {
    slug: "laundry-detergent",
    name: "Laundry Detergent",
    category: "Household",
    price: 24.99,
    unit: "2 kg",
    image: "/products/detergent.jpg",
    featured: false,
    description:
      "Powerful cleaning detergent for fresh, clean clothes.",
  },
];

async function main() {
  console.log("Seeding Basketly products...");

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {
        name: product.name,
        category: product.category,
        price: product.price,
        unit: product.unit,
        image: product.image,
        description: product.description,
        featured: product.featured,
        isActive: true,
      },
      create: {
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: product.price,
        unit: product.unit,
        image: product.image,
        description: product.description,
        featured: product.featured,
        isActive: true,
        stock: 100,
      },
    });
  }

  console.log(
    `Successfully seeded ${products.length} products.`
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });