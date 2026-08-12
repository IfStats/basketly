import Link from "next/link";
import PopularProducts from "@/components/home/PopularProducts";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const products = await prisma.product.findMany({
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
    take: 8,
  });

  return (
    <main>
      {/* Keep your existing homepage sections here */}

      <PopularProducts products={products} />

      {/* Keep your existing homepage sections here */}
    </main>
  );
}