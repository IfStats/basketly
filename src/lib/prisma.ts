import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaNeon({
    connectionString,
  });

  return new PrismaClient({
    adapter,
  });
}

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma =
      createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy(
  {} as PrismaClient,
  {
    get(_target, property) {
      const client = getPrismaClient();
      const value =
        client[property as keyof PrismaClient];

      return typeof value === "function"
        ? value.bind(client)
        : value;
    },
  }
);