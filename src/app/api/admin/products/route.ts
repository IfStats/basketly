import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProductInput = {
  name?: string;
  slug?: string;
  description?: string | null;
  category?: string;
  unit?: string;
  price?: number;
  image?: string | null;
  badge?: string | null;
  stock?: number;
  isActive?: boolean;
  featured?: boolean;
};

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Fetch admin products error:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch products.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductInput;

    if (
      !body.name?.trim() ||
      !body.slug?.trim() ||
      !body.category?.trim() ||
      !body.unit?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Name, slug, category and unit are required.",
        },
        { status: 400 }
      );
    }

    if (
      body.price === undefined ||
      Number.isNaN(Number(body.price)) ||
      Number(body.price) < 0
    ) {
      return NextResponse.json(
        {
          error: "A valid product price is required.",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug: body.slug.trim(),
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          error: "A product with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
        description: body.description?.trim() || null,
        category: body.category.trim(),
        unit: body.unit.trim(),
        price: Number(body.price),
        image: body.image?.trim() || null,
        badge: body.badge?.trim() || null,
        stock:
          body.stock !== undefined
            ? Math.max(0, Number(body.stock))
            : 0,
        isActive:
          body.isActive !== undefined
            ? Boolean(body.isActive)
            : true,
        featured:
          body.featured !== undefined
            ? Boolean(body.featured)
            : false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin product error:", error);

    return NextResponse.json(
      {
        error: "Unable to create product.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as ProductInput & {
      id?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        {
          error: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: body.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: {
        id: body.id,
      },
      data: {
        ...(body.name !== undefined && {
          name: body.name.trim(),
        }),
        ...(body.slug !== undefined && {
          slug: body.slug.trim(),
        }),
        ...(body.description !== undefined && {
          description:
            body.description?.trim() || null,
        }),
        ...(body.category !== undefined && {
          category: body.category.trim(),
        }),
        ...(body.unit !== undefined && {
          unit: body.unit.trim(),
        }),
        ...(body.price !== undefined && {
          price: Number(body.price),
        }),
        ...(body.image !== undefined && {
          image: body.image?.trim() || null,
        }),
        ...(body.badge !== undefined && {
          badge: body.badge?.trim() || null,
        }),
        ...(body.stock !== undefined && {
          stock: Math.max(0, Number(body.stock)),
        }),
        ...(body.isActive !== undefined && {
          isActive: Boolean(body.isActive),
        }),
        ...(body.featured !== undefined && {
          featured: Boolean(body.featured),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Update admin product error:", error);

    return NextResponse.json(
      {
        error: "Unable to update product.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        {
          error: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: body.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        { status: 404 }
      );
    }

    const orderItemCount =
      await prisma.orderItem.count({
        where: {
          productId: body.id,
        },
      });

    if (orderItemCount > 0) {
      const product = await prisma.product.update({
        where: {
          id: body.id,
        },
        data: {
          isActive: false,
        },
      });

      return NextResponse.json({
        success: true,
        softDeleted: true,
        product,
      });
    }

    await prisma.product.delete({
      where: {
        id: body.id,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: true,
    });
  } catch (error) {
    console.error("Delete admin product error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete product.",
      },
      { status: 500 }
    );
  }
}