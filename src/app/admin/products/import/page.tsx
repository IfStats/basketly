"use client";

import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleX,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  UploadCloud,
  X,
} from "lucide-react";

type ImportFileType = "csv" | "spreadsheet" | "json";

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

type PreviewRow = {
  rowNumber: number;
  product: NormalizedProduct;
  errors: string[];
  warnings: string[];
  duplicate: boolean;
  valid: boolean;
};

type AnalyzeResponse = {
  success: boolean;

  file: {
    name: string;
    size: number;
    type: ImportFileType;
  };

  summary: {
    rowsDetected: number;
    valid: number;
    invalid: number;
    warnings: number;
    duplicates: number;
  };

  headers: string[];

  mapping: Record<
    keyof NormalizedProduct,
    string | null
  >;

  optionalFields?: {
    badge: {
      detected: boolean;
      defaultValue: string | null;
    };
    featured: {
      detected: boolean;
      defaultValue: boolean;
    };
    isActive: {
      detected: boolean;
      defaultValue: boolean;
    };
  };

  /*
   * IMPORTANT:
   * The analyze endpoint should return the complete
   * normalized catalog here.
   *
   * `preview` is only for displaying the first rows.
   */
  products?: NormalizedProduct[];

  preview: PreviewRow[];
};

type ImportResponse = {
  success: boolean;
  message?: string;

  summary?: {
    received?: number;
    processed?: number;
    created?: number;
    updated?: number;
    total?: number;
  };

  products?: unknown[];
};

const ACCEPTED_EXTENSIONS =
  ".csv,.xlsx,.xls,.json";

const FILE_INPUT_ID =
  "catalog-file-upload";

export default function CatalogImportPage() {
  const [file, setFile] =
    useState<File | null>(null);

  const [analysis, setAnalysis] =
    useState<AnalyzeResponse | null>(null);

  const [dragging, setDragging] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [importing, setImporting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [importResult, setImportResult] =
    useState<ImportResponse | null>(null);

  const [step, setStep] =
    useState<1 | 2 | 3>(1);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setAnalysis(null);
    setError("");
    setSuccess("");
    setImportResult(null);
    setStep(1);
    setDragging(false);
    setImporting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const analyzeFile = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setAnalysis(null);
      setError("");
      setSuccess("");
      setImportResult(null);
      setStep(1);
      setAnalyzing(true);

      try {
        const formData = new FormData();

        formData.append(
          "file",
          selectedFile
        );

        const response = await fetch(
          "/api/admin/products/import/analyze",
          {
            method: "POST",
            body: formData,
          }
        );

        const data: unknown =
          await response.json();

        if (!response.ok) {
          const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
              ? data.error
              : "Unable to analyze the catalog.";

          throw new Error(message);
        }

        const result =
          data as AnalyzeResponse;

        if (!result.success) {
          throw new Error(
            "Catalog analysis was not successful."
          );
        }

        setAnalysis(result);
        setStep(2);
      } catch (err) {
        console.error(
          "Catalog analyze error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to analyze the catalog."
        );
      } finally {
        setAnalyzing(false);
      }
    },
    []
  );

  const importProducts =
    useCallback(async () => {
      if (!analysis) {
        return;
      }

      setError("");
      setSuccess("");
      setImportResult(null);

      /*
       * The analyze endpoint should provide the complete
       * normalized product list through `products`.
       *
       * The preview is only used as a fallback so that
       * the page remains functional if the analysis response
       * does not include products.
       */
      const products =
        analysis.products ??
        analysis.preview
          .filter(
            (row) =>
              row.valid &&
              row.errors.length === 0
          )
          .map(
            (row) => row.product
          );

      if (products.length === 0) {
        setError(
          "There are no valid products available to import."
        );
        return;
      }

      setImporting(true);

      try {
        const response = await fetch(
          "/api/admin/products/import",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              products,
            }),
          }
        );

        const data: unknown =
          await response.json();

        if (!response.ok) {
          const message =
            typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
              ? data.error
              : "Unable to import products.";

          throw new Error(message);
        }

        const result =
          data as ImportResponse;

        if (!result.success) {
          throw new Error(
            result.message ??
              "Product import failed."
          );
        }

        setImportResult(result);
        setSuccess(
          result.message ??
            "Products imported successfully."
        );

        setStep(3);
      } catch (err) {
        console.error(
          "Catalog import error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to import products."
        );
      } finally {
        setImporting(false);
      }
    }, [analysis]);

  function handleFileInput(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    void analyzeFile(selectedFile);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);

    if (analyzing || importing) {
      return;
    }

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (!droppedFile) {
      return;
    }

    void analyzeFile(droppedFile);
  }

  const fileTypeLabel =
    useMemo(() => {
      if (!analysis) {
        return "";
      }

      if (
        analysis.file.type ===
        "spreadsheet"
      ) {
        return "Excel spreadsheet";
      }

      if (
        analysis.file.type === "csv"
      ) {
        return "CSV file";
      }

      return "JSON file";
    }, [analysis]);

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#111827]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#16A34A]"
          >
            <ArrowLeft size={16} />
            Back to products
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">
                Basketly Catalog
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Import Center
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Upload a product catalog,
                review how Basketly interpreted
                it, and inspect the data before
                any changes reach your database.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span
                className={
                  step >= 1
                    ? "text-[#16A34A]"
                    : ""
                }
              >
                01 Upload
              </span>

              <ChevronRight size={15} />

              <span
                className={
                  step >= 2
                    ? "text-[#16A34A]"
                    : ""
                }
              >
                02 Review
              </span>

              <ChevronRight size={15} />

              <span
                className={
                  step >= 3
                    ? "text-[#16A34A]"
                    : ""
                }
              >
                03 Import
              </span>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
          <Link
            href="/admin"
            className="px-4 py-4 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
          >
            Overview
          </Link>

          <Link
            href="/admin/orders"
            className="px-4 py-4 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
          >
            Orders
          </Link>

          <Link
            href="/admin/products"
            className="border-b-2 border-[#16A34A] px-4 py-4 text-sm font-semibold text-[#16A34A]"
          >
            Products
          </Link>

          <Link
            href="/shop"
            className="ml-auto px-4 py-4 text-sm font-semibold text-gray-500 transition hover:text-[#16A34A]"
          >
            View Store
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <CircleX
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                analyzing ||
                importing
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UploadCloud size={16} />
              Choose another file
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Import successful
              </p>

              <p className="mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        {step === 3 &&
        importResult ? (
          <ImportSuccess
            result={importResult}
            onReset={reset}
          />
        ) : analysis ? (
          <ReviewStep
            analysis={analysis}
            fileTypeLabel={
              fileTypeLabel
            }
            importing={importing}
            onImport={
              importProducts
            }
            onReset={reset}
          />
        ) : (
          <UploadStep
            dragging={dragging}
            analyzing={analyzing}
            onDragEnter={() =>
              setDragging(true)
            }
            onDragLeave={() =>
              setDragging(false)
            }
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            onFileChange={
              handleFileInput
            }
            fileName={
              file?.name ?? ""
            }
            fileInputRef={
              fileInputRef
            }
          />
        )}
      </section>
    </main>
  );
}

function UploadStep({
  dragging,
  analyzing,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
  fileName,
  fileInputRef,
}: {
  dragging: boolean;
  analyzing: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDragOver: (
    event: DragEvent<HTMLElement>
  ) => void;
  onDrop: (
    event: DragEvent<HTMLDivElement>
  ) => void;
  onFileChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  fileName: string;
  fileInputRef: React.RefObject<
    HTMLInputElement | null
  >;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section
        onDragEnter={(event) => {
          event.preventDefault();

          if (!analyzing) {
            onDragEnter();
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();

          if (
            event.currentTarget ===
            event.target
          ) {
            onDragLeave();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();

          if (!analyzing) {
            onDragEnter();
          }
        }}
        onDrop={onDrop}
        className={`rounded-[2rem] border-2 border-dashed bg-white p-8 shadow-sm transition sm:p-12 ${
          dragging
            ? "border-[#16A34A] bg-green-50/60"
            : "border-gray-200"
        }`}
      >
        <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-[#16A34A]">
            {analyzing ? (
              <Loader2
                size={34}
                className="animate-spin"
              />
            ) : (
              <UploadCloud size={34} />
            )}
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">
            {analyzing
              ? "Analyzing file"
              : "Catalog upload"}
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {analyzing
              ? "Reading your catalog..."
              : dragging
                ? "Drop the file here"
                : "Bring your catalog into Basketly"}
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-gray-500">
            {analyzing
              ? "We are detecting columns, product fields, pricing and validation issues before anything is imported."
              : "Upload a CSV, Excel spreadsheet or JSON catalog. Basketly will automatically detect the product fields and prepare a reviewable import."}
          </p>

          <label
            htmlFor={FILE_INPUT_ID}
            className={`mt-7 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3.5 text-sm font-bold text-white transition ${
              analyzing
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-[#15803D]"
            }`}
          >
            {analyzing ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <UploadCloud size={18} />
            )}

            {analyzing
              ? "Analyzing..."
              : "Choose file"}
          </label>

          <input
            id={FILE_INPUT_ID}
            ref={fileInputRef}
            type="file"
            accept={
              ACCEPTED_EXTENSIONS
            }
            onChange={
              onFileChange
            }
            disabled={analyzing}
            className="sr-only"
          />

          <p className="mt-4 text-xs text-gray-400">
            CSV, XLSX, XLS or JSON ·
            Maximum 10 MB
          </p>

          {fileName &&
            !analyzing && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600">
                <FileText size={14} />
                {fileName}
              </div>
            )}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
            Supported sources
          </p>

          <div className="mt-5 space-y-3">
            <SourceCard
              icon={
                <FileSpreadsheet
                  size={18}
                />
              }
              title="CSV / Excel"
              description="Best for supplier catalogs and bulk product lists."
            />

            <SourceCard
              icon={
                <FileJson size={18} />
              }
              title="JSON"
              description="Best for structured exports and application data."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
            What happens next
          </p>

          <div className="mt-5 space-y-4">
            <FlowItem
              number="01"
              title="Analyze"
              description="Detect headers and normalize product fields."
            />

            <FlowItem
              number="02"
              title="Validate"
              description="Flag missing data, invalid values and duplicates."
            />

            <FlowItem
              number="03"
              title="Review"
              description="Inspect the catalog before importing anything."
            />

            <FlowItem
              number="04"
              title="Import"
              description="Approved products will be written to PostgreSQL."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
            Optional catalog fields
          </p>

          <div className="mt-4 space-y-2 text-sm text-blue-900">
            <p>
              <strong>Badge</strong> — optional
            </p>

            <p>
              <strong>Featured</strong> — defaults to false
            </p>

            <p>
              <strong>Is Active</strong> — defaults to true
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ReviewStep({
  analysis,
  fileTypeLabel,
  importing,
  onImport,
  onReset,
}: {
  analysis: AnalyzeResponse;
  fileTypeLabel: string;
  importing: boolean;
  onImport: () => Promise<void>;
  onReset: () => void;
}) {
  const validProducts =
    analysis.products?.length ??
    analysis.preview.filter(
      (row) =>
        row.valid &&
        row.errors.length === 0
    ).length;

  const canImport =
    validProducts > 0 &&
    !importing;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle2
              size={17}
              className="text-[#16A34A]"
            />
            Analysis complete
          </div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            Review your catalog
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {analysis.file.name} ·{" "}
            {fileTypeLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={importing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Choose another file
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ReviewMetric
          label="Rows detected"
          value={
            analysis.summary.rowsDetected
          }
          icon={
            <FileText size={18} />
          }
        />

        <ReviewMetric
          label="Valid"
          value={
            analysis.summary.valid
          }
          icon={
            <CheckCircle2 size={18} />
          }
          tone="green"
        />

        <ReviewMetric
          label="Warnings"
          value={
            analysis.summary.warnings
          }
          icon={
            <AlertTriangle
              size={18}
            />
          }
          tone="amber"
        />

        <ReviewMetric
          label="Errors"
          value={
            analysis.summary.invalid
          }
          icon={
            <CircleX size={18} />
          }
          tone="red"
        />

        <ReviewMetric
          label="Duplicates"
          value={
            analysis.summary
              .duplicates
          }
          icon={
            <RefreshCw size={18} />
          }
          tone="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
            Automatic field mapping
          </p>

          <h3 className="mt-1 text-lg font-bold">
            How Basketly interpreted
            the file
          </h3>

          <div className="mt-5 space-y-2">
            {(
              Object.entries(
                analysis.mapping
              ) as [
                keyof NormalizedProduct,
                string | null
              ][]
            ).map(
              ([field, column]) => (
                <div
                  key={String(field)}
                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3"
                >
                  <span className="text-sm font-semibold capitalize text-gray-700">
                    {String(
                      field
                    ).replace(
                      /([A-Z])/g,
                      " $1"
                    )}
                  </span>

                  <span
                    className={`max-w-[55%] truncate text-right text-xs font-semibold ${
                      column
                        ? "text-[#16A34A]"
                        : "text-gray-400"
                    }`}
                  >
                    {column ??
                      "Not detected"}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
              Optional fields
            </p>

            <div className="mt-3 space-y-2 text-xs text-blue-900">
              <p>
                Badge:{" "}
                {analysis.mapping
                  .badge
                  ? "detected"
                  : "not provided → empty"}
              </p>

              <p>
                Featured:{" "}
                {analysis.mapping
                  .featured
                  ? "detected"
                  : "not provided → false"}
              </p>

              <p>
                Is Active:{" "}
                {analysis.mapping
                  .isActive
                  ? "detected"
                  : "not provided → true"}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
              Preview
            </p>

            <h3 className="mt-1 text-lg font-bold">
              First{" "}
              {analysis.preview.length}{" "}
              rows
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-5 py-3 font-bold">
                    Row
                  </th>
                  <th className="px-5 py-3 font-bold">
                    Product
                  </th>
                  <th className="px-5 py-3 font-bold">
                    Category
                  </th>
                  <th className="px-5 py-3 font-bold">
                    Price
                  </th>
                  <th className="px-5 py-3 font-bold">
                    Stock
                  </th>
                  <th className="px-5 py-3 font-bold">
                    Badge
                  </th>
                  <th className="px-5 py-3 font-bold">
                    Featured
                  </th>
                  <th className="px-5 py-3 font-bold">
                    Active
                  </th>
                  <th className="px-5 py-3 font-bold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {analysis.preview
                  .slice(0, 20)
                  .map((row) => (
                    <tr
                      key={
                        row.rowNumber
                      }
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {row.rowNumber}
                      </td>

                      <td className="max-w-[260px] px-5 py-4">
                        <p className="truncate font-semibold text-gray-800">
                          {row.product
                            .name ||
                            "Unnamed product"}
                        </p>

                        {row.product
                          .description && (
                          <p className="mt-1 max-w-[240px] truncate text-xs text-gray-400">
                            {
                              row
                                .product
                                .description
                            }
                          </p>
                        )}

                        {(row.errors
                          .length > 0 ||
                          row.warnings
                            .length > 0) && (
                          <div className="mt-1 space-y-1 text-xs">
                            {row.errors.map(
                              (item) => (
                                <p
                                  key={
                                    item
                                  }
                                  className="text-red-600"
                                >
                                  {item}
                                </p>
                              )
                            )}

                            {row.warnings.map(
                              (item) => (
                                <p
                                  key={
                                    item
                                  }
                                  className="text-amber-600"
                                >
                                  {item}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {row.product
                          .category ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {row.product
                          .price ===
                        null
                          ? "—"
                          : `$${row.product.price.toFixed(
                              2
                            )}`}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {row.product.stock}
                      </td>

                      <td className="px-5 py-4">
                        {row.product
                          .badge ? (
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                            {
                              row
                                .product
                                .badge
                            }
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {row.product
                          .featured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <Check
                              size={13}
                            />
                            Yes
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {row.product
                          .isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <Check
                              size={13}
                            />
                            Active
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <PreviewStatus
                          row={row}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {importing
                  ? "Importing catalog..."
                  : "Ready to import"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {importing
                  ? "Basketly is writing the approved products to PostgreSQL. Please wait."
                  : `${validProducts} valid product${validProducts === 1 ? "" : "s"} will be sent to the import endpoint.`}
              </p>
            </div>

            <button
              type="button"
              disabled={!canImport}
              onClick={() =>
                void onImport()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              {importing ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Importing...
                </>
              ) : (
                <>
                  Continue to import
                  <ChevronRight
                    size={17}
                  />
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ImportSuccess({
  result,
  onReset,
}: {
  result: ImportResponse;
  onReset: () => void;
}) {
  const summary =
    result.summary;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={40} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#16A34A]">
          Import complete
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Catalog imported successfully
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
          {result.message ??
            "Your Basketly product catalog has been imported successfully."}
        </p>

        {summary && (
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            <ImportResultMetric
              label="Received"
              value={
                summary.received ??
                0
              }
            />

            <ImportResultMetric
              label="Processed"
              value={
                summary.processed ??
                0
              }
            />

            <ImportResultMetric
              label="Created"
              value={
                summary.created ??
                0
              }
            />

            <ImportResultMetric
              label="Updated"
              value={
                summary.updated ??
                0
              }
            />
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#15803D]"
          >
            View products
            <ChevronRight
              size={17}
            />
          </Link>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Import another catalog
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportResultMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ReviewMetric({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?:
    | "neutral"
    | "green"
    | "amber"
    | "red"
    | "blue";
}) {
  const tones = {
    neutral:
      "bg-gray-100 text-gray-600",
    green:
      "bg-emerald-50 text-emerald-700",
    amber:
      "bg-amber-50 text-amber-700",
    red:
      "bg-red-50 text-red-700",
    blue:
      "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function PreviewStatus({
  row,
}: {
  row: PreviewRow;
}) {
  if (row.errors.length > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
        <X size={12} />
        Error
      </span>
    );
  }

  if (row.duplicate) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
        <RefreshCw size={12} />
        Duplicate
      </span>
    );
  }

  if (row.warnings.length > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
        <AlertTriangle
          size={12}
        />
        Warning
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
      <Check size={12} />
      Ready
    </span>
  );
}

function SourceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-gray-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function FlowItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
        {number}
      </div>

      <div>
        <p className="text-sm font-bold text-gray-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}