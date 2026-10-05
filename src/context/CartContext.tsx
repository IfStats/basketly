"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/types/product";

export type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;

  addToCart: (
    product: Product,
    quantity?: number
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number
  ) => void;

  removeFromCart: (
    productId: string
  ) => void;

  clearCart: () => void;

  reconcileCart: (
    products: Product[]
  ) => void;
};

const CartContext =
  createContext<
    CartContextType | undefined
  >(undefined);

const STORAGE_KEY =
  "basketly-cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        try {
          const savedCart =
            window.localStorage.getItem(
              STORAGE_KEY
            );

          if (savedCart) {
            const parsed =
              JSON.parse(
                savedCart
              ) as CartItem[];

            if (
              Array.isArray(parsed)
            ) {
              setItems(parsed);
            }
          }
        } catch {
          window.localStorage.removeItem(
            STORAGE_KEY
          );
        } finally {
          setHydrated(true);
        }
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items, hydrated]);

  const addToCart =
    useCallback(
      (
        product: Product,
        quantity = 1
      ) => {
        if (
          product.stock <= 0 ||
          quantity <= 0
        ) {
          return;
        }

        setItems(
          (currentItems) => {
            const existingItem =
              currentItems.find(
                (item) =>
                  item.id ===
                  product.id
              );

            if (existingItem) {
              const nextQuantity =
                Math.min(
                  existingItem.quantity +
                    quantity,
                  product.stock
                );

              return currentItems.map(
                (item) =>
                  item.id ===
                  product.id
                    ? {
                        ...item,
                        ...product,
                        quantity:
                          nextQuantity,
                      }
                    : item
              );
            }

            return [
              ...currentItems,
              {
                ...product,
                quantity:
                  Math.min(
                    quantity,
                    product.stock
                  ),
              },
            ];
          }
        );
      },
      []
    );

  const updateQuantity =
    useCallback(
      (
        productId: string,
        quantity: number
      ) => {
        if (quantity <= 0) {
          setItems(
            (currentItems) =>
              currentItems.filter(
                (item) =>
                  item.id !==
                  productId
              )
          );

          return;
        }

        setItems(
          (currentItems) =>
            currentItems.map(
              (item) => {
                if (
                  item.id !==
                  productId
                ) {
                  return item;
                }

                if (
                  item.stock <= 0
                ) {
                  return item;
                }

                return {
                  ...item,
                  quantity:
                    Math.min(
                      quantity,
                      item.stock
                    ),
                };
              }
            )
        );
      },
      []
    );

  const removeFromCart =
    useCallback(
      (productId: string) => {
        setItems(
          (currentItems) =>
            currentItems.filter(
              (item) =>
                item.id !==
                productId
            )
        );
      },
      []
    );

  const clearCart =
    useCallback(() => {
      setItems([]);
    }, []);

  const reconcileCart =
    useCallback(
      (
        products: Product[]
      ) => {
        const productMap =
          new Map(
            products.map(
              (product) => [
                product.id,
                product,
              ]
            )
          );

        setItems(
          (currentItems) =>
            currentItems.flatMap(
              (item) => {
                const liveProduct =
                  productMap.get(
                    item.id
                  );

                /*
                 * Missing from active
                 * catalog means deleted
                 * or inactive.
                 */
                if (
                  !liveProduct
                ) {
                  return [];
                }

                /*
                 * Do not keep products
                 * that can no longer be
                 * purchased.
                 */
                if (
                  liveProduct.stock <=
                  0
                ) {
                  return [];
                }

                return [
                  {
                    ...liveProduct,

                    quantity:
                      Math.min(
                        item.quantity,
                        liveProduct.stock
                      ),
                  },
                ];
              }
            )
        );
      },
      []
    );

  const itemCount =
    useMemo(
      () =>
        items.reduce(
          (total, item) =>
            total +
            item.quantity,
          0
        ),
      [items]
    );

  const subtotal =
    useMemo(
      () =>
        items.reduce(
          (total, item) =>
            total +
            item.price *
              item.quantity,
          0
        ),
      [items]
    );

  const value =
    useMemo<CartContextType>(
      () => ({
        items,
        itemCount,
        subtotal,
        hydrated,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        reconcileCart,
      }),
      [
        items,
        itemCount,
        subtotal,
        hydrated,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        reconcileCart,
      ]
    );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}