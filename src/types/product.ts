export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string | null;
  badge?: string | null;
  description: string | null;
  stock: number;
};