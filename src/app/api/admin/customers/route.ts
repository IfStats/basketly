import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

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
  const now = Date.now();

  const daysSinceLastOrder = lastOrderAt
    ? Math.floor(
        (now - lastOrderAt.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  if (lifetimeSpend >= 250) {
    return "VIP";
  }

  if (daysSinceLastOrder !== null && daysSinceLastOrder >= 60) {
    return "INACTIVE";
  }

  if (
    daysSinceLastOrder !== null &&
    daysSinceLastOrder >= 30
  ) {
    return "AT_RISK";
  }

  if (totalOrders <= 1) {
    return "NEW";
  }

  return "RETURNING";
}

export async function GET(request: Request) {
  try {
    const authenticated = await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() ?? "";

    const segment =
      searchParams.get("segment") ?? "ALL";

    const sort =
      searchParams.get("sort") ?? "recent";

    const customers =
      await prisma.customer.findMany({
        where: search
          ? {
              OR: [
                {
                  firstName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  phone: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : undefined,

        orderBy: {
          updatedAt: "desc",
        },

        include: {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    const result = customers
      .map((customer) => {
        const totalOrders =
          customer.orders.length;

        const lifetimeSpend =
          customer.orders.reduce(
            (sum, order) =>
              sum + order.total,
            0
          );

        const averageOrderValue =
          totalOrders > 0
            ? lifetimeSpend / totalOrders
            : 0;

        const lastOrder =
          customer.orders[0] ?? null;

        const customerSegment =
          getCustomerSegment({
            totalOrders,
            lifetimeSpend,
            lastOrderAt:
              lastOrder?.createdAt ?? null,
          });

        return {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
          totalOrders,
          lifetimeSpend,
          averageOrderValue,
          lastOrderAt:
            lastOrder?.createdAt ?? null,
          lastOrderNumber:
            lastOrder?.orderNumber ?? null,
          segment: customerSegment,
          orders: customer.orders,
        };
      })
      .filter((customer) => {
        if (segment === "ALL") {
          return true;
        }

        return customer.segment === segment;
      })
      .sort((a, b) => {
        switch (sort) {
          case "spend":
            return (
              b.lifetimeSpend -
              a.lifetimeSpend
            );

          case "orders":
            return (
              b.totalOrders -
              a.totalOrders
            );

          case "name":
            return `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`
            );

          case "recent":
          default: {
            const aTime = a.lastOrderAt
              ? new Date(
                  a.lastOrderAt
                ).getTime()
              : 0;

            const bTime = b.lastOrderAt
              ? new Date(
                  b.lastOrderAt
                ).getTime()
              : 0;

            return bTime - aTime;
          }
        }
      });

    const counts = {
      ALL: result.length,
      NEW: result.filter(
        (customer) =>
          customer.segment === "NEW"
      ).length,
      RETURNING: result.filter(
        (customer) =>
          customer.segment ===
          "RETURNING"
      ).length,
      VIP: result.filter(
        (customer) =>
          customer.segment === "VIP"
      ).length,
      AT_RISK: result.filter(
        (customer) =>
          customer.segment === "AT_RISK"
      ).length,
      INACTIVE: result.filter(
        (customer) =>
          customer.segment ===
          "INACTIVE"
      ).length,
    };

    return NextResponse.json({
      success: true,
      customers: result,
      counts,
    });
  } catch (error) {
    console.error(
      "Admin customers GET error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load customers.",
      },
      { status: 500 }
    );
  }
}