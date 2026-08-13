"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: "0",
  isActive: true,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(
    null
  );
  const [form, setForm] =
    useState<CategoryForm>(emptyForm);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/categories",
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load categories."
        );
      }

      setCategories(data.categories ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(
    (category) => {
      const query = search.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.description
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(category: Category) {
    setEditingId(category.id);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveCategory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name.trim(),
        slug:
          form.slug.trim() ||
          slugify(form.name),
        description:
          form.description.trim() || null,
        image: form.image.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      const response = await fetch(
        "/api/admin/categories",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save category."
        );
      }

      if (editingId) {
        setCategories((current) =>
          current.map((category) =>
            category.id === editingId
              ? data.category
              : category
          )
        );

        setSuccess("Category updated.");
      } else {
        setCategories((current) => [
          ...current,
          data.category,
        ]);

        setSuccess("Category created.");
      }

      closeForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(
    category: Category
  ) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/categories",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: category.id,
            isActive: !category.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update category."
        );
      }

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? data.category
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update category."
      );
    }
  }

  async function deleteCategory(
    category: Category
  ) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/categories",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: category.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete category."
        );
      }

      setCategories((current) =>
        current.filter(
          (item) => item.id !== category.id
        )
      );

      setSuccess("Category deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-7">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#16A34A]"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#16A34A]">
                Basketly Catalog
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111827]">
                Categories
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Organize your catalog and control how products are discovered.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadCategories}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-[#16A34A] hover:text-[#16A34A] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-bold text-white hover:bg-[#15803D]"
              >
                <Plus size={17} />
                New category
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-6">
          <Link
            href="/admin"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Overview
          </Link>

          <Link
            href="/admin/products"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Products
          </Link>

          <Link
            href="/admin/categories"
            className="border-b-2 border-[#16A34A] px-4 py-4 text-sm font-semibold text-[#16A34A]"
          >
            Categories
          </Link>

          <Link
            href="/admin/inventory"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Inventory
          </Link>

          <Link
            href="/admin/orders"
            className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Orders
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-[1500px] px-6 py-8">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            {success}
          </div>
        )}

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold">
              Catalog categories
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredCategories.length} categories
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-[#16A34A]"
              />

              <p className="mt-4 text-sm text-gray-500">
                Loading categories...
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <FolderOpen
                size={42}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 text-xl font-bold">
                No categories found
              </h2>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCategories.map(
                (category) => (
                  <div
                    key={category.id}
                    className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-100">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <FolderOpen size={24} />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {category.name}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                              category.isActive
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-100 text-gray-500"
                            }`}
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-400">
                          /{category.slug}
                        </p>

                        {category.description && (
                          <p className="mt-2 text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleCategory(
                            category
                          )
                        }
                        className="rounded-xl border border-gray-200 p-2.5 text-gray-500 hover:border-[#16A34A] hover:text-[#16A34A]"
                        title={
                          category.isActive
                            ? "Deactivate"
                            : "Activate"
                        }
                      >
                        {category.isActive ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(category)
                        }
                        className="rounded-xl border border-gray-200 p-2.5 text-gray-500 hover:border-[#16A34A] hover:text-[#16A34A]"
                        title="Edit category"
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteCategory(
                            category
                          )
                        }
                        className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                        title="Delete category"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-8 max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                  Basketly Catalog
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {editingId
                    ? "Edit category"
                    : "Create category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={saveCategory}
              className="space-y-5 p-6"
            >
              <Field
                label="Category name"
                value={form.name}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    name: value,
                    slug:
                      current.slug ||
                      slugify(value),
                  }))
                }
                placeholder="Fresh Produce"
                required
              />

              <Field
                label="Slug"
                value={form.slug}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    slug: value,
                  }))
                }
                placeholder="fresh-produce"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Fresh fruits, vegetables and more."
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
                />
              </div>

              <Field
                label="Image URL"
                value={form.image}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    image: value,
                  }))
                }
                placeholder="https://..."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Display order"
                  value={form.sortOrder}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: value,
                    }))
                  }
                  type="number"
                  min="0"
                  step="1"
                />

                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isActive:
                          event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[#16A34A]"
                  />

                  <span className="text-sm font-semibold text-gray-700">
                    Active category
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#16A34A] px-7 py-3 text-sm font-bold text-white hover:bg-[#15803D] disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        min={min}
        step={step}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
      />
    </div>
  );
}