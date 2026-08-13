"use client";

import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

type AddToBasketProps = { product: Product };

export default function AddToBasket({ product }: AddToBasketProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  function changeQuantity(direction: 1 | -1) {
    setQuantity((current) => {
      const next = current + direction;
      return Math.min(product.stock, Math.max(1, next));
    });
  }

  function handleAdd() {
    if (outOfStock || quantity > product.stock) return;
    addToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">Quantity</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">How many would you like?</p>
        </div>
        {!outOfStock && (
          <span className={`text-xs font-semibold ${lowStock ? "text-amber-600" : "text-gray-500"}`}>
            {lowStock ? `Only ${product.stock} left` : `${product.stock} available`}
          </span>
        )}
      </div>

      {outOfStock ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Currently unavailable</div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-1.5">
            <button type="button" onClick={() => changeQuantity(-1)} disabled={quantity <= 1} aria-label="Decrease quantity" className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-50 disabled:opacity-35"><Minus size={17} /></button>
            <span className="text-lg font-bold text-gray-900">{quantity}</span>
            <button type="button" onClick={() => changeQuantity(1)} disabled={quantity >= product.stock} aria-label="Increase quantity" className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16A34A] text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:bg-gray-200"><Plus size={17} /></button>
          </div>

          <button type="button" onClick={handleAdd} className="mt-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#16A34A] px-6 font-bold text-white shadow-lg shadow-green-200/60 transition hover:bg-[#15803D] active:scale-[0.99]">
            {added ? <Check size={19} /> : <ShoppingCart size={19} />}
            {added ? "Added to basket" : "Add to basket"}
          </button>
        </>
      )}
    </div>
  );
}
