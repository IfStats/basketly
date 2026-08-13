import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  requireAdminSession,
} from "@/lib/admin-auth";

type RawRow = Record<string, unknown>;

type NormalizedProduct = {
  name: string;
  category: string;
  unit: string;
  price: number | null;
  stock: number;
  description: string | null;
  image: string | null;
  badge: string | null;
  featured: boolean;
  isActive: boolean;
};

const fieldAliases: Record<
  keyof NormalizedProduct,
  string[]
> = {
  name: [
    "name",
    "product",
    "product name",
    "product_name",
    "title",
    "item",
    "item name",
    "item_name",
  ],
  category: [
    "category",
    "categories",
    "department",
    "group",
    "product category",
    "product_category",
  ],
  unit: [
    "unit",
    "size",
    "pack",
    "pack size",
    "pack_size",
    "quantity unit",
    "weight",
  ],
  price: [
    "price",
    "selling price",
    "selling_price",
    "sale price",
    "sale_price",
    "retail price",
    "retail_price",
    "unit price",
    "unit_price",
  ],
  stock: [
    "stock",
    "inventory",
    "quantity",
    "qty",
    "units",
    "available",
    "stock quantity",
    "stock_quantity",
  ],
  description: [
    "description",
    "details",
    "product description",
    "product_description",
  ],
  image: [
    "image",
    "image url",
    "image_url",
    "photo",
    "photo url",
    "photo_url",
    "picture",
  ],
  badge: [
    "badge",
    "tag",
    "label",
    "product badge",
    "product_badge",
  ],
  featured: [
    "featured",
    "is featured",
    "is_featured",
    "highlight",
  ],
  isActive: [
    "active",
    "is active",
    "is_active",
    "enabled",
    "available online",
  ],
};

function cleanKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[-_]+/g, " ");
}

function findColumn(
  headers: string[],
  field: keyof NormalizedProduct
) {
  const aliases = fieldAliases[field];

  for (const header of headers) {
    const normalizedHeader = cleanKey(header);

    if (aliases.includes(normalizedHeader)) {
      return header;
    }
  }

  for (const header of headers) {
    const normalizedHeader = cleanKey(header);

    const match = aliases.some(
      (alias) =>
        normalizedHeader.includes(alias) ||
        alias.includes(normalizedHeader)
    );

    if (match) {
      return header;
    }
  }

  return null;
}

function textValue(value: unknown) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

function parseNumber(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned = String(value)
    .replace(/[$€£,\s]/g, "")
    .trim();

  const parsed = Number(cleaned);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function parseBoolean(
  value: unknown,
  defaultValue: boolean
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return defaultValue;
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  if (
    ["true", "1", "yes", "y", "on"].includes(
      normalized
    )
  ) {
    return true;
  }

  if (
    ["false", "0", "no", "n", "off"].includes(
      normalized
    )
  ) {
    return false;
  }

  return defaultValue;
}

function normalizeRow(
  row: RawRow,
  mapping: Record<
    keyof NormalizedProduct,
    string | null
  >
): NormalizedProduct {
  const read = (
    field: keyof NormalizedProduct
  ) => {
    const column = mapping[field];

    return column
      ? row[column]
      : undefined;
  };

  const price = parseNumber(read("price"));
  const stockValue = parseNumber(
    read("stock")
  );

  return {
    name: textValue(read("name")),
    category: textValue(read("category")),
    unit: textValue(read("unit")),
    price,
    stock:
      stockValue !== null
        ? Math.max(
            0,
            Math.floor(stockValue)
          )
        : 0,
    description:
      textValue(read("description")) ||
      null,
    image:
      textValue(read("image")) || null,
    badge:
      textValue(read("badge")) || null,
    featured: parseBoolean(
      read("featured"),
      false
    ),
    isActive: parseBoolean(
      read("isActive"),
      true
    ),
  };
}

function detectFileType(
  filename: string
) {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  if (
    ["xlsx", "xls"].includes(extension)
  ) {
    return "spreadsheet";
  }

  if (extension === "csv") {
    return "csv";
  }

  if (extension === "json") {
    return "json";
  }

  return null;
}

export async function POST(
  request: Request
) {
  try {
    const authenticated =
      await requireAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const formData =
      await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "A catalog file is required.",
        },
        { status: 400 }
      );
    }

    const fileType = detectFileType(
      file.name
    );

    if (!fileType) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Use CSV, XLSX, XLS or JSON.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "The uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "File is too large. Maximum size is 10 MB.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    let rows: RawRow[] = [];

    if (fileType === "json") {
      const text =
        buffer.toString("utf8");

      let parsed: unknown;

      try {
        parsed = JSON.parse(text);
      } catch {
        return NextResponse.json(
          {
            error:
              "The JSON file is invalid.",
          },
          { status: 400 }
        );
      }

      if (!Array.isArray(parsed)) {
        return NextResponse.json(
          {
            error:
              "JSON catalog must contain an array of products.",
          },
          { status: 400 }
        );
      }

      rows = parsed.filter(
        (
          value
        ): value is RawRow =>
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
      );
    } else {
      const workbook =
        XLSX.read(buffer, {
          type: "buffer",
          cellDates: true,
        });

      const firstSheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      if (!firstSheet) {
        return NextResponse.json(
          {
            error:
              "The spreadsheet contains no worksheets.",
          },
          { status: 400 }
        );
      }

      rows =
        XLSX.utils.sheet_to_json<RawRow>(
          firstSheet,
          {
            defval: "",
            raw: false,
          }
        );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "No product rows were detected.",
        },
        { status: 400 }
      );
    }

    const headers = Array.from(
      new Set(
        rows.flatMap((row) =>
          Object.keys(row)
        )
      )
    );

    const fields: (keyof NormalizedProduct)[] =
      [
        "name",
        "category",
        "unit",
        "price",
        "stock",
        "description",
        "image",
        "badge",
        "featured",
        "isActive",
      ];

    const mapping = Object.fromEntries(
      fields.map((field) => [
        field,
        findColumn(headers, field),
      ])
    ) as Record<
      keyof NormalizedProduct,
      string | null
    >;

    const normalized = rows.map(
      (row, index) => ({
        rowNumber: index + 2,
        product: normalizeRow(
          row,
          mapping
        ),
      })
    );

    const validation = normalized.map(
      ({ rowNumber, product }) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!product.name) {
          errors.push(
            "Product name is missing."
          );
        }

        if (!product.category) {
          errors.push(
            "Category is missing."
          );
        }

        if (!product.unit) {
          errors.push(
            "Unit / size is missing."
          );
        }

        if (
          product.price === null
        ) {
          warnings.push(
            "Price is missing."
          );
        } else if (
          product.price < 0
        ) {
          errors.push(
            "Price cannot be negative."
          );
        }

        if (
          !Number.isInteger(
            product.stock
          ) ||
          product.stock < 0
        ) {
          errors.push(
            "Stock must be a non-negative integer."
          );
        }

        return {
          rowNumber,
          product,
          errors,
          warnings,
          valid: errors.length === 0,
        };
      }
    );

    const validCount =
      validation.filter(
        (item) => item.valid
      ).length;

    const invalidCount =
      validation.length -
      validCount;

    const warningCount =
      validation.filter(
        (item) =>
          item.warnings.length > 0
      ).length;

    const duplicateNames =
      new Set<string>();

    const duplicates = new Set<
      number
    >();

    for (const item of validation) {
      const key =
        item.product.name
          .trim()
          .toLowerCase();

      if (!key) {
        continue;
      }

      if (duplicateNames.has(key)) {
        duplicates.add(
          item.rowNumber
        );
      } else {
        duplicateNames.add(key);
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: fileType,
      },
      summary: {
        rowsDetected: rows.length,
        valid: validCount,
        invalid: invalidCount,
        warnings: warningCount,
        duplicates: duplicates.size,
      },
      headers,
      mapping,
      preview: validation
        .slice(0, 100)
        .map((item) => ({
          rowNumber: item.rowNumber,
          product: item.product,
          errors: item.errors,
          warnings: item.warnings,
          duplicate: duplicates.has(
            item.rowNumber
          ),
          valid: item.valid,
        })),
    });
  } catch (error) {
    console.error(
      "Catalog analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to analyze the catalog file.",
      },
      { status: 500 }
    );
  }
}