import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getProductForAdmin } from "@/lib/admin-products";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  // Middleware already gates /admin/*, but this is the page that actually
  // touches product data, so it checks again rather than trusting that
  // upstream layer alone.
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (!userId || role !== "admin") redirect("/");

  const product = await getProductForAdmin(params.id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="eyebrow text-stamp">Admin</div>
      <h1 className="mt-1 font-display text-3xl italic">Edit Product</h1>
      <div className="mt-8">
        <ProductForm
          mode="edit"
          productId={product.id}
          initialValues={{
            name: product.name,
            japaneseName: product.japaneseName ?? "",
            sku: product.sku,
            slug: product.slug,
            categoryId: product.categoryId,
            brandName: product.brand?.name ?? "",
            description: product.description,
            ingredients: product.ingredients ?? "",
            weightGrams: product.weightGrams?.toString() ?? "",
            dimensions: product.dimensions ?? "",
            japanPriceJPY: product.japanPriceJPY.toString(),
            exchangeRate: product.exchangeRate.toString(),
            serviceFee: product.serviceFee.toString(),
            shippingFee: product.shippingFee.toString(),
            discount: product.discount.toString(),
            availability: product.availability,
            estimatedArrival: product.estimatedArrival.toISOString().slice(0, 10), Replace it with: estimatedArrival: product.estimatedArrival ? product.estimatedArrival.toISOString().slice(0, 10) : "",
            isBestSeller: product.isBestSeller,
            isNewArrival: product.isNewArrival,
            isLimitedEdition: product.isLimitedEdition,
            tags: product.tags.map((t) => t.tag.name).join(", "),
            images: product.images.map((i) => i.url),
          }}
        />
      </div>
    </div>
  );
}
