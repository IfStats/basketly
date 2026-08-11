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

/**
 * GET /api/admin/orders
 *
 * Returns the latest orders for the admin dashboard.
 */
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
        items: true,
        delivery: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch admin orders error:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch orders.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/orders
 *
 * Creates a new customer order.
 */
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

    const orderNumber = `BKT-${Date.now()
      .toString()
      .slice(-8)}`;

    const customer = await prisma.customer.upsert({
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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,

        subtotal: body.subtotal,
        deliveryFee: body.deliveryFee,
        total: body.total,

        deliveryAddress: body.delivery.address,
        deliveryArea: body.delivery.area,
        deliveryCity: body.delivery.city,
        deliveryNotes: body.delivery.notes || null,
        deliveryTime: body.delivery.time,

        paymentStatus: "COD",

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

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        error: "Unable to create order.",
      },
      { status: 500 }
    );
  }
}