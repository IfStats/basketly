import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  void request;

  const prisma = getPrisma();

  try {
    const authenticated = await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Categories GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load categories.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const prisma = getPrisma();

  try {
    const authenticated = await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error: "Category name is required.",
        },
        { status: 400 }
      );
    }

    const slug =
      typeof body.slug === "string" &&
      body.slug.trim()
        ? slugify(body.slug)
        : slugify(name);

    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "A category with this name or slug already exists.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description:
          typeof body.description === "string"
            ? body.description.trim() || null
            : null,
        image:
          typeof body.image === "string"
            ? body.image.trim() || null
            : null,
        sortOrder:
          Number.isInteger(body.sortOrder)
            ? body.sortOrder
            : 0,
        isActive:
          typeof body.isActive === "boolean"
            ? body.isActive
            : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Categories POST error:", error);

    return NextResponse.json(
      {
        error: "Unable to create category.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: Request) {
  const prisma = getPrisma();

  try {
    const authenticated = await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existing.name;

    const slug =
      typeof body.slug === "string" &&
      body.slug.trim()
        ? slugify(body.slug)
        : existing.slug;

    const duplicate = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug },
        ],
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "Another category already uses this name or slug.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description:
          typeof body.description === "string"
            ? body.description.trim() || null
            : existing.description,
        image:
          typeof body.image === "string"
            ? body.image.trim() || null
            : existing.image,
        sortOrder:
          Number.isInteger(body.sortOrder)
            ? body.sortOrder
            : existing.sortOrder,
        isActive:
          typeof body.isActive === "boolean"
            ? body.isActive
            : existing.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Categories PATCH error:", error);

    return NextResponse.json(
      {
        error: "Unable to update category.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  const prisma = getPrisma();

  try {
    const authenticated = await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Categories DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to delete category.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}