import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/data";
import { AvailabilityBadge, Tag } from "./StampBadge";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block animate-fadeUp"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cloud">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {(product.isNewArrival || product.isBestSeller || product.isLimitedEdition) && (
          <div className="absolute right-3 top-3">
            <Tag>
              {product.isLimitedEdition ? "Ltd" : product.isBestSeller ? "Best" : "New"}
            </Tag>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <div className="eyebrow text-mute">{product.brand}</div>
        <h3 className="font-display text-lg leading-snug">{product.name}</h3>
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-sm">
            ₱{product.finalPricePHP.toLocaleString()}
          </span>
          <AvailabilityBadge status={product.availability} />
        </div>
      </div>
    </Link>
  );
}
