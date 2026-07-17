import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Countdown from "@/components/Countdown";
import { categories, upcomingTrip, faqs } from "@/lib/data";
import { listProductsDb } from "@/lib/products";
import type { Product } from "@/lib/data";

const steps = [
  {
    title: "Reserve & Pay",
    body: "Browse the catalog and reserve items before the shopping deadline. Payment is required upfront via GCash, Maya, or bank transfer.",
  },
  {
    title: "We Buy It In Japan",
    body: "Once your payment is verified, your items are personally purchased during the scheduled Japan trip.",
  },
  {
    title: "Shipped Home",
    body: "Items are packed, shipped, and tracked every step of the way back to the Philippines.",
  },
  {
    title: "Delivered To You",
    body: "Pick up or receive delivery once your order clears customs and arrives at our facility.",
  },
];

const reviews = [
  {
    name: "Maria S.",
    text: "Ordered Royce chocolates for a gift — arrived perfectly chilled and packed. Tracking updates the whole way were reassuring.",
  },
  {
    name: "Jerome V.",
    text: "The price breakdown is transparent, no surprise fees. I know exactly what I'm paying for before I commit.",
  },
  {
    name: "Angela R.",
    text: "First time trying a pasabuy service and the payment verification process actually made me trust it more.",
  },
];

export default async function HomePage() {
  const products = await listProductsDb();
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNewArrival);
  const limited = products.filter((p) => p.isLimitedEdition);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fadeUp">
            <div className="eyebrow text-stamp">Personally sourced in Japan</div>
            <h1 className="mt-4 font-display text-4xl italic leading-[1.1] md:text-6xl">
              Japan, brought
              <br />
              home to you.
            </h1>
            <p className="mt-6 max-w-md text-mute">
              Reserve authentic Japanese products before each buying trip.
              Every item is hand-selected and personally purchased in Japan —
              never drop-shipped, never guessed at.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-sm bg-ink px-7 py-3 text-sm font-medium text-paper transition-transform hover:scale-[1.02]"
              >
                Browse Catalog
              </Link>
              <Link
                href="#trip"
                className="rounded-sm border border-ink px-7 py-3 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
              >
                See Next Trip
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] animate-fadeUp overflow-hidden bg-cloud">
            <Image
              src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=1200"
              alt="Japanese street scene"
              fill
              className="object-cover"
              priority
            />
            <div className="hanko absolute bottom-6 right-6 h-20 w-20 bg-paper/90 text-stamp">
              <span className="eyebrow text-center text-[9px] leading-tight">
                Personally
                <br />
                Purchased
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/shop?category=${encodeURIComponent(c)}`}
              className="rounded-sm border border-line px-5 py-2 text-sm transition-colors hover:border-ink"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <Rail title="Best Sellers" subtitle="Consistently reordered, trip after trip." items={bestSellers} />

      {/* New Arrivals */}
      <Rail title="New Arrivals" subtitle="Just added to the upcoming trip's list." items={newArrivals} />

      {/* Limited Edition */}
      <Rail title="Limited Edition" subtitle="Seasonal releases — once they're gone, they're gone." items={limited} />

      {/* Japan Trip / Countdown */}
      <section id="trip" className="bg-ink py-20 text-paper">
        <div className="mx-auto max-w-7xl px-6">
          <div className="eyebrow text-stamp">Upcoming Buying Trip</div>
          <h2 className="mt-3 font-display text-3xl italic md:text-4xl">
            {upcomingTrip.name}
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <div className="eyebrow text-paper/50">Shopping deadline closes in</div>
              <div className="mt-3">
                <Countdown target={upcomingTrip.shoppingDeadline} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <Info label="Departure" value={upcomingTrip.departureDate} />
              <Info label="Return" value={upcomingTrip.arrivalDate} />
              <Info label="Est. Delivery" value={upcomingTrip.estimatedDelivery} />
              <Info
                label="Slots Remaining"
                value={`${upcomingTrip.slotsRemaining} / ${upcomingTrip.maxOrders}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="eyebrow text-stamp">The Process</div>
        <h2 className="mt-3 font-display text-3xl italic md:text-4xl">
          How pasabuy works
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title}>
              <div className="font-mono text-sm text-stamp">0{i + 1}</div>
              <h3 className="mt-3 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-mute">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="border-y border-line bg-cloud py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="eyebrow text-stamp">Customer Reviews</div>
          <h2 className="mt-3 font-display text-3xl italic md:text-4xl">
            Trusted, trip after trip
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.name} className="rounded-sm bg-paper p-6">
                <p className="font-display text-lg italic leading-relaxed">
                  “{r.text}”
                </p>
                <div className="eyebrow mt-4 text-mute">— {r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-6 py-20">
        <div className="eyebrow text-stamp">Questions</div>
        <h2 className="mt-3 font-display text-3xl italic md:text-4xl">FAQ</h2>
        <div className="mt-10 divide-y divide-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg">
                {f.q}
                <span className="ml-4 text-stamp transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-mute">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-sm border border-line p-10 text-center">
          <h2 className="font-display text-2xl italic">Still have questions?</h2>
          <p className="mt-2 text-sm text-mute">
            Reach us directly and we'll get back to you before the next trip closes.
          </p>
          <a
            href="mailto:hello@japanpasabuy.ph"
            className="mt-6 inline-block rounded-sm bg-ink px-7 py-3 text-sm font-medium text-paper"
          >
            hello@japanpasabuy.ph
          </a>
        </div>
      </section>
    </div>
  );
}

function Rail({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Product[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl italic md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-mute">{subtitle}</p>
        </div>
        <Link href="/shop" className="eyebrow text-mute hover:text-ink">
          View All
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow text-paper/50">{label}</div>
      <div className="mt-1 font-mono">{value}</div>
    </div>
  );
}
