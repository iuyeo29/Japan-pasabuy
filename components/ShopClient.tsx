"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories, Availability, Product } from "@/lib/data";

type SortKey = "featured" | "price-asc" | "price-desc";

export default function ShopClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [sort, setSort] = useState<SortKey>("featured");

  const results = useMemo(() => {
    let list = products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCategory = !category || p.category === category;
      const matchesAvailability = !availability || p.availability === availability;
      return matchesQuery && matchesCategory && matchesAvailability;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.finalPricePHP - b.finalPricePHP);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.finalPricePHP - a.finalPricePHP);

    return list;
  }, [products, query, category, availability, sort]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="eyebrow text-stamp">Full Catalog</div>
      <h1 className="mt-3 font-display text-3xl italic md:text-4xl">Shop</h1>

      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, brand, tag..."
            className="w-full rounded-sm border border-line bg-paper py-2.5 pl-10 pr-3 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-sm border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={!category} label="All Categories" onClick={() => setCategory(null)} />
        {categories.map((c) => (
          <FilterChip key={c} active={category === c} label={c} onClick={() => setCategory(c)} />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip active={!availability} label="Any Availability" onClick={() => setAvailability(null)} />
        {(["AVAILABLE", "LIMITED_STOCK", "PREORDER", "SOLD_OUT"] as Availability[]).map((a) => (
          <FilterChip
            key={a}
            active={availability === a}
            label={a.replace("_", " ")}
            onClick={() => setAvailability(a)}
          />
        ))}
      </div>

      <p className="mt-6 text-sm text-mute">{results.length} products</p>

      {results.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center text-mute">
          Nothing matches that search. Try a different term or clear your filters.
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm border px-4 py-1.5 text-xs transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-line text-mute hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
