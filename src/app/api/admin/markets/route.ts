import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

type MarketUpdateInput = {
  id?: string;
  name?: string;
  currency?: string;
  locale?: string;
  callingCode?: string | null;
  flag?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  deliveryEnabled?: boolean;
  baseDeliveryFee?: number;
  freeDeliveryThreshold?: number | null;
};

function normalizeNullableString(
  value: unknown
) {
  if (value === null) {
    return null;
  }

  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

export async function GET() {
  const authenticated =
    await requireAdminSession();

  if (!authenticated) {
    return NextResponse.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  const prisma = getPrisma();

  try {
    const markets =
      await prisma.market.findMany({
        orderBy: [
          {
            isDefault: "desc",
          },
          {
            isActive: "desc",
          },
          {
            name: "asc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      markets,
    });
  } catch (error) {
    console.error(
      "Markets GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load markets.",
      },
      {
        status: 500,
      }
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
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  const prisma = getPrisma();

  try {
    const body =
      (await request.json()) as MarketUpdateInput;

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Market ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.market.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Market not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * V1 safeguard:
     * Basketly currently has one product-price
     * column, and those prices represent Ghana.
     *
     * Do not allow another market to become
     * operational until per-market pricing exists.
     */
    if (
      existing.code !== "GH" &&
      (
        body.isActive === true ||
        body.isDefault === true
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Additional markets require market-specific product pricing before activation.",
        },
        {
          status: 400,
        }
      );
    }

    const name =
      body.name !== undefined
        ? body.name.trim()
        : existing.name;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Market name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const currency =
      body.currency !== undefined
        ? body.currency
            .trim()
            .toUpperCase()
        : existing.currency;

    if (
      !/^[A-Z]{3}$/.test(
        currency
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Currency must be a valid 3-letter currency code.",
        },
        {
          status: 400,
        }
      );
    }

    const locale =
      body.locale !== undefined
        ? body.locale.trim()
        : existing.locale;

    if (!locale) {
      return NextResponse.json(
        {
          error:
            "Locale is required.",
        },
        {
          status: 400,
        }
      );
    }

    const baseDeliveryFee =
      body.baseDeliveryFee !==
      undefined
        ? Number(
            body.baseDeliveryFee
          )
        : existing.baseDeliveryFee;

    if (
      !Number.isFinite(
        baseDeliveryFee
      ) ||
      baseDeliveryFee < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Delivery fee must be zero or greater.",
        },
        {
          status: 400,
        }
      );
    }

    let freeDeliveryThreshold =
      existing.freeDeliveryThreshold;

    if (
      body.freeDeliveryThreshold ===
      null
    ) {
      freeDeliveryThreshold =
        null;
    } else if (
      body.freeDeliveryThreshold !==
      undefined
    ) {
      const threshold =
        Number(
          body.freeDeliveryThreshold
        );

      if (
        !Number.isFinite(
          threshold
        ) ||
        threshold < 0
      ) {
        return NextResponse.json(
          {
            error:
              "Free-delivery threshold must be zero or greater.",
          },
          {
            status: 400,
          }
        );
      }

      freeDeliveryThreshold =
        threshold;
    }

    const nextIsDefault =
      body.isDefault !== undefined
        ? body.isDefault
        : existing.isDefault;

    /*
     * A default market must always
     * also be active.
     */
    const nextIsActive =
      nextIsDefault
        ? true
        : body.isActive !==
            undefined
          ? body.isActive
          : existing.isActive;

    /*
     * Prevent removing the current default
     * directly. Making another market default
     * automatically removes it from the old one.
     */
    if (
      existing.isDefault &&
      body.isDefault === false
    ) {
      return NextResponse.json(
        {
          error:
            "Choose another default market before removing the current default.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * V1 Ghana protection.
     * Until market-specific product pricing
     * exists, Ghana remains the default market.
     */
    if (
      existing.code === "GH" &&
      (
        nextIsDefault === false ||
        nextIsActive === false
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Ghana must remain the active default market until additional market pricing is implemented.",
        },
        {
          status: 400,
        }
      );
    }

    const market =
      await prisma.$transaction(
        async (tx) => {
          if (nextIsDefault) {
            await tx.market.updateMany({
              where: {
                id: {
                  not: id,
                },
              },

              data: {
                isDefault: false,
              },
            });
          }

          return tx.market.update({
            where: {
              id,
            },

            data: {
              name,
              currency,
              locale,

              callingCode:
                body.callingCode !==
                undefined
                  ? normalizeNullableString(
                      body.callingCode
                    )
                  : existing.callingCode,

              flag:
                body.flag !==
                undefined
                  ? normalizeNullableString(
                      body.flag
                    )
                  : existing.flag,

              isActive:
                nextIsActive,

              isDefault:
                nextIsDefault,

              deliveryEnabled:
                body.deliveryEnabled !==
                undefined
                  ? body.deliveryEnabled
                  : existing.deliveryEnabled,

              baseDeliveryFee,

              freeDeliveryThreshold,
            },
          });
        }
      );

    return NextResponse.json({
      success: true,
      market,
    });
  } catch (error) {
    console.error(
      "Markets PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update market.",
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}