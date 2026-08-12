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

    if (
      !body.customer?.firstName ||
      !body.customer?.lastName ||
      !body.customer?.email ||
      !body.customer?.phone
    ) {
      return NextResponse.json(
        { error: "Customer information is incomplete." },
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
        { error: "Delivery information is incomplete." },
        { status: 400 }
      );
    }

    if (!body.items?.length) {
      return NextResponse.json(
        { error: "Your basket is empty." },
        { status: 400 }
      );
    }

    for (const item of body.items) {
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Invalid product quantity." },
          { status: 400 }
        );
      }
    }

    const orderNumber = `BKT-${Date.now()
      .toString()
      .slice(-8)}`;

    const order = await prisma.$transaction(async (tx) => {
      /*
       * Verify every product against the CURRENT database stock.
       */
      const products = await tx.product.findMany({
        where: {
          id: {
            in: body.items.map((item) => item.productId),
          },
          isActive: true,
        },
      });

      const productMap = new Map(
        products.map((product) => [product.id, product])
      );

      /*
       * Validate stock and product prices from the database.
       */
      for (const item of body.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new Error(
            `PRODUCT_NOT_FOUND:${item.productId}`
          );
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK:${product.name}:${product.stock}`
          );
        }
      }

      /*
       * Use database prices rather than trusting prices
       * sent by the browser.
       */
      const subtotal = body.items.reduce(
        (sum, item) => {
          const product = productMap.get(item.productId)!;

          return (
            sum +
            product.price * item.quantity
          );
        },
        0
      );

      const deliveryFee =
        subtotal >= 50 || subtotal === 0
          ? 0
          : 4.99;

      const total = subtotal + deliveryFee;

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

      /*
       * Reduce stock automatically.
       */
      for (const item of body.items) {
  const product = productMap.get(item.productId);

  if (!product) {
    throw new Error(
      `PRODUCT_NOT_FOUND:${item.productId}`
    );
  }

  const updatedProduct = await tx.product.updateMany({
    where: {
      id: product.id,
      isActive: true,
      stock: {
        gte: item.quantity,
      },
    },
    data: {
      stock: {
        decrement: item.quantity,
      },
    },
  });

  if (updatedProduct.count !== 1) {
    throw new Error(
      `INSUFFICIENT_STOCK:${product.name}:${product.stock}`
    );
  }
}

      /*
       * Create the order using trusted database values.
       */
      return tx.order.create({
        data: {
          orderNumber,

          customerId: customer.id,

          subtotal,
          deliveryFee,
          total,

          deliveryAddress: body.delivery.address,
          deliveryArea: body.delivery.area,
          deliveryCity: body.delivery.city,
          deliveryNotes:
            body.delivery.notes || null,
          deliveryTime: body.delivery.time,

          paymentStatus: "COD",

          items: {
            create: body.items.map((item) => {
              const product =
                productMap.get(item.productId)!;

              return {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
              };
            }),
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
    });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    if (
      error instanceof Error &&
      error.message.startsWith("PRODUCT_NOT_FOUND:")
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
      error.message.startsWith("INSUFFICIENT_STOCK:")
    ) {
      const [, productName, availableStock] =
        error.message.split(":");

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

    return NextResponse.json(
      {
        error: "Unable to create order.",
      },
      { status: 500 }
    );
  }
}