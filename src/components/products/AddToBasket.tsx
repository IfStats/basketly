"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

type AddToBasketProps = {
  product: Product;
};

export default function AddToBasket({
  product,
}: AddToBasketProps) {
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const decrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increase = () => {
    setQuantity((current) => current + 1);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <>
      <div className="mt-8">
        <p className="mb-3 text-sm font-bold text-[#1F2937]">
          Quantity
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-gray-200 bg-white">
            <button
              type="button"
              onClick={decrease}
              aria-label="Decrease quantity"
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
            >
              <Minus size={17} />
            </button>

            <span className="w-10 text-center font-bold text-[#1F2937]">
              {quantity}
            </span>

            <button
              type="button"
              onClick={increase}
              aria-label="Increase quantity"
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
            >
              <Plus size={17} />
            </button>
          </div>

          <span className="text-sm text-gray-500">
            Available
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#16A34A] px-6 py-4 font-bold text-white shadow-lg transition hover:bg-[#15803D] active:scale-[0.99]"
      >
        <ShoppingCart size={21} />

        {added ? "Added to Basket ✓" : "Add to Basket"}
      </button>
    </>
  );
}