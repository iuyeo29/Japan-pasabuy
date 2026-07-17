import { prisma } from "./prisma";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface ProductInput {
  name: string;
  japaneseName?: string;
  sku: string;
  slug?: string;
  categoryId: string;
  brandName?: string;
  description: string;
  ingredients?: string;
  weightGrams?: number;
  dimensions?: string;
  japanPriceJPY: number;
  exchangeRate: number;
  serviceFee: number;
  shippingFee: number;
  discount?: number;
  availability: "AVAILABLE" | "LIMITED_STOCK" | "PREORDER" | "SOLD_OUT";
  estimatedArrival: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isLimitedEdition?: boolean;
  tags?: string[]; // tag names
  images?: string[]; // image URLs, in display order
}

/** Same formula as the price calculator in the original spec: Japan price -> exchange rate -> service fee -> shipping fee -> optional discount -> final price. */
function computeFinalPrice(input: ProductInput) {
  const converted = input.japanPriceJPY * input.exchangeRate;
  return Math.max(0, Math.round(converted + input.serviceFee + input.shippingFee - (input.discount ?? 0)));
}

async function resolveBrandId(brandName?: string) {
  if (!brandName?.trim()) return undefined;
  const brand = await prisma.brand.upsert({
    where: { slug: slugify(brandName) },
    update: {},
    create: { name: brandName.trim(), slug: slugify(brandName) },
  });
  return brand.id;
}

async function resolveTagIds(tagNames: string[] = []) {
  const ids: string[] = [];
  for (const raw of tagNames) {
    const name = raw.trim();
    if (!name) continue;
    const tag = await prisma.tag.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    ids.push(tag.id);
  }
  return ids;
}

export async function listAllProductsForAdmin() {
  return prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductForAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      tags: { include: { tag: true } },
      brand: true,
    },
  });
}

export async function createProductAdmin(input: ProductInput) {
  const brandId = await resolveBrandId(input.brandName);
  const tagIds = await resolveTagIds(input.tags);
  const finalPricePHP = computeFinalPrice(input);
  const slug = input.slug?.trim() || slugify(input.name);

  return prisma.product.create({
    data: {
      businessUnitId: (await ensurePasabuyBusinessUnitId()),
      categoryId: input.categoryId,
      brandId,
      sku: input.sku,
      name: input.name,
      japaneseName: input.japaneseName,
      slug,
      description: input.description,
      ingredients: input.ingredients,
      weightGrams: input.weightGrams,
      dimensions: input.dimensions,
      japanPriceJPY: input.japanPriceJPY,
      exchangeRate: input.exchangeRate,
      serviceFee: input.serviceFee,
      shippingFee: input.shippingFee,
      discount: input.discount ?? 0,
      finalPricePHP,
      availability: input.availability,
      estimatedArrival: new Date(input.estimatedArrival),
      isBestSeller: input.isBestSeller ?? false,
      isNewArrival: input.isNewArrival ?? false,
      isLimitedEdition: input.isLimitedEdition ?? false,
      images: { create: (input.images ?? []).map((url, i) => ({ url, position: i })) },
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
}

export async function updateProductAdmin(id: string, input: ProductInput) {
  const brandId = await resolveBrandId(input.brandName);
  const tagIds = await resolveTagIds(input.tags);
  const finalPricePHP = computeFinalPrice(input);
  const slug = input.slug?.trim() || slugify(input.name);

  // Replace images and tags wholesale rather than diffing — simplest
  // correct behavior for an admin form that resubmits the full list.
  return prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productTag.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
      data: {
        categoryId: input.categoryId,
        brandId,
        sku: input.sku,
        name: input.name,
        japaneseName: input.japaneseName,
        slug,
        description: input.description,
        ingredients: input.ingredients,
        weightGrams: input.weightGrams,
        dimensions: input.dimensions,
        japanPriceJPY: input.japanPriceJPY,
        exchangeRate: input.exchangeRate,
        serviceFee: input.serviceFee,
        shippingFee: input.shippingFee,
        discount: input.discount ?? 0,
        finalPricePHP,
        availability: input.availability,
        estimatedArrival: new Date(input.estimatedArrival),
        isBestSeller: input.isBestSeller ?? false,
        isNewArrival: input.isNewArrival ?? false,
        isLimitedEdition: input.isLimitedEdition ?? false,
        images: { create: (input.images ?? []).map((url, i) => ({ url, position: i })) },
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
  });
}

export async function setProductArchived(id: string, archived: boolean) {
  return prisma.product.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });
}

export async function duplicateProductAdmin(id: string) {
  const source = await prisma.product.findUnique({
    where: { id },
    include: { images: true, tags: { include: { tag: true } } },
  });
  if (!source) throw new Error("Product not found.");

  const copyName = `${source.name} (Copy)`;
  return prisma.product.create({
    data: {
      businessUnitId: source.businessUnitId,
      categoryId: source.categoryId,
      brandId: source.brandId,
      sku: `${source.sku}-COPY-${Date.now().toString().slice(-5)}`,
      name: copyName,
      japaneseName: source.japaneseName,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-5)}`,
      description: source.description,
      ingredients: source.ingredients,
      weightGrams: source.weightGrams,
      dimensions: source.dimensions,
      japanPriceJPY: source.japanPriceJPY,
      exchangeRate: source.exchangeRate,
      serviceFee: source.serviceFee,
      shippingFee: source.shippingFee,
      discount: source.discount,
      finalPricePHP: source.finalPricePHP,
      availability: "PREORDER",
      estimatedArrival: source.estimatedArrival,
      isBestSeller: false,
      isNewArrival: false,
      isLimitedEdition: source.isLimitedEdition,
      images: { create: source.images.map((i) => ({ url: i.url, position: i.position })) },
      tags: { create: source.tags.map((t) => ({ tagId: t.tagId })) },
    },
  });
}

let cachedBusinessUnitId: string | null = null;
async function ensurePasabuyBusinessUnitId() {
  if (cachedBusinessUnitId) return cachedBusinessUnitId;
  const unit = await prisma.businessUnit.upsert({
    where: { slug: "pasabuy" },
    update: {},
    create: { slug: "pasabuy", name: "Japan Pasabuy" },
  });
  cachedBusinessUnitId = unit.id;
  return unit.id;
}

export async function listCategoriesAdmin() {
  const businessUnitId = await ensurePasabuyBusinessUnitId();
  return prisma.category.findMany({ where: { businessUnitId }, orderBy: { name: "asc" } });
}
