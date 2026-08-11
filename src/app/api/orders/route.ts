import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderInput;

    /* -----------------------------
       Validate customer
    ----------------------------- */

    if (
      !body.customer?.firstName ||
      !body.customer?.lastName ||
      !body.customer?.email ||
      !body.customer?.phone
    ) {
      return NextResponse.json(
        {
          error: "Customer information is incomplete.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------
       Validate delivery
    ----------------------------- */

    if (
      !body.delivery?.address ||
      !body.delivery?.area ||
      !body.delivery?.city ||
      !body.delivery?.time
    ) {
      return NextResponse.json(
        {
          error: "Delivery information is incomplete.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------
       Validate basket
    ----------------------------- */

    if (!body.items?.length) {
      return NextResponse.json(
        {
          error: "Your basket is empty.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------
       Validate quantities
    ----------------------------- */

    for (const item of body.items) {
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error: "One or more product quantities are invalid.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Combine duplicate product IDs.
     *
     * Example:
     * Product A × 2
     * Product A × 3
     *
     * becomes:
     * Product A × 5
     */
    const quantities = new Map<string, number>();

    for (const item of body.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) || 0) +
          item.quantity
      );
    }

    /*
     * Everything below happens inside one database
     * transaction.
     *
     * This is important because stock must not be
     * reduced unless the order is successfully created.
     */
    const order = await prisma.$transaction(
      async (tx) => {
        /* -----------------------------
           Load products
        ----------------------------- */

        const productIds = Array.from(
          quantities.keys()
        );

        const products = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
            isActive: true,
          },
        });

        /* -----------------------------
           Make sure every product exists
        ----------------------------- */

        if (products.length !== productIds.length) {
          throw new Error(
            "One or more products are no longer available."
          );
        }

        /* -----------------------------
           Check stock
        ----------------------------- */

        for (const product of products) {
          const requestedQuantity =
            quantities.get(product.id) || 0;

          if (product.stock < requestedQuantity) {
            throw new Error(
              `${product.name} is out of stock or does not have enough stock. Available: ${product.stock}.`
            );
          }
        }

        /* -----------------------------
           Create / update customer
        ----------------------------- */

        const customer = await tx.customer.upsert({
          where: {
            email: body.customer.email,
          },
          update: {
            firstName: body.customer.firstName,
            lastName: body.customer.lastName,
            phone: body.customer.phone,
          },
          create: {
            firstName: body.customer.firstName,
            lastName: body.customer.lastName,
            email: body.customer.email,
            phone: body.customer.phone,
          },
        });

        /* -----------------------------
           Generate order number
        ----------------------------- */

        const orderNumber = `BKT-${Date.now()
          .toString()
          .slice(-8)}`;

        /* -----------------------------
           Create order
        ----------------------------- */

        const createdOrder = await tx.order.create({
          data: {
            orderNumber,

            customerId: customer.id,

            /*
             * Automatically confirm the order because
             * stock has already been verified.
             */
            status: "CONFIRMED",

            paymentStatus: "COD",

            subtotal: body.subtotal,
            deliveryFee: body.deliveryFee,
            total: body.total,

            deliveryAddress:
              body.delivery.address,

            deliveryArea:
              body.delivery.area,

            deliveryCity:
              body.delivery.city,

            deliveryNotes:
              body.delivery.notes || null,

            deliveryTime:
              body.delivery.time,

            items: {
              create: body.items.map((item) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
            },

            delivery: {
              create: {
                status: "PENDING",
              },
            },
          },

          include: {
            customer: true,
            items: true,
            delivery: true,
          },
        });

        /* -----------------------------
           Reduce stock
        ----------------------------- */

        for (const product of products) {
          const requestedQuantity =
            quantities.get(product.id) || 0;

          /*
           * Conditional update:
           *
           * stock must still be >= requested quantity.
           *
           * This protects against overselling when
           * multiple orders are placed simultaneously.
           */
          const updatedProduct =
            await tx.product.updateMany({
              where: {
                id: product.id,
                isActive: true,
                stock: {
                  gte: requestedQuantity,
                },
              },

              data: {
                stock: {
                  decrement: requestedQuantity,
                },
              },
            });

          if (updatedProduct.count !== 1) {
            throw new Error(
              `${product.name} is no longer available in the requested quantity.`
            );
          }
        }

        return createdOrder;
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

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create order.";

    /*
     * Stock / availability errors are client errors,
     * not server failures.
     */
    if (
      message.includes("out of stock") ||
      message.includes("does not have enough stock") ||
      message.includes("no longer available")
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to create order.",
      },
      { status: 500 }
    );
  }
}