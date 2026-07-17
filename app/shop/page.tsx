import { listProductsDb } from "@/lib/products";
import ShopClient from "@/components/ShopClient";

export default async function ShopPage() {
  const products = await listProductsDb();
  return <ShopClient products={products} />;
}
