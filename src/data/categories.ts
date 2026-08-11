export type Category = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  href: string;
};

export const categories: Category[] = [
  {
    id: "fresh-produce",
    name: "Fresh Produce",
    description: "Fresh fruits and vegetables",
    emoji: "🥬",
    color: "bg-green-100",
    href: "/shop?category=fresh-produce",
  },
  {
    id: "meat-seafood",
    name: "Meat & Seafood",
    description: "Quality meat and seafood",
    emoji: "🥩",
    color: "bg-orange-100",
    href: "/shop?category=meat-seafood",
  },
  {
    id: "dairy-eggs",
    name: "Dairy & Eggs",
    description: "Milk, cheese, eggs and more",
    emoji: "🥛",
    color: "bg-yellow-100",
    href: "/shop?category=dairy-eggs",
  },
  {
    id: "pantry",
    name: "Groceries & Pantry",
    description: "Everyday pantry essentials",
    emoji: "🛒",
    color: "bg-amber-100",
    href: "/shop?category=pantry",
  },
  {
    id: "drinks",
    name: "Drinks",
    description: "Refreshing drinks for everyone",
    emoji: "🥤",
    color: "bg-orange-100",
    href: "/shop?category=drinks",
  },
  {
    id: "snacks",
    name: "Snacks",
    description: "Tasty treats and quick bites",
    emoji: "🍿",
    color: "bg-yellow-100",
    href: "/shop?category=snacks",
  },
  {
    id: "household",
    name: "Household",
    description: "Everything for your home",
    emoji: "🏠",
    color: "bg-green-100",
    href: "/shop?category=household",
  },
  {
    id: "personal-care",
    name: "Personal Care",
    description: "Daily health and beauty essentials",
    emoji: "🧴",
    color: "bg-orange-100",
    href: "/shop?category=personal-care",
  },
];