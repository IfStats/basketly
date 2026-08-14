import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAdminSession } from "@/lib/admin-auth";

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

const fieldAliases: Record<keyof NormalizedProduct, string[]> = {
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

function cleanKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[-_]+/g, " ");
}

function findColumn(
  headers: string[],
  field: keyof NormalizedProduct
): string | null {
  const aliases = fieldAliases[field].map(cleanKey);

  // Exact match first.
  for (const header of headers) {
    if (aliases.includes(cleanKey(header))) {
      return header;
    }
  }

  // Then partial match.
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

function textValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parseNumber(value: unknown): number | null {
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

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(
  value: unknown,
  defaultValue: boolean
): boolean {
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
    [
      "true",
      "1",
      "yes",
      "y",
      "on",
      "active",
      "enabled",
      "featured",
    ].includes(normalized)
  ) {
    return true;
  }

  if (
    [
      "false",
      "0",
      "no",
      "n",
      "off",
      "inactive",
      "disabled",
      "not featured",
    ].includes(normalized)
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
  ): unknown => {
    const column = mapping[field];

    return column
      ? row[column]
      : undefined;
  };

  const price = parseNumber(read("price"));
  const stockValue = parseNumber(read("stock"));

  return {
    name: textValue(read("name")),

    category: textValue(read("category")),

    unit: textValue(read("unit")),

    price,

    stock:
      stockValue !== null
        ? Math.max(0, Math.floor(stockValue))
        : 0,

    description:
      textValue(read("description")) || null,

    image:
      textValue(read("image")) || null,

    badge:
      textValue(read("badge")) || null,

    /*
     * These fields are OPTIONAL in the uploaded catalog.
     *
     * If the columns do not exist:
     *
     * featured -> false
     * isActive -> true
     *
     * This means missing badge / featured / isActive
     * will NOT prevent the catalog from being analyzed.
     */
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
): "spreadsheet" | "csv" | "json" | null {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase() || "";

  if (
    extension === "xlsx" ||
    extension === "xls"
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
    /*
     * Admin authentication.
     */
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

    /*
     * Read multipart form data.
     */
    const formData =
      await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "A catalog file is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate file type.
     */
    const fileType = detectFileType(
      file.name
    );

    if (!fileType) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Use CSV, XLSX, XLS or JSON.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate file size.
     */
    if (file.size === 0) {
      return NextResponse.json(
        {
          error:
            "The uploaded file is empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "File is too large. Maximum size is 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Convert uploaded file to Buffer.
     */
    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    let rows: RawRow[] = [];

    /*
     * JSON import.
     */
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
          {
            status: 400,
          }
        );
      }

      if (!Array.isArray(parsed)) {
        return NextResponse.json(
          {
            error:
              "JSON catalog must contain an array of products.",
          },
          {
            status: 400,
          }
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
      /*
       * CSV / XLS / XLSX import.
       */
      let workbook: XLSX.WorkBook;

      try {
        workbook = XLSX.read(
          buffer,
          {
            type: "buffer",
            cellDates: true,
          }
        );
      } catch {
        return NextResponse.json(
          {
            error:
              "Unable to read the spreadsheet. Please check that the file is valid.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !workbook.SheetNames ||
        workbook.SheetNames.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "The spreadsheet contains no worksheets.",
          },
          {
            status: 400,
          }
        );
      }

      const firstSheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      if (!firstSheet) {
        return NextResponse.json(
          {
            error:
              "The spreadsheet contains no usable worksheet.",
          },
          {
            status: 400,
          }
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

    /*
     * Empty catalog check.
     */
    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "No product rows were detected.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Detect all available headers.
     */
    const headers = Array.from(
      new Set(
        rows.flatMap((row) =>
          Object.keys(row)
        )
      )
    );

    if (headers.length === 0) {
      return NextResponse.json(
        {
          error:
            "No catalog columns were detected.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Fields expected by Basketly.
     */
    const fields: (
      keyof NormalizedProduct
    )[] = [
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

    /*
     * Automatically map uploaded columns.
     */
    const mapping =
      Object.fromEntries(
        fields.map((field) => [
          field,
          findColumn(headers, field),
        ])
      ) as Record<
        keyof NormalizedProduct,
        string | null
      >;

    /*
     * Required columns.
     *
     * badge, featured and isActive are
     * deliberately NOT required.
     */
    const requiredFields: (
      keyof NormalizedProduct
    )[] = [
      "name",
      "category",
      "unit",
      "price",
    ];

    const missingRequiredColumns =
      requiredFields.filter(
        (field) =>
          !mapping[field]
      );

    /*
     * We don't fail merely because optional
     * columns are absent.
     */
    if (
      missingRequiredColumns.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            `Required catalog columns could not be detected: ${missingRequiredColumns.join(
              ", "
            )}.`,
          headers,
          mapping,
          requiredFields,
          optionalFields: [
            "description",
            "image",
            "badge",
            "featured",
            "isActive",
          ],
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Normalize every uploaded row.
     */
    const normalized = rows.map(
      (row, index) => ({
        rowNumber: index + 2,
        product: normalizeRow(
          row,
          mapping
        ),
      })
    );

    /*
     * Validate rows.
     */
    const validation = normalized.map(
      ({
        rowNumber,
        product,
      }) => {
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

        if (product.price === null) {
          errors.push(
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

        /*
         * Optional fields generate warnings,
         * not validation errors.
         */
        if (
          !mapping.description
        ) {
          warnings.push(
            "Description column was not detected."
          );
        }

        if (!mapping.image) {
          warnings.push(
            "Image column was not detected."
          );
        }

        if (!mapping.badge) {
          warnings.push(
            "Badge column was not detected. Defaulting to no badge."
          );
        }

        if (!mapping.featured) {
          warnings.push(
            "Featured column was not detected. Defaulting to false."
          );
        }

        if (!mapping.isActive) {
          warnings.push(
            "Is Active column was not detected. Defaulting to true."
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

    /*
     * Duplicate product-name detection.
     */
    const seenNames =
      new Map<string, number>();

    const duplicates =
      new Set<number>();

    for (const item of validation) {
      const key =
        item.product.name
          .trim()
          .toLowerCase();

      if (!key) {
        continue;
      }

      if (seenNames.has(key)) {
        duplicates.add(
          item.rowNumber
        );

        const firstRow =
          seenNames.get(key);

        if (
          firstRow !== undefined
        ) {
          duplicates.add(
            firstRow
          );
        }
      } else {
        seenNames.set(
          key,
          item.rowNumber
        );
      }
    }

    /*
     * Summary.
     */
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

    /*
     * Return analysis to the frontend.
     *
     * IMPORTANT:
     * This endpoint only analyzes.
     * It does NOT write to Prisma/PostgreSQL.
     */
    return NextResponse.json(
      {
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

        requiredFields,

        optionalFields: [
          "description",
          "image",
          "badge",
          "featured",
          "isActive",
        ],

        defaults: {
          badge: null,
          featured: false,
          isActive: true,
        },

        preview: validation
          .slice(0, 100)
          .map((item) => ({
            rowNumber:
              item.rowNumber,

            product:
              item.product,

            errors:
              item.errors,

            warnings:
              item.warnings,

            duplicate:
              duplicates.has(
                item.rowNumber
              ),

            valid:
              item.valid,
          })),
      },
      {
        status: 200,
      }
    );
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
      {
        status: 500,
      }
    );
  }
}