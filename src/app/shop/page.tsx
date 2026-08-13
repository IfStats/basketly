import ShopClient from "./ShopClient";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  return (
    <ShopClient
      initialCategory={params.category ?? ""}
    />
  );
}