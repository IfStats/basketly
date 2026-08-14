import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

const promotionTypes = [
  "PERCENTAGE",
  "FIXED_AMOUNT",
  "FREE_DELIVERY",
] as const;

type PromotionType =
  (typeof promotionTypes)[number];

function normalizeCode(value: unknown) {
  return typeof value === "string"
    ? value.trim().toUpperCase()
    : "";
}

function parseOptionalNumber(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function parseOptionalInt(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed)
    ? parsed
    : null;
}

function isPromotionType(
  value: unknown
): value is PromotionType {
  return (
    typeof value === "string" &&
    promotionTypes.includes(
      value as PromotionType
    )
  );
}

function validatePromotionInput(
  body: Record<string, unknown>
) {
  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  const code = normalizeCode(body.code);

  const type = body.type;

  const value = Number(body.value);

  const minimumOrder =
    parseOptionalNumber(
      body.minimumOrder
    );

  const maximumDiscount =
    parseOptionalNumber(
      body.maximumDiscount
    );

  const usageLimit =
    parseOptionalInt(
      body.usageLimit
    );

  const targetSegment =
    typeof body.targetSegment === "string" &&
    body.targetSegment.trim()
      ? body.targetSegment
          .trim()
          .toUpperCase()
      : null;

  const startsAt =
    typeof body.startsAt === "string"
      ? new Date(body.startsAt)
      : null;

  const endsAt =
    typeof body.endsAt === "string" &&
    body.endsAt.trim()
      ? new Date(body.endsAt)
      : null;

  const active =
    typeof body.active === "boolean"
      ? body.active
      : true;

  const errors: string[] = [];

  if (!name) {
    errors.push(
      "Promotion name is required."
    );
  }

  if (!code) {
    errors.push(
      "Promotion code is required."
    );
  }

  if (
    !/^[A-Z0-9_-]{3,40}$/.test(code)
  ) {
    errors.push(
      "Promotion code must be 3-40 characters and contain only letters, numbers, hyphens or underscores."
    );
  }

  if (!isPromotionType(type)) {
    errors.push(
      "A valid promotion type is required."
    );
  }

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    errors.push(
      "Promotion value must be zero or greater."
    );
  }

  if (
    type === "PERCENTAGE" &&
    value > 100
  ) {
    errors.push(
      "Percentage discounts cannot exceed 100%."
    );
  }

  if (
    minimumOrder !== null &&
    minimumOrder < 0
  ) {
    errors.push(
      "Minimum order cannot be negative."
    );
  }

  if (
    maximumDiscount !== null &&
    maximumDiscount < 0
  ) {
    errors.push(
      "Maximum discount cannot be negative."
    );
  }

  if (
    usageLimit !== null &&
    usageLimit < 1
  ) {
    errors.push(
      "Usage limit must be at least 1."
    );
  }

  if (
    !startsAt ||
    Number.isNaN(startsAt.getTime())
  ) {
    errors.push(
      "A valid start date is required."
    );
  }

  if (
    endsAt &&
    Number.isNaN(endsAt.getTime())
  ) {
    errors.push(
      "End date must be valid."
    );
  }

  if (
    startsAt &&
    endsAt &&
    endsAt <= startsAt
  ) {
    errors.push(
      "End date must be later than start date."
    );
  }

  if (
    type === "FREE_DELIVERY" &&
    value !== 0
  ) {
    errors.push(
      "Free delivery promotions should have a value of 0."
    );
  }

  return {
    errors,
    data: {
      name,
      code,
      type: type as PromotionType,
      value,
      minimumOrder,
      maximumDiscount,
      startsAt: startsAt as Date,
      endsAt,
      usageLimit,
      targetSegment,
      active,
    },
  };
}

export async function GET(
  request: Request
) {
  const authenticated =
    await requireAdminSession();

  if (!authenticated) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const prisma = getPrisma();

  try {
    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() ?? "";

    const status =
      searchParams.get("status") ?? "ALL";

    const now = new Date();

    const where = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              code: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : undefined;

    const promotions =
      await prisma.promotion.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

    const filtered = promotions.filter(
      (promotion) => {
        const currentlyActive =
          promotion.active &&
          promotion.startsAt <= now &&
          (!promotion.endsAt ||
            promotion.endsAt >= now) &&
          (!promotion.usageLimit ||
            promotion.usageCount <
              promotion.usageLimit);

        const scheduled =
          promotion.active &&
          promotion.startsAt > now;

        const expired =
          Boolean(
            promotion.endsAt &&
              promotion.endsAt < now
          ) ||
          Boolean(
            promotion.usageLimit &&
              promotion.usageCount >=
                promotion.usageLimit
          );

        switch (status) {
          case "ACTIVE":
            return currentlyActive;

          case "SCHEDULED":
            return scheduled;

          case "EXPIRED":
            return expired;

          case "INACTIVE":
            return !promotion.active;

          default:
            return true;
        }
      }
    );

    return NextResponse.json({
      success: true,
      promotions: filtered,
    });
  } catch (error) {
    console.error(
      "Admin promotions GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load promotions.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
  request: Request
) {
  const authenticated =
    await requireAdminSession();

  if (!authenticated) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const prisma = getPrisma();

  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const {
      errors,
      data,
    } = validatePromotionInput(body);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: errors[0],
          errors,
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.promotion.findUnique({
        where: {
          code: data.code,
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A promotion with this code already exists.",
        },
        { status: 409 }
      );
    }

    const promotion =
      await prisma.promotion.create({
        data: {
          name: data.name,
          code: data.code,
          type: data.type,
          value: data.value,
          minimumOrder:
            data.minimumOrder,
          maximumDiscount:
            data.maximumDiscount,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          usageLimit: data.usageLimit,
          targetSegment:
            data.targetSegment,
          active: data.active,
        },
      });

    return NextResponse.json(
      {
        success: true,
        promotion,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin promotions POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create promotion.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: Request
) {
  const authenticated =
    await requireAdminSession();

  if (!authenticated) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const prisma = getPrisma();

  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Promotion ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.promotion.findUnique({
        where: { id },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Promotion not found.",
        },
        { status: 404 }
      );
    }

    if (
      Object.keys(body).length === 2 &&
      typeof body.active === "boolean"
    ) {
      const promotion =
        await prisma.promotion.update({
          where: { id },
          data: {
            active: body.active,
          },
        });

      return NextResponse.json({
        success: true,
        promotion,
      });
    }

    const merged = {
      name:
        body.name ??
        existing.name,

      code:
        body.code ??
        existing.code,

      type:
        body.type ??
        existing.type,

      value:
        body.value ??
        existing.value,

      minimumOrder:
        body.minimumOrder ??
        existing.minimumOrder,

      maximumDiscount:
        body.maximumDiscount ??
        existing.maximumDiscount,

      startsAt:
        body.startsAt ??
        existing.startsAt.toISOString(),

      endsAt:
        body.endsAt !== undefined
          ? body.endsAt
          : existing.endsAt?.toISOString() ??
            null,

      usageLimit:
        body.usageLimit !== undefined
          ? body.usageLimit
          : existing.usageLimit,

      targetSegment:
        body.targetSegment !== undefined
          ? body.targetSegment
          : existing.targetSegment,

      active:
        body.active !== undefined
          ? body.active
          : existing.active,
    };

    const {
      errors,
      data,
    } =
      validatePromotionInput(
        merged
      );

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: errors[0],
          errors,
        },
        { status: 400 }
      );
    }

    if (
      data.code !== existing.code
    ) {
      const duplicate =
        await prisma.promotion.findUnique({
          where: {
            code: data.code,
          },
          select: {
            id: true,
          },
        });

      if (
        duplicate &&
        duplicate.id !== id
      ) {
        return NextResponse.json(
          {
            error:
              "A promotion with this code already exists.",
          },
          { status: 409 }
        );
      }
    }

    const promotion =
      await prisma.promotion.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          type: data.type,
          value: data.value,
          minimumOrder:
            data.minimumOrder,
          maximumDiscount:
            data.maximumDiscount,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          usageLimit: data.usageLimit,
          targetSegment:
            data.targetSegment,
          active: data.active,
        },
      });

    return NextResponse.json({
      success: true,
      promotion,
    });
  } catch (error) {
    console.error(
      "Admin promotions PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update promotion.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request
) {
  const authenticated =
    await requireAdminSession();

  if (!authenticated) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const prisma = getPrisma();

  try {
    const body =
      (await request.json()) as {
        id?: string;
      };

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Promotion ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.promotion.findUnique({
        where: { id },
        select: {
          id: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Promotion not found.",
        },
        { status: 404 }
      );
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Admin promotions DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete promotion.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}