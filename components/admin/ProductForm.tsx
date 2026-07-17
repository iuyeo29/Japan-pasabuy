"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

export interface ProductFormValues {
  name: string;
  japaneseName: string;
  sku: string;
  slug: string;
  categoryId: string;
  brandName: string;
  description: string;
  ingredients: string;
  weightGrams: string;
  dimensions: string;
  japanPriceJPY: string;
  exchangeRate: string;
  serviceFee: string;
  shippingFee: string;
  discount: string;
  availability: "AVAILABLE" | "LIMITED_STOCK" | "PREORDER" | "SOLD_OUT";
  estimatedArrival: string;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  tags: string; // comma-separated
  images: string[]; // URLs, in display order
}

const empty: ProductFormValues = {
  name: "",
  japaneseName: "",
  sku: "",
  slug: "",
  categoryId: "",
  brandName: "",
  description: "",
  ingredients: "",
  weightGrams: "",
  dimensions: "",
  japanPriceJPY: "",
  exchangeRate: "0.39",
  serviceFee: "",
  shippingFee: "",
  discount: "0",
  availability: "AVAILABLE",
  estimatedArrival: "",
  isBestSeller: false,
  isNewArrival: false,
  isLimitedEdition: false,
  tags: "",
  images: [],
};

export default function ProductForm({
  mode,
  productId,
  initialValues,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>({ ...empty, ...initialValues });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  const estimatedTotal =
    (Number(values.japanPriceJPY) || 0) * (Number(values.exchangeRate) || 0) +
    (Number(values.serviceFee) || 0) +
    (Number(values.shippingFee) || 0) -
    (Number(values.discount) || 0);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true);
    setUploadError(null);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const form = new FormData();
        form.set("file", file);
        const res = await fetch("/api/admin/products/upload-image", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to upload ${file.name}.`);
        uploaded.push(data.url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    if (uploaded.length > 0) {
      setValues((v) => ({ ...v, images: [...v.images, ...uploaded] }));
    }
    setUploading(false);
  }

  function removeImage(index: number) {
    setValues((v) => ({ ...v, images: v.images.filter((_, i) => i !== index) }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setValues((v) => {
      const next = [...v.images];
      const target = index + direction;
      if (target < 0 || target >= next.length) return v;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...v, images: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: values.name,
      japaneseName: values.japaneseName || undefined,
      sku: values.sku,
      slug: values.slug || undefined,
      categoryId: values.categoryId,
      brandName: values.brandName || undefined,
      description: values.description,
      ingredients: values.ingredients || undefined,
      weightGrams: values.weightGrams ? Number(values.weightGrams) : undefined,
      dimensions: values.dimensions || undefined,
      japanPriceJPY: Number(values.japanPriceJPY),
      exchangeRate: Number(values.exchangeRate),
      serviceFee: Number(values.serviceFee),
      shippingFee: Number(values.shippingFee),
      discount: Number(values.discount) || 0,
      availability: values.availability,
      estimatedArrival: values.estimatedArrival,
      isBestSeller: values.isBestSeller,
      isNewArrival: values.isNewArrival,
      isLimitedEdition: values.isLimitedEdition,
      tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
      images: values.images,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="rounded-sm bg-stamp-light p-4 text-sm text-stamp">{error}</p>}

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Product Name">
          <input required className="input" value={values.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Japanese Name">
          <input className="input" value={values.japaneseName} onChange={(e) => set("japaneseName", e.target.value)} />
        </Field>
        <Field label="SKU">
          <input required className="input" value={values.sku} onChange={(e) => set("sku", e.target.value)} />
        </Field>
        <Field label="Slug (optional — auto-generated from name)">
          <input className="input" value={values.slug} onChange={(e) => set("slug", e.target.value)} />
        </Field>
        <Field label="Category">
          <select required className="input" value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Brand">
          <input className="input" value={values.brandName} onChange={(e) => set("brandName", e.target.value)} />
        </Field>
      </section>

      <section>
        <Field label="Description">
          <textarea required rows={3} className="input" value={values.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <div className="mt-4">
          <Field label="Ingredients (food/cosmetics only)">
            <textarea rows={2} className="input" value={values.ingredients} onChange={(e) => set("ingredients", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Weight (grams)">
          <input type="number" className="input" value={values.weightGrams} onChange={(e) => set("weightGrams", e.target.value)} />
        </Field>
        <Field label="Dimensions">
          <input className="input" placeholder="e.g. 18 x 12 x 5 cm" value={values.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
        </Field>
      </section>

      <section>
        <div className="eyebrow text-stamp">Price Calculator</div>
        <div className="mt-3 grid gap-4 md:grid-cols-4">
          <Field label="Japan Price (¥)">
            <input required type="number" className="input" value={values.japanPriceJPY} onChange={(e) => set("japanPriceJPY", e.target.value)} />
          </Field>
          <Field label="Exchange Rate (₱ per ¥)">
            <input required type="number" step="0.001" className="input" value={values.exchangeRate} onChange={(e) => set("exchangeRate", e.target.value)} />
          </Field>
          <Field label="Service Fee (₱)">
            <input required type="number" className="input" value={values.serviceFee} onChange={(e) => set("serviceFee", e.target.value)} />
          </Field>
          <Field label="Shipping Fee (₱)">
            <input required type="number" className="input" value={values.shippingFee} onChange={(e) => set("shippingFee", e.target.value)} />
          </Field>
          <Field label="Discount (₱, optional)">
            <input type="number" className="input" value={values.discount} onChange={(e) => set("discount", e.target.value)} />
          </Field>
        </div>
        <div className="mt-3 rounded-sm border border-line p-4 text-sm">
          <span className="eyebrow text-mute">Final Selling Price</span>
          <div className="mt-1 font-mono text-xl">₱{estimatedTotal.toLocaleString()}</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Availability">
          <select className="input" value={values.availability} onChange={(e) => set("availability", e.target.value as ProductFormValues["availability"])}>
            <option value="AVAILABLE">Available</option>
            <option value="LIMITED_STOCK">Limited Stock</option>
            <option value="PREORDER">Preorder</option>
            <option value="SOLD_OUT">Sold Out</option>
          </select>
        </Field>
        <Field label="Estimated Arrival">
          <input required type="date" className="input" value={values.estimatedArrival} onChange={(e) => set("estimatedArrival", e.target.value)} />
        </Field>
      </section>

      <section className="flex flex-wrap gap-6">
        <Checkbox label="Best Seller" checked={values.isBestSeller} onChange={(v) => set("isBestSeller", v)} />
        <Checkbox label="New Arrival" checked={values.isNewArrival} onChange={(v) => set("isNewArrival", v)} />
        <Checkbox label="Limited Edition" checked={values.isLimitedEdition} onChange={(v) => set("isLimitedEdition", v)} />
      </section>

      <section>
        <Field label="Tags (comma-separated)">
          <input className="input" placeholder="omiyage, tokyo, cookies" value={values.tags} onChange={(e) => set("tags", e.target.value)} />
        </Field>
      </section>

      <section>
        <label className="eyebrow mb-1.5 block text-mute">Product Photos</label>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center gap-2 rounded-sm border border-dashed px-6 py-10 text-center transition-colors ${
            dragActive ? "border-ink bg-cloud" : "border-line"
          }`}
        >
          <span className="text-sm text-mute">
            {uploading ? "Uploading..." : "Drag and drop photos here, or"}
          </span>
          <label className="cursor-pointer rounded-sm border border-ink px-4 py-1.5 text-xs font-medium hover:bg-ink hover:text-paper">
            Choose Files
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          <span className="text-xs text-mute">JPG, PNG, WEBP, or GIF · max 10MB each</span>
        </div>
        {uploadError && <p className="mt-2 text-sm text-stamp">{uploadError}</p>}

        {values.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
            {values.images.map((url, i) => (
              <div key={url + i} className="group relative aspect-square overflow-hidden rounded-sm bg-cloud">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded-sm bg-ink/80 px-1.5 py-0.5 text-[10px] text-paper">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-ink/0 opacity-0 transition-opacity group-hover:bg-ink/50 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="rounded-sm bg-paper/90 px-1.5 py-1 text-xs disabled:opacity-30"
                    title="Move earlier"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="rounded-sm bg-stamp px-1.5 py-1 text-xs text-paper"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === values.images.length - 1}
                    className="rounded-sm bg-paper/90 px-1.5 py-1 text-xs disabled:opacity-30"
                    title="Move later"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-mute">
          The first photo is used as the product's cover image everywhere on the site.
        </p>
      </section>

      <button
        disabled={saving || uploading}
        className="w-full rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-transform hover:scale-[1.01] disabled:opacity-40"
      >
        {saving ? "Saving..." : uploading ? "Uploading photos..." : mode === "create" ? "Create Product" : "Save Changes"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e4e1d8;
          border-radius: 2px;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          background: #fafaf8;
        }
        .input:focus {
          outline: none;
          border-color: #111111;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow mb-1.5 block text-mute">{label}</label>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
