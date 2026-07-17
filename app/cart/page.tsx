"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { upcomingTrip } from "@/lib/data";

export default function CartPage() {
  const { lines, removeItem, setQuantity, subtotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl italic">Your cart is empty</h1>
        <p className="mt-3 text-mute">
          Nothing reserved yet. Browse the catalog before the next shopping
          deadline closes.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-sm bg-ink px-7 py-3 text-sm font-medium text-paper"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl italic md:text-4xl">Your Cart</h1>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {lines.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-5 py-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-cloud">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex justify-between">
                <div>
                  <div className="eyebrow text-mute">{product.brand}</div>
                  <Link href={`/product/${product.slug}`} className="font-display text-lg hover:text-stamp">
                    {product.name}
                  </Link>
                </div>
                <button
                  onClick={() => removeItem(product.id)}
                  aria-label="Remove item"
                  className="h-fit text-mute hover:text-stamp"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-sm border border-line">
                  <button
                    className="px-2.5 py-1.5 text-mute hover:text-ink"
                    onClick={() => setQuantity(product.id, quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-mono text-sm">{quantity}</span>
                  <button
                    className="px-2.5 py-1.5 text-mute hover:text-ink"
                    onClick={() => setQuantity(product.id, quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-mono text-sm">
                  ₱{(product.finalPricePHP * quantity).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-2">
        <div className="flex w-full max-w-xs justify-between text-sm text-mute">
          <span>Subtotal</span>
          <span className="font-mono">₱{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between text-sm text-mute">
          <span>Est. Arrival</span>
          <span className="font-mono">
            {new Date(upcomingTrip.estimatedDelivery).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="mt-2 flex w-full max-w-xs justify-between border-t border-line pt-2 font-medium">
          <span>Total</span>
          <span className="font-mono">₱{subtotal.toLocaleString()}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 w-full max-w-xs rounded-sm bg-ink py-3.5 text-center text-sm font-medium text-paper transition-transform hover:scale-[1.01]"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
