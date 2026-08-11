export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  badge?: string;
  description: string;
};

export const products: Product[] = [
  {
    id: "fresh-tomatoes",
    name: "Fresh Tomatoes",
    category: "Fresh Produce",
    price: 12.99,
    unit: "1 kg",
    image: "/products/tomatoes.jpg",
    badge: "Fresh",
    description: "Fresh, ripe tomatoes perfect for everyday cooking.",
  },
  {
    id: "bananas",
    name: "Fresh Bananas",
    category: "Fresh Produce",
    price: 8.99,
    unit: "1 bunch",
    image: "/products/bananas.jpg",
    badge: "Popular",
    description: "Naturally sweet bananas, perfect for breakfast and snacks.",
  },
  {
    id: "whole-milk",
    name: "Whole Milk",
    category: "Dairy & Eggs",
    price: 15.5,
    unit: "1 litre",
    image: "/products/milk.jpg",
    description: "Rich and creamy whole milk for your everyday needs.",
  },
  {
    id: "farm-eggs",
    name: "Farm Fresh Eggs",
    category: "Dairy & Eggs",
    price: 18.99,
    unit: "12 pieces",
    image: "/products/eggs.jpg",
    badge: "Fresh",
    description: "Quality farm-fresh eggs for breakfast and baking.",
  },
  {
    id: "rice",
    name: "Premium Long Grain Rice",
    category: "Groceries & Pantry",
    price: 49.99,
    unit: "5 kg",
    image: "/products/rice.jpg",
    badge: "Best Seller",
    description: "Quality long-grain rice for delicious everyday meals.",
  },
  {
    id: "orange-juice",
    name: "Orange Juice",
    category: "Drinks",
    price: 14.99,
    unit: "1 litre",
    image: "/products/orange-juice.jpg",
    description: "Refreshing orange juice made for the whole family.",
  },
  {
    id: "potato-chips",
    name: "Classic Potato Chips",
    category: "Snacks",
    price: 6.99,
    unit: "150 g",
    image: "/products/chips.jpg",
    badge: "Popular",
    description: "Crispy and delicious potato chips for every occasion.",
  },
  {
    id: "laundry-detergent",
    name: "Laundry Detergent",
    category: "Household",
    price: 24.99,
    unit: "2 kg",
    image: "/products/detergent.jpg",
    description: "Powerful cleaning detergent for fresh, clean clothes.",
  },
];