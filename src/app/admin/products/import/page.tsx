"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileJson,
  Loader2,
} from "lucide-react";

const example = `[
  {
    "name": "Fresh Tomatoes",
    "category": "Fresh Produce",
    "unit": "1 kg",
    "price": 12.99,
    "description": "Fresh ripe tomatoes.",
    "image": null,
    "badge": "Fresh",
    "stock": 100,
    "featured": true
  }
]`;

type ImportSummary = {
  received: number;
  created: number;
  updated: number;
  skipped: number;
};

export default function ProductImportPage() {
  const [json, setJson] = useState(example);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] =
    useState<ImportSummary | null>(null);

  async function importProducts() {
    setLoading(true);
    setError("");
    setSummary(null);

    try {
      let products: unknown;

      try {
        products = JSON.parse(json);
      } catch {
        throw new Error(
          "The catalog is not valid JSON."
        );
      }

      if (!Array.isArray(products)) {
        throw new Error(
          "The JSON must contain an array of products."
        );
      }

      const response = await fetch(
        "/api/admin/products/import",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            products,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Catalog import failed."
        );
      }

      setSummary(data.summary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Catalog import failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#16A34A]"
          >
            <ArrowLeft size={16} />
            Back to products
          </Link>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-[#16A34A]">
            Basketly Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#1F2937]">
            Import Catalog
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Paste a JSON product catalog to create or update
            products in PostgreSQL.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FileJson
                size={20}
                className="text-[#16A34A]"
              />

              <div>
                <h2 className="font-bold text-[#1F2937]">
                  Catalog JSON
                </h2>

                <p className="text-xs text-gray-500">
                  Paste your products below.
                </p>
              </div>
            </div>

            <textarea
              value={json}
              onChange={(event) =>
                setJson(event.target.value)
              }
              spellCheck={false}
              className="mt-5 min-h-[520px] w-full rounded-2xl border border-gray-200 bg-gray-950 p-5 font-mono text-sm leading-6 text-green-300 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
            />

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={importProducts}
              disabled={loading}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] px-7 py-3 text-sm font-bold text-white hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Import Catalog
                </>
              )}
            </button>
          </div>

          <aside className="h-fit rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-[#1F2937]">
              Import rules
            </h2>

            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <p>
                <strong>Name:</strong> required
              </p>

              <p>
                <strong>Category:</strong> required
              </p>

              <p>
                <strong>Unit:</strong> required
              </p>

              <p>
                <strong>Price:</strong> defaults to 0
              </p>

              <p>
                <strong>Stock:</strong> defaults to 100
              </p>

              <p>
                Existing products are updated using their
                generated slug.
              </p>

              <p>
                Products with missing required fields are
                skipped.
              </p>
            </div>

            {summary && (
              <div className="mt-6 rounded-2xl bg-green-50 p-4">
                <p className="font-bold text-green-800">
                  Import complete
                </p>

                <div className="mt-3 space-y-1 text-sm text-green-700">
                  <p>
                    Received:{" "}
                    <strong>{summary.received}</strong>
                  </p>

                  <p>
                    Created:{" "}
                    <strong>{summary.created}</strong>
                  </p>

                  <p>
                    Updated:{" "}
                    <strong>{summary.updated}</strong>
                  </p>

                  <p>
                    Skipped:{" "}
                    <strong>{summary.skipped}</strong>
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}