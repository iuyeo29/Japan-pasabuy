"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useCart } from "@/lib/cart-context";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/#trip", label: "Japan Trip" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="hanko h-8 w-8 text-stamp">
            <span className="font-display text-sm italic">J</span>
          </span>
          <span className="font-display text-lg tracking-tight">
            Japan Pasabuy <span className="italic text-stamp">PH</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="eyebrow text-mute transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/products" className="eyebrow text-stamp transition-colors hover:text-stamp-dark">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            className="hidden text-ink/70 transition-colors hover:text-stamp md:block"
          >
            <Search size={20} />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-ink/70 transition-colors hover:text-stamp"
          >
            <ShoppingBag size={22} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-stamp text-[10px] text-paper">
                {count}
              </span>
            )}
          </Link>
          <button
            aria-label="Menu"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="eyebrow hidden text-mute hover:text-ink md:block">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-line px-6 py-4 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="eyebrow text-mute"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
