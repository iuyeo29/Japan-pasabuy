import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="font-display text-lg italic">Japan Pasabuy PH</div>
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            Authentic Japanese goods, hand-purchased on the ground in Japan
            and brought home to you.
          </p>
        </div>
        <div>
          <div className="eyebrow text-paper/40">Shop</div>
          <ul className="mt-4 space-y-2 text-sm text-paper/70">
            <li><Link href="/shop">All Products</Link></li>
            <li><Link href="/shop?filter=best-seller">Best Sellers</Link></li>
            <li><Link href="/shop?filter=new-arrival">New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-paper/40">Company</div>
          <ul className="mt-4 space-y-2 text-sm text-paper/70">
            <li><Link href="/#faq">FAQ</Link></li>
            <li><Link href="/#trip">Japan Trips</Link></li>
            <li><Link href="/#contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow text-paper/40">Newsletter</div>
          <p className="mt-4 text-sm text-paper/60">
            Get notified before shopping deadlines close.
          </p>
          <form className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full rounded-sm border border-paper/20 bg-transparent px-3 py-2 text-sm placeholder:text-paper/40 focus:border-stamp focus:outline-none"
            />
            <button className="whitespace-nowrap rounded-sm bg-stamp px-4 py-2 text-sm font-medium transition-colors hover:bg-stamp-dark">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-paper/10 px-6 py-6 text-center text-xs text-paper/40">
        © {new Date().getFullYear()} Japan Pasabuy PH. All rights reserved.
      </div>
    </footer>
  );
}
