import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlugDb, getRelatedProductsDb } from "@/lib/products";
import { Product } from "@/lib/data";
import { AvailabilityBadge } from "@/components/StampBadge";
import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlugDb(params.slug);
  if (!product) notFound();

  const related = await getRelatedProductsDb(product);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden bg-cloud">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden bg-cloud">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="eyebrow text-mute">{product.brand}</div>
          <h1 className="mt-2 font-display text-3xl italic leading-tight">
            {product.name}
          </h1>
          <p className="mt-1 text-mute">{product.japaneseName}</p>

          <div className="mt-4 flex items-center gap-3">
            <AvailabilityBadge status={product.availability} />
            <span className="text-xs text-mute">SKU: {product.sku}</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-mono text-3xl">
              ₱{product.finalPricePHP.toLocaleString()}
            </span>
            <span className="text-sm text-mute">
              Est. arrival {new Date(product.estimatedArrival).toLocaleDateString("en-PH", { month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="mt-8">
            <ProductActions product={product} />
          </div>

          <div className="mt-10 space-y-6 border-t border-line pt-8">
            <p className="text-sm leading-relaxed text-mute">{product.description}</p>

            <PriceBreakdown product={product} />

            <dl className="grid grid-cols-2 gap-4 text-sm">
              {product.weightGrams && (
                <Detail label="Weight" value={`${product.weightGrams} g`} />
              )}
              {product.dimensions && (
                <Detail label="Dimensions" value={product.dimensions} />
              )}
              {product.ingredients && (
                <Detail label="Ingredients" value={product.ingredients} full />
              )}
            </dl>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="rounded-sm bg-cloud px-3 py-1 text-xs text-mute">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl italic">Related Products</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PriceBreakdown({ product }: { product: Product }) {
  if (!product) return null;
  const rows = [
    ["Japan Price", `¥${product.japanPriceJPY.toLocaleString()}`],
    ["Exchange Rate", `₱${product.exchangeRate.toFixed(3)} / ¥`],
    ["Service Fee", `₱${product.serviceFee}`],
    ["Shipping Fee", `₱${product.shippingFee}`],
  ] as const;
  return (
    <div className="rounded-sm border border-line p-4">
      <div className="eyebrow mb-3 text-mute">Price Breakdown</div>
      <div className="space-y-1.5 font-mono text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-mute">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-line pt-1.5 font-medium text-ink">
          <span>Final Price</span>
          <span>₱{product.finalPricePHP.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <dt className="eyebrow text-mute">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
