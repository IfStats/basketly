export type Product = {
  id: string;
  name: string;
  slug?: string;
  category: string;
  price: number;
  unit: string;
  image: string | null;
  badge?: string | null;
  description: string | null;
  stock: number;
  featured?: boolean;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};