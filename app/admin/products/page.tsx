"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";

interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  finalPricePHP: string | number;
  availability: string;
  archivedAt: string | null;
  category: { name: string };
  brand: { name: string } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products.");
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleArchive(id: string, archived: boolean) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function duplicate(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/products/${id}/duplicate`, { method: "POST" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow text-stamp">Admin</div>
          <h1 className="mt-1 font-display text-3xl italic">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-paper"
        >
          <Plus size={16} /> New Product
        </Link>
      </div>

      {error && <p className="mt-6 rounded-sm bg-stamp-light p-4 text-sm text-stamp">{error}</p>}

      {loading ? (
        <p className="mt-8 text-mute">Loading…</p>
      ) : (
        <div className="mt-8 divide-y divide-line border-y border-line">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg not-italic">{p.name}</span>
                  {p.archivedAt && (
                    <span className="rounded-sm bg-cloud px-2 py-0.5 text-xs text-mute">Archived</span>
                  )}
                </div>
                <div className="text-sm text-mute">
                  {p.brand?.name ?? "Unbranded"} · {p.category.name} · SKU {p.sku}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="font-mono text-sm">₱{Number(p.finalPricePHP).toLocaleString()}</span>
                <span className="eyebrow text-mute">{p.availability.replace("_", " ")}</span>
                <Link href={`/admin/products/${p.id}/edit`} className="text-mute hover:text-ink" title="Edit">
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => duplicate(p.id)}
                  disabled={busyId === p.id}
                  className="text-mute hover:text-ink disabled:opacity-30"
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => toggleArchive(p.id, !p.archivedAt)}
                  disabled={busyId === p.id}
                  className="text-mute hover:text-stamp disabled:opacity-30"
                  title={p.archivedAt ? "Unarchive" : "Archive"}
                >
                  {p.archivedAt ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="py-12 text-center text-mute">No products yet — create your first one.</p>
          )}
        </div>
      )}
    </div>
  );
}
