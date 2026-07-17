"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Minus, Plus } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";

export default function ProductActions({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const soldOut = product.availability === "SOLD_OUT";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-sm border border-line">
          <button
            aria-label="Decrease quantity"
            className="px-3 py-2 text-mute hover:text-ink disabled:opacity-30"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center font-mono text-sm">{qty}</span>
          <button
            aria-label="Increase quantity"
            className="px-3 py-2 text-mute hover:text-ink"
            onClick={() => setQty((q) => q + 1)}
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => setWishlisted((w) => !w)}
          aria-label="Add to wishlist"
          className={`rounded-sm border p-2.5 transition-colors ${
            wishlisted ? "border-stamp text-stamp" : "border-line text-mute hover:text-ink"
          }`}
        >
          <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        <button
          aria-label="Share product"
          className="rounded-sm border border-line p-2.5 text-mute hover:text-ink"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: product.name, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <Share2 size={18} />
        </button>
      </div>

      <button
        disabled={soldOut}
        onClick={() => {
          addItem(product, qty);
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 1800);
        }}
        className="w-full rounded-sm bg-ink py-3.5 text-sm font-medium text-paper transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {soldOut ? "Sold Out" : justAdded ? "Added to Cart ✓" : "Reserve Now"}
      </button>

      {justAdded && (
        <button
          onClick={() => router.push("/cart")}
          className="w-full text-center text-sm text-stamp underline underline-offset-4"
        >
          View cart
        </button>
      )}
    </div>
  );
}
