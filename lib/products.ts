import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { Product, Availability } from "./data";

const include = {
  brand: true,
  category: true,
  images: { orderBy: { position: "asc" as const } },
  tags: { include: { tag: true } },
} satisfies Prisma.ProductInclude;

type DbProduct = Prisma.ProductGetPayload<{ include: typeof include }>;

function toView(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    japaneseName: p.japaneseName ?? "",
    brand: p.brand?.name ?? "Unbranded",
    category: p.category.name,
    description: p.description,
    ingredients: p.ingredients ?? undefined,
    weightGrams: p.weightGrams ?? undefined,
    dimensions: p.dimensions ?? undefined,
    images: p.images.map((i) => i.url),
    japanPriceJPY: Number(p.japanPriceJPY),
    exchangeRate: Number(p.exchangeRate),
    serviceFee: Number(p.serviceFee),
    shippingFee: Number(p.shippingFee),
    finalPricePHP: Number(p.finalPricePHP),
    availability: p.availability as Availability,
    estimatedArrival: p.estimatedArrival ? p.estimatedArrival.toISOString() : "",
    tags: p.tags.map((t) => t.tag.name),
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    isLimitedEdition: p.isLimitedEdition,
    rating: 0,
    reviewCount: 0,
  };
}

/** Storefront-facing: only live (non-archived) products. */
export async function listProductsDb(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { archivedAt: null },
    include,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toView);
}

export async function getProductBySlugDb(slug: string): Promise<Product | null> {
  const row = await prisma.product.findFirst({
    where: { slug, archivedAt: null },
    include,
  });
  return row ? toView(row) : null;
}

export async function getRelatedProductsDb(product: Product): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      category: { name: product.category },
      slug: { not: product.slug },
      archivedAt: null,
    },
    include,
    take: 4,
  });
  return rows.map(toView);
}
