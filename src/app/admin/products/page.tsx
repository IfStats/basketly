"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  FolderOpen,
  Package,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  unit: string;
  price: number;
  image: string | null;
  badge: string | null;
  stock: number;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  category: string;
  unit: string;
  price: string;
  image: string;
  badge: string;
  stock: string;
  isActive: boolean;
  featured: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  category: "",
  unit: "",
  price: "",
  image: "",
  badge: "",
  stock: "0",
  isActive: true,
  featured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  async function fetchCategories() {
    try {
      setCategoriesLoading(true);
      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load categories.");
      }

      const data = await response.json();
      setCategories(
        (data.categories ?? []).filter(
          (item: Category) => item.isActive
        )
      );
    } catch (err) {
      console.error("Fetch categories error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/products", {
        cache: "no-store",
      });

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load products.");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.all([
      fetchProducts(),
      fetchCategories(),
    ]);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "ALL" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  function updateForm<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function openCreateForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      category: categories[0]?.name ?? "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category: product.category,
      unit: product.unit,
      price: String(product.price),
      image: product.image || "",
      badge: product.badge || "",
      stock: String(product.stock),
      isActive: product.isActive,
      featured: product.featured,
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

  async function saveProduct(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const price = Number(form.price);
      const stock = Number(form.stock);

      if (!form.name.trim()) {
        throw new Error("Product name is required.");
      }

      if (!form.slug.trim()) {
        throw new Error("Product slug is required.");
      }

      if (!form.category.trim()) {
        throw new Error("Select a product category.");
      }

      if (!form.unit.trim()) {
        throw new Error("Product unit is required.");
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid product price.");
      }

      if (!Number.isFinite(stock) || stock < 0) {
        throw new Error("Enter a valid stock quantity.");
      }

      const payload = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        category: form.category.trim(),
        unit: form.unit.trim(),
        price,
        image: form.image.trim() || null,
        badge: form.badge.trim() || null,
        stock: Math.floor(stock),
        isActive: form.isActive,
        featured: form.featured,
      };

      const response = await fetch("/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save product."
        );
      }

      if (editingId) {
        setProducts((current) =>
          current.map((product) =>
            product.id === editingId
              ? data.product
              : product
          )
        );
        setSuccess("Product updated successfully.");
      } else {
        setProducts((current) => [data.product, ...current]);
        setSuccess("Product created successfully.");
      }

      closeForm();
    } catch (err) {
      console.error("Save product error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleProduct(product: Product) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          isActive: !product.isActive,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update product."
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? data.product : item
        )
      );
      setSuccess(
        product.isActive
          ? "Product deactivated."
          : "Product activated."
      );
    } catch (err) {
      console.error("Toggle product error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product."
      );
    }
  }

  async function toggleFeatured(product: Product) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          featured: !product.featured,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update featured status."
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? data.product : item
        )
      );
      setSuccess(
        product.featured
          ? "Removed from featured products."
          : "Product marked as featured."
      );
    } catch (err) {
      console.error("Toggle featured error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update featured status."
      );
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${product.name}"?`
    );
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || "Unable to remove product."
        );
      }

      if (data.softDeleted) {
        setProducts((current) =>
          current.map((item) =>
            item.id === product.id ? data.product : item
          )
        );
        setSuccess(
          "Product has orders, so it was deactivated instead of deleted."
        );
      } else {
        setProducts((current) =>
          current.filter((item) => item.id !== product.id)
        );
        setSuccess("Product deleted successfully.");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove product."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#16A34A]"
              >
                <ArrowLeft size={16} />
                Back to dashboard
              </Link>

              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-[#16A34A]">
                Basketly Admin
              </p>

              <h1 className="mt-1 text-3xl font-bold text-[#1F2937]">
                Products
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your complete Basketly catalog.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  void fetchProducts();
                  void fetchCategories();
                }}
                disabled={loading || categoriesLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#16A34A] hover:text-[#16A34A] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <Link
                href="/admin/categories"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#16A34A] hover:text-[#16A34A]"
              >
                <FolderOpen size={16} />
                Categories
              </Link>

              <Link
                href="/admin/products/import"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#16A34A] hover:text-[#16A34A]"
              >
                Import Catalog
              </Link>

              <button
                type="button"
                onClick={openCreateForm}
                disabled={categories.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Plus size={17} />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6">
          <Link href="/admin" className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Dashboard</Link>
          <Link href="/admin/orders" className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Orders</Link>
          <Link href="/admin/products" className="border-b-2 border-[#16A34A] px-4 py-4 text-sm font-semibold text-[#16A34A]">Products</Link>
          <Link href="/admin/categories" className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Categories</Link>
          <Link href="/admin/inventory" className="px-4 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">Inventory</Link>
          <Link href="/shop" className="ml-auto px-4 py-4 text-sm font-semibold text-gray-500 hover:text-[#16A34A]">View Store</Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="font-semibold hover:underline">Dismiss</button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            <Check size={17} />
            {success}
          </div>
        )}

        {categories.length === 0 && !categoriesLoading && (
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-amber-900">No active categories yet</p>
              <p className="mt-1 text-sm text-amber-800">Create at least one active category before adding products.</p>
            </div>
            <Link href="/admin/categories" className="inline-flex items-center justify-center rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15803D]">
              Create category
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Total products" value={products.length} />
          <SummaryCard label="Active products" value={products.filter((product) => product.isActive).length} />
          <SummaryCard label="Low stock" value={products.filter((product) => product.stock > 0 && product.stock <= 5).length} />
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={categoriesLoading}
              className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm font-semibold outline-none focus:border-[#16A34A] disabled:opacity-60"
            >
              <option value="ALL">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> of <span className="font-bold text-gray-900">{products.length}</span> products
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-20 text-center">
              <RefreshCw size={30} className="mx-auto animate-spin text-[#16A34A]" />
              <p className="mt-4 text-sm text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Package size={42} className="mx-auto text-gray-300" />
              <h2 className="mt-4 text-xl font-bold text-[#1F2937]">No products found</h2>
              <p className="mt-2 text-sm text-gray-500">Try a different search or category.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={openEditForm}
                  onToggle={toggleProduct}
                  onToggleFeatured={toggleFeatured}
                  onDelete={deleteProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-8 max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#16A34A]">Basketly Catalog</p>
                <h2 className="mt-1 text-2xl font-bold text-[#1F2937]">{editingId ? "Edit product" : "Add product"}</h2>
              </div>
              <button type="button" onClick={closeForm} disabled={saving} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="space-y-6 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Product name" value={form.name} onChange={(value) => updateForm("name", value)} placeholder="Fresh Tomatoes" required />
                <FormField label="Slug" value={form.slug} onChange={(value) => updateForm("slug", value)} placeholder="fresh-tomatoes" required />
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => updateForm("slug", slugify(form.name))} className="text-xs font-semibold text-[#16A34A] hover:underline">Generate slug from name</button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={4} placeholder="Product description..." className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormSelect
                  label="Category"
                  value={form.category}
                  onChange={(value) => updateForm("category", value)}
                  options={categories.map((item) => item.name)}
                  disabled={categoriesLoading || categories.length === 0}
                />
                <FormField label="Unit / size" value={form.unit} onChange={(value) => updateForm("unit", value)} placeholder="1 kg / 12 ct / 8 oz" required />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <FormField label="Price" type="number" min="0" step="0.01" value={form.price} onChange={(value) => updateForm("price", value)} placeholder="0.00" required />
                <FormField label="Stock" type="number" min="0" step="1" value={form.stock} onChange={(value) => updateForm("stock", value)} placeholder="0" required />
                <FormField label="Badge" value={form.badge} onChange={(value) => updateForm("badge", value)} placeholder="Fresh / Popular" />
              </div>

              <FormField label="Image URL / path" value={form.image} onChange={(value) => updateForm("image", value)} placeholder="/products/tomatoes.jpg" />

              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleField label="Active product" description="Customers can see this product." checked={form.isActive} onChange={(value) => updateForm("isActive", value)} />
                <ToggleField label="Featured product" description="Show this product as featured." checked={form.featured} onChange={(value) => updateForm("featured", value)} />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} disabled={saving} className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={saving || categories.length === 0} className="rounded-full bg-[#16A34A] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#1F2937]">{value}</p>
    </div>
  );
}

function ProductRow({ product, onEdit, onToggle, onToggleFeatured, onDelete }: {
  product: Product;
  onEdit: (product: Product) => void;
  onToggle: (product: Product) => Promise<void>;
  onToggleFeatured: (product: Product) => Promise<void>;
  onDelete: (product: Product) => Promise<void>;
}) {
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="px-6 py-5 transition hover:bg-gray-50">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <Package size={24} />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-[#1F2937]">{product.name}</h2>
              {product.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                  <Star size={12} /> Featured
                </span>
              )}
              {!product.isActive && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">Inactive</span>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-400">{product.category} · {product.unit}</p>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <span className="text-lg font-bold text-[#16A34A]">${product.price.toFixed(2)}</span>
              <span className={`text-xs font-semibold ${product.stock <= 0 ? "text-red-600" : lowStock ? "text-orange-600" : "text-gray-500"}`}>
                {product.stock <= 0 ? "Out of stock" : `${product.stock} in stock`}
              </span>
              {product.badge && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{product.badge}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onEdit(product)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#16A34A] hover:text-[#16A34A]">Edit</button>
          <button type="button" onClick={() => onToggleFeatured(product)} className={`rounded-xl border px-3 py-2.5 ${product.featured ? "border-orange-200 bg-orange-50 text-orange-600" : "border-gray-200 bg-white text-gray-500"}`} title="Toggle featured" aria-label="Toggle featured">
            <Star size={17} fill={product.featured ? "currentColor" : "none"} />
          </button>
          <button type="button" onClick={() => onToggle(product)} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${product.isActive ? "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:text-red-600" : "border-green-200 bg-green-50 text-[#16A34A]"}`}>
            {product.isActive ? "Deactivate" : "Activate"}
          </button>
          <button type="button" onClick={() => onDelete(product)} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-red-600 hover:bg-red-100" title="Delete product" aria-label="Delete product">
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", min, step, required = false }: {
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
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <input type={type} value={value} min={min} step={step} required={required} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100" />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, disabled = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-green-100 disabled:opacity-60">
        {options.length === 0 ? (
          <option value="">No active categories</option>
        ) : (
          options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))
        )}
      </select>
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-[#16A34A]" />
      <span>
        <span className="block text-sm font-bold text-gray-800">{label}</span>
        <span className="mt-1 block text-xs text-gray-500">{description}</span>
      </span>
    </label>
  );
}