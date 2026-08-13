import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const authenticated = await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const [promotions, orders] =
      await Promise.all([
        prisma.promotion.findMany({
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            value: true,
            usageLimit: true,
            usageCount: true,
            active: true,
            startsAt: true,
            endsAt: true,
          },
        }),

        prisma.order.findMany({
          where: {
            promotionCode: {
              not: null,
            },
          },
          select: {
            promotionCode: true,
            discount: true,
            total: true,
            subtotal: true,
            createdAt: true,
          },
        }),
      ]);

    const performance = promotions.map(
      (promotion) => {
        const promotionOrders =
          orders.filter(
            (order) =>
              order.promotionCode ===
              promotion.code
          );

        const redemptions =
          promotionOrders.length;

        const discountGranted =
          promotionOrders.reduce(
            (sum, order) =>
              sum + order.discount,
            0
          );

        const attributedRevenue =
          promotionOrders.reduce(
            (sum, order) =>
              sum + order.total,
            0
          );

        const averageOrderValue =
          redemptions > 0
            ? attributedRevenue /
              redemptions
            : 0;

        const averageDiscount =
          redemptions > 0
            ? discountGranted /
              redemptions
            : 0;

        const usageRate =
          promotion.usageLimit &&
          promotion.usageLimit > 0
            ? (redemptions /
                promotion.usageLimit) *
              100
            : null;

        return {
          id: promotion.id,
          name: promotion.name,
          code: promotion.code,
          type: promotion.type,
          value: promotion.value,
          active: promotion.active,
          startsAt: promotion.startsAt,
          endsAt: promotion.endsAt,
          usageLimit:
            promotion.usageLimit,
          usageCount:
            promotion.usageCount,

          redemptions,

          discountGranted: Number(
            discountGranted.toFixed(2)
          ),

          attributedRevenue: Number(
            attributedRevenue.toFixed(2)
          ),

          averageOrderValue: Number(
            averageOrderValue.toFixed(2)
          ),

          averageDiscount: Number(
            averageDiscount.toFixed(2)
          ),

          usageRate:
            usageRate === null
              ? null
              : Number(
                  usageRate.toFixed(1)
                ),
        };
      }
    );

    const totalRedemptions =
      orders.length;

    const totalDiscountGranted =
      orders.reduce(
        (sum, order) =>
          sum + order.discount,
        0
      );

    const attributedRevenue =
      orders.reduce(
        (sum, order) =>
          sum + order.total,
        0
      );

    const averageOrderValue =
      totalRedemptions > 0
        ? attributedRevenue /
          totalRedemptions
        : 0;

    const topPromotion =
      [...performance].sort(
        (a, b) =>
          b.attributedRevenue -
          a.attributedRevenue
      )[0] ?? null;

    return NextResponse.json({
      success: true,

      summary: {
        totalRedemptions,

        totalDiscountGranted:
          Number(
            totalDiscountGranted.toFixed(
              2
            )
          ),

        attributedRevenue: Number(
          attributedRevenue.toFixed(2)
        ),

        averageOrderValue: Number(
          averageOrderValue.toFixed(2)
        ),

        activePromotions:
          promotions.filter(
            (promotion) =>
              promotion.active
          ).length,

        topPromotion,
      },

      promotions: performance,
    });
  } catch (error) {
    console.error(
      "Promotion analytics error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load promotion analytics.",
      },
      { status: 500 }
    );
  }
}