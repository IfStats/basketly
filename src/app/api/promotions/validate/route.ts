import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type CustomerSegment =
  | "NEW"
  | "RETURNING"
  | "VIP"
  | "AT_RISK"
  | "INACTIVE";

function getCustomerSegment({
  totalOrders,
  lifetimeSpend,
  lastOrderAt,
}: {
  totalOrders: number;
  lifetimeSpend: number;
  lastOrderAt: Date | null;
}): CustomerSegment {
  const daysSinceLastOrder =
    lastOrderAt
      ? Math.floor(
          (Date.now() -
            lastOrderAt.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  if (lifetimeSpend >= 250) {
    return "VIP";
  }

  if (
    daysSinceLastOrder !== null &&
    daysSinceLastOrder >= 60
  ) {
    return "INACTIVE";
  }

  if (
    daysSinceLastOrder !== null &&
    daysSinceLastOrder >= 30
  ) {
    return "AT_RISK";
  }

  if (totalOrders > 1) {
    return "RETURNING";
  }

  return "NEW";
}

function calculateDiscount({
  type,
  value,
  subtotal,
  deliveryFee,
  maximumDiscount,
}: {
  type:
    | "PERCENTAGE"
    | "FIXED_AMOUNT"
    | "FREE_DELIVERY";
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

  return Number(
    Math.max(
      0,
      discount
    ).toFixed(2)
  );
}

export async function POST(
  request: Request
) {
  const prisma = getPrisma();

  try {
    const body =
      (await request.json()) as {
        code?: unknown;
        subtotal?: unknown;
        deliveryFee?: unknown;
        email?: unknown;
      };

    const code =
      typeof body.code === "string"
        ? body.code
            .trim()
            .toUpperCase()
        : "";

    const subtotal = Number(
      body.subtotal
    );

    const deliveryFee = Number(
      body.deliveryFee
    );

    const email =
      typeof body.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    if (!code) {
      return NextResponse.json(
        {
          error:
            "Enter a promotion code.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(subtotal) ||
      subtotal < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid order subtotal.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(deliveryFee) ||
      deliveryFee < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid delivery fee.",
        },
        { status: 400 }
      );
    }

    const promotion =
      await prisma.promotion.findUnique({
        where: {
          code,
        },
      });

    if (!promotion) {
      return NextResponse.json(
        {
          error:
            "That promotion code is not valid.",
        },
        { status: 404 }
      );
    }

    const now = new Date();

    if (!promotion.active) {
      return NextResponse.json(
        {
          error:
            "That promotion is currently inactive.",
        },
        { status: 400 }
      );
    }

    if (promotion.startsAt > now) {
      return NextResponse.json(
        {
          error:
            "That promotion is not active yet.",
        },
        { status: 400 }
      );
    }

    if (
      promotion.endsAt &&
      promotion.endsAt < now
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
      promotion.usageLimit !== null &&
      promotion.usageCount >=
        promotion.usageLimit
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
      promotion.minimumOrder !== null &&
      subtotal <
        promotion.minimumOrder
    ) {
      return NextResponse.json(
        {
          error:
            `This promotion requires a minimum order of $${promotion.minimumOrder.toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    let customerSegment:
      | CustomerSegment
      | null = null;

    if (
      promotion.targetSegment &&
      email
    ) {
      const customer =
        await prisma.customer.findUnique({
          where: {
            email,
          },
          include: {
            orders: {
              select: {
                total: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        });

      if (customer) {
        const lifetimeSpend =
          customer.orders.reduce(
            (sum, order) =>
              sum + order.total,
            0
          );

        const lastOrderAt =
          customer.orders[0]
            ?.createdAt ?? null;

        customerSegment =
          getCustomerSegment({
            totalOrders:
              customer.orders.length,
            lifetimeSpend,
            lastOrderAt,
          });
      } else {
        customerSegment = "NEW";
      }

      if (
        customerSegment !==
        promotion.targetSegment
      ) {
        return NextResponse.json(
          {
            error:
              "This promotion is not available for your customer segment.",
          },
          { status: 400 }
        );
      }
    }

    const discount =
      calculateDiscount({
        type: promotion.type,
        value: promotion.value,
        subtotal,
        deliveryFee,
        maximumDiscount:
          promotion.maximumDiscount,
      });

    const newDeliveryFee =
      promotion.type ===
      "FREE_DELIVERY"
        ? 0
        : deliveryFee;

    const total = Number(
      Math.max(
        0,
        subtotal +
          newDeliveryFee -
          discount
      ).toFixed(2)
    );

    return NextResponse.json({
      success: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
        targetSegment:
          promotion.targetSegment,
        customerSegment,
      },
      discount,
      deliveryFee: newDeliveryFee,
      total,
    });
  } catch (error) {
    console.error(
      "Promotion validation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to validate promotion.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}