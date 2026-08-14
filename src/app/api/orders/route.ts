import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type OrderItemInput = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type CreateOrderInput = {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  delivery: {
    address: string;
    area: string;
    city: string;
    notes?: string;
    time: string;
  };

  items: OrderItemInput[];

  promotionCode?: string | null;

  subtotal: number;
  deliveryFee: number;
  total: number;
};

type PromotionType =
  | "PERCENTAGE"
  | "FIXED_AMOUNT"
  | "FREE_DELIVERY";

function normalizePromotionCode(
  value: unknown
) {
  return typeof value === "string"
    ? value.trim().toUpperCase()
    : "";
}

function calculatePromotionDiscount({
  type,
  value,
  subtotal,
  deliveryFee,
  maximumDiscount,
}: {
  type: PromotionType;
  value: number;
  subtotal: number;
  deliveryFee: number;
  maximumDiscount: number | null;
}) {
  let discount = 0;

  if (type === "PERCENTAGE") {
    discount =
      subtotal * (value / 100);

    if (
      maximumDiscount !== null
    ) {
      discount = Math.min(
        discount,
        maximumDiscount
      );
    }
  }

  if (type === "FIXED_AMOUNT") {
    discount = Math.min(
      value,
      subtotal
    );
  }

  if (type === "FREE_DELIVERY") {
    discount = deliveryFee;
  }

  return Math.max(
    0,
    Number(discount.toFixed(2))
  );
}

export async function POST(
  request: Request
) {
  const prisma = getPrisma();

  try {
    const body =
      (await request.json()) as CreateOrderInput;

    if (
      !body.customer?.firstName ||
      !body.customer?.lastName ||
      !body.customer?.email ||
      !body.customer?.phone
    ) {
      return NextResponse.json(
        {
          error:
            "Customer information is incomplete.",
        },
        { status: 400 }
      );
    }

    if (
      !body.delivery?.address ||
      !body.delivery?.area ||
      !body.delivery?.city ||
      !body.delivery?.time
    ) {
      return NextResponse.json(
        {
          error:
            "Delivery information is incomplete.",
        },
        { status: 400 }
      );
    }

    if (!body.items?.length) {
      return NextResponse.json(
        {
          error: "Your basket is empty.",
        },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (
        !item.productId ||
        !Number.isInteger(
          item.quantity
        ) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid product quantity.",
          },
          { status: 400 }
        );
      }
    }

    const promotionCode =
      normalizePromotionCode(
        body.promotionCode
      );

    const orderNumber =
      `BKT-${Date.now()
        .toString()
        .slice(-8)}`;

    const order =
      await prisma.$transaction(
        async (tx) => {
          const products =
            await tx.product.findMany({
              where: {
                id: {
                  in: body.items.map(
                    (item) =>
                      item.productId
                  ),
                },
                isActive: true,
              },
            });

          const productMap =
            new Map(
              products.map(
                (product) => [
                  product.id,
                  product,
                ]
              )
            );

          for (const item of body.items) {
            const product =
              productMap.get(
                item.productId
              );

            if (!product) {
              throw new Error(
                `PRODUCT_NOT_FOUND:${item.productId}`
              );
            }

            if (
              product.stock <
              item.quantity
            ) {
              throw new Error(
                `INSUFFICIENT_STOCK:${product.name}:${product.stock}`
              );
            }
          }

          const subtotal =
            body.items.reduce(
              (sum, item) => {
                const product =
                  productMap.get(
                    item.productId
                  );

                if (!product) {
                  throw new Error(
                    `PRODUCT_NOT_FOUND:${item.productId}`
                  );
                }

                return (
                  sum +
                  product.price *
                    item.quantity
                );
              },
              0
            );

          const baseDeliveryFee =
            subtotal >= 50 ||
            subtotal === 0
              ? 0
              : 4.99;

          const customer =
            await tx.customer.upsert({
              where: {
                email:
                  body.customer.email,
              },

              update: {
                firstName:
                  body.customer.firstName,
                lastName:
                  body.customer.lastName,
                phone:
                  body.customer.phone,
              },

              create: {
                firstName:
                  body.customer.firstName,
                lastName:
                  body.customer.lastName,
                email:
                  body.customer.email,
                phone:
                  body.customer.phone,
              },

              include: {
                orders: {
                  select: {
                    id: true,
                    total: true,
                    createdAt: true,
                  },
                },
              },
            });

          let discount = 0;
          let deliveryFee =
            baseDeliveryFee;

          if (promotionCode) {
            const promotion =
              await tx.promotion.findUnique({
                where: {
                  code: promotionCode,
                },
              });

            if (!promotion) {
              throw new Error(
                "PROMOTION_NOT_FOUND"
              );
            }

            const now = new Date();

            if (!promotion.active) {
              throw new Error(
                "PROMOTION_INACTIVE"
              );
            }

            if (
              promotion.startsAt >
              now
            ) {
              throw new Error(
                "PROMOTION_NOT_STARTED"
              );
            }

            if (
              promotion.endsAt &&
              promotion.endsAt < now
            ) {
              throw new Error(
                "PROMOTION_EXPIRED"
              );
            }

            if (
              promotion.usageLimit !==
                null &&
              promotion.usageCount >=
                promotion.usageLimit
            ) {
              throw new Error(
                "PROMOTION_LIMIT_REACHED"
              );
            }

            if (
              promotion.minimumOrder !==
                null &&
              subtotal <
                promotion.minimumOrder
            ) {
              throw new Error(
                `PROMOTION_MINIMUM_ORDER:${promotion.minimumOrder}`
              );
            }

            if (
              promotion.targetSegment
            ) {
              const lifetimeSpend =
                customer.orders.reduce(
                  (
                    sum,
                    existingOrder
                  ) =>
                    sum +
                    existingOrder.total,
                  0
                );

              const totalOrders =
                customer.orders.length;

              const lastOrder =
                customer.orders
                  .slice()
                  .sort(
                    (a, b) =>
                      b.createdAt.getTime() -
                      a.createdAt.getTime()
                  )[0] ?? null;

              const daysSinceLastOrder =
                lastOrder
                  ? Math.floor(
                      (Date.now() -
                        lastOrder.createdAt.getTime()) /
                        (1000 *
                          60 *
                          60 *
                          24)
                    )
                  : null;

              let customerSegment:
                | "NEW"
                | "VIP"
                | "INACTIVE"
                | "AT_RISK"
                | "RETURNING" =
                "NEW";

              if (
                lifetimeSpend >=
                250
              ) {
                customerSegment =
                  "VIP";
              } else if (
                daysSinceLastOrder !==
                  null &&
                daysSinceLastOrder >=
                  60
              ) {
                customerSegment =
                  "INACTIVE";
              } else if (
                daysSinceLastOrder !==
                  null &&
                daysSinceLastOrder >=
                  30
              ) {
                customerSegment =
                  "AT_RISK";
              } else if (
                totalOrders > 1
              ) {
                customerSegment =
                  "RETURNING";
              }

              if (
                promotion.targetSegment !==
                customerSegment
              ) {
                throw new Error(
                  "PROMOTION_SEGMENT_MISMATCH"
                );
              }
            }

            discount =
              calculatePromotionDiscount({
                type: promotion.type,
                value: promotion.value,
                subtotal,
                deliveryFee:
                  baseDeliveryFee,
                maximumDiscount:
                  promotion.maximumDiscount,
              });

            if (
              promotion.type ===
              "FREE_DELIVERY"
            ) {
              deliveryFee = 0;
            }

            const updatedPromotion =
              await tx.promotion.updateMany({
                where: {
                  id: promotion.id,
                  active: true,
                  OR: [
                    {
                      usageLimit:
                        null,
                    },
                    {
                      usageCount: {
                        lt:
                          promotion.usageLimit!,
                      },
                    },
                  ],
                },

                data: {
                  usageCount: {
                    increment: 1,
                  },
                },
              });

            if (
              updatedPromotion.count !==
              1
            ) {
              throw new Error(
                "PROMOTION_LIMIT_REACHED"
              );
            }
          }

          const total =
            Math.max(
              0,
              Number(
                (
                  subtotal +
                  deliveryFee -
                  discount
                ).toFixed(2)
              )
            );

          for (const item of body.items) {
            const product =
              productMap.get(
                item.productId
              );

            if (!product) {
              throw new Error(
                `PRODUCT_NOT_FOUND:${item.productId}`
              );
            }

            const updatedProduct =
              await tx.product.updateMany({
                where: {
                  id: product.id,
                  isActive: true,
                  stock: {
                    gte:
                      item.quantity,
                  },
                },

                data: {
                  stock: {
                    decrement:
                      item.quantity,
                  },
                },
              });

            if (
              updatedProduct.count !==
              1
            ) {
              throw new Error(
                `INSUFFICIENT_STOCK:${product.name}:${product.stock}`
              );
            }
          }

          return tx.order.create({
            data: {
              orderNumber,
              customerId:
                customer.id,
              subtotal,
              deliveryFee,
              total,
              promotionCode:
                promotionCode || null,
              discount,

              deliveryAddress:
                body.delivery.address,

              deliveryArea:
                body.delivery.area,

              deliveryCity:
                body.delivery.city,

              deliveryNotes:
                body.delivery.notes ||
                null,

              deliveryTime:
                body.delivery.time,

              paymentStatus: "COD",

              items: {
                create:
                  body.items.map(
                    (item) => {
                      const product =
                        productMap.get(
                          item.productId
                        );

                      if (!product) {
                        throw new Error(
                          `PRODUCT_NOT_FOUND:${item.productId}`
                        );
                      }

                      return {
                        productId:
                          product.id,
                        name:
                          product.name,
                        price:
                          product.price,
                        quantity:
                          item.quantity,
                      };
                    }
                  ),
              },

              delivery: {
                create: {
                  status:
                    "PENDING",
                },
              },
            },

            include: {
              customer: true,
              items: true,
              delivery: true,
            },
          });
        }
      );

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    if (
      error instanceof Error &&
      error.message.startsWith(
        "PRODUCT_NOT_FOUND:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "One of the products in your basket is no longer available.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message.startsWith(
        "INSUFFICIENT_STOCK:"
      )
    ) {
      const [
        ,
        productName,
        availableStock,
      ] = error.message.split(":");

      return NextResponse.json(
        {
          error:
            availableStock === "0"
              ? `${productName} is currently out of stock.`
              : `${productName} only has ${availableStock} available.`,
        },
        { status: 409 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROMOTION_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "That promotion code is not valid.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROMOTION_INACTIVE"
    ) {
      return NextResponse.json(
        {
          error:
            "That promotion is currently inactive.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROMOTION_NOT_STARTED"
    ) {
      return NextResponse.json(
        {
          error:
            "That promotion is not active yet.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROMOTION_EXPIRED"
    ) {
      return NextResponse.json(
        {
          error:
            "That promotion has expired.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROMOTION_LIMIT_REACHED"
    ) {
      return NextResponse.json(
        {
          error:
            "That promotion has reached its usage limit.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message.startsWith(
        "PROMOTION_MINIMUM_ORDER:"
      )
    ) {
      const minimum =
        error.message.split(":")[1];

      return NextResponse.json(
        {
          error:
            `This promotion requires a minimum order of $${minimum}.`,
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROMOTION_SEGMENT_MISMATCH"
    ) {
      return NextResponse.json(
        {
          error:
            "This promotion is not available for your customer segment.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to create order.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}