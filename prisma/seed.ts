import { PrismaClient } from "@prisma/client";
import { products as seedProducts, categories as seedCategories } from "../lib/data";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const businessUnit = await prisma.businessUnit.upsert({
    where: { slug: "pasabuy" },
    update: {},
    create: { slug: "pasabuy", name: "Japan Pasabuy" },
  });

  const categoryMap = new Map<string, string>();
  for (const name of seedCategories) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), businessUnitId: businessUnit.id },
    });
    categoryMap.set(name, category.id);
  }

  const brandMap = new Map<string, string>();
  for (const p of seedProducts) {
    if (brandMap.has(p.brand)) continue;
    const brand = await prisma.brand.upsert({
      where: { slug: slugify(p.brand) },
      update: {},
      create: { name: p.brand, slug: slugify(p.brand) },
    });
    brandMap.set(p.brand, brand.id);
  }

  for (const p of seedProducts) {
    const categoryId = categoryMap.get(p.category);
    const brandId = brandMap.get(p.brand);
    if (!categoryId || !brandId) continue;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        finalPricePHP: p.finalPricePHP,
        availability: p.availability,
      },
      create: {
        businessUnitId: businessUnit.id,
        categoryId,
        brandId,
        sku: p.sku,
        name: p.name,
        japaneseName: p.japaneseName,
        slug: p.slug,
        description: p.description,
        ingredients: p.ingredients,
        weightGrams: p.weightGrams,
        dimensions: p.dimensions,
        japanPriceJPY: p.japanPriceJPY,
        exchangeRate: p.exchangeRate,
        serviceFee: p.serviceFee,
        shippingFee: p.shippingFee,
        finalPricePHP: p.finalPricePHP,
        availability: p.availability,
        estimatedArrival: new Date(p.estimatedArrival),
        isBestSeller: p.isBestSeller ?? false,
        isNewArrival: p.isNewArrival ?? false,
        isLimitedEdition: p.isLimitedEdition ?? false,
        images: { create: p.images.map((url, i) => ({ url, position: i })) },
      },
    });
  }

  console.log(`Seeded ${seedProducts.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
