import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof orderStatuses)[number];

const deliveryStatusMap = {
  PENDING: "PENDING",
  CONFIRMED: "ASSIGNED",
  PREPARING: "ASSIGNED",
  READY_FOR_PICKUP: "ASSIGNED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "PENDING",
} as const;

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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const orderId = body.orderId as string;
    const status = body.status as OrderStatus;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          error: "Order ID and status are required.",
        },
        { status: 400 }
      );
    }

    if (!orderStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        delivery: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (
      existingOrder.status === "DELIVERED" ||
      existingOrder.status === "CANCELLED"
    ) {
      return NextResponse.json(
        {
          error: `This order is already ${existingOrder.status.toLowerCase()} and cannot be changed.`,
        },
        { status: 400 }
      );
    }

    const deliveryStatus = deliveryStatusMap[status];

    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status,
        },
        include: {
          customer: true,
          items: true,
          delivery: true,
        },
      });

      if (existingOrder.delivery) {
        await tx.delivery.update({
          where: {
            orderId,
          },
          data: {
            status: deliveryStatus,
            ...(status === "DELIVERED"
              ? {
                  deliveredAt: new Date(),
                }
              : {}),
            ...(status === "OUT_FOR_DELIVERY"
              ? {
                  pickedUpAt:
                    existingOrder.delivery.pickedUpAt ??
                    new Date(),
                }
              : {}),
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return NextResponse.json(
      {
        error: "Unable to update order status.",
      },
      { status: 500 }
    );
  }
}